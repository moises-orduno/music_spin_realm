from fastapi import APIRouter, Depends, HTTPException, status

from db.mongodb import db
from helpers.token_helper import get_current_user
from models.checkout import ShippingAddressSnapshot
from models.order import OrderCreateRequest, OrderItem, OrderResponse, OrderStatus, PaymentStatus
from models.marketplace import ListingStatus
from datetime import datetime, timezone, timedelta
from uuid import uuid4
from pymongo import ReturnDocument

router = APIRouter(prefix="/order", tags=["Order"])

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=dict,
)
async def create_order(
    payload: OrderCreateRequest,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["id"])
    now = datetime.now(timezone.utc)

    order_id = str(uuid4())
    reservation_expires_at = now + timedelta(minutes=15)

    # 1. Retrieve cart
    cart = await db.carts.find_one(
        {"user_id": user_id},
        {"_id": 0},
    )

    if not cart or not cart.get("items"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your cart is empty",
        )

    # 2. Verify shipping address ownership
    address = await db.shipping_addresses.find_one(
        {
            "id": payload.shipping_address_id,
            "user_id": user_id,
        },
        {"_id": 0},
    )

    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping address not found",
        )

    # Convert the saved address into a typed, immutable snapshot
    shipping_address = ShippingAddressSnapshot.model_validate(
        address
    ).model_dump()

    reserved_ids = []
    order_created = False

    try:
        order_items = []
        subtotal = 0.0
        currency = None

        # 3. Reserve each listing atomically
        for cart_item in cart["items"]:
            listing_id = cart_item.get("listing_id")
            quantity = cart_item.get("quantity", 1)

            if not listing_id or quantity != 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid cart item or quantity.",
                )

            listing = await db.recommended_listings.find_one_and_update(
                {
                    "id": listing_id,
                    "status": "available",
                },
                {
                    "$set": {
                        "status": "reserved",
                        "reserved_by": user_id,
                        "reservation_order_id": order_id,
                        "reserved_at": now,
                        "reservation_expires_at": reservation_expires_at,
                    }
                },
                return_document=ReturnDocument.BEFORE,
                projection={"_id": 0},
            )

            if listing is None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "message": (
                            "An item is no longer available. "
                            "Please refresh your cart."
                        ),
                        "listing_id": listing_id,
                    },
                )

            reserved_ids.append(listing_id)

            # 4. Read price and currency exclusively from the database
            try:
                price = float(listing["price"])
            except (KeyError, TypeError, ValueError):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Invalid price for listing {listing_id}.",
                )

            if price < 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Invalid price for listing {listing_id}.",
                )

            item_currency = listing.get("currency")

            if not item_currency:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Missing currency for listing {listing_id}.",
                )

            if currency is None:
                currency = item_currency
            elif currency != item_currency:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="All items must use the same currency.",
                )

            subtotal += price

            # 5. Build typed item snapshots
            # 5. Fetch album details and build an immutable item snapshot
            album_id = listing.get("album_id")

            if not album_id:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Missing album_id for listing {listing_id}.",
                )

            album = await db.albums.find_one(
                {"id": album_id},
                {
                    "_id": 0,
                    "id": 1,
                    "title": 1,
                    "artist": 1,
                    "cover_url": 1,
                },
            )

            if not album:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Album not found for listing {listing_id}.",
                )

            # ArtistReference is stored as an object; adapt this to its actual fields.
            artist_data = album.get("artist") or {}

            if isinstance(artist_data, dict):
                artist_name = (
                    artist_data.get("name")
                    or artist_data.get("title")
                    or ""
                )
            else:
                artist_name = str(artist_data)

            order_items.append(
                OrderItem(
                    listing_id=listing_id,
                    album_id=album["id"],
                    title=album["title"],
                    artist=artist_name or None,
                    cover_url=album.get("cover_url"),
                    quantity=1,
                    unit_price=price,
                    currency=item_currency,
                )
            )

        subtotal = round(subtotal, 2)

        # TODO: Replace with your actual shipping calculation
        shipping_cost = 0.0
        total = round(subtotal + shipping_cost, 2)

        # 6. Build the complete order on the server
        order = OrderResponse(
            id=order_id,
            status=OrderStatus.PENDING_PAYMENT,
            payment_status=PaymentStatus.PENDING,
            items=order_items,
            shipping_address=shipping_address,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total=total,
            currency=currency,
            created_at=now,
            updated_at=now,
        )

        # Store a JSON-compatible document
        order_document = order.model_dump(mode="python")
        order_document["user_id"] = user_id
        order_document["reservation_expires_at"] = reservation_expires_at

        await db.orders.insert_one(order_document)
        order_created = True

        # Clear the cart after the order is successfully created
        await db.carts.update_one(
            {"user_id": user_id},
            {"$set": {"items": []}},
        )

        # 7. Return the typed order
        return {
            "message": "Order created; payment is pending.",
            "order": order,
        }

    except Exception:
        # Roll back only reservations belonging to this order.
        # Never release another checkout's reservation.
        if not order_created:
            for listing_id in reserved_ids:
                await db.recommended_listings.update_one(
                    {
                        "id": listing_id,
                        "status": ListingStatus.RESERVED.value,
                        "reservation_order_id": order_id,
                    },
                    {
                        "$set": {
                            "status": ListingStatus.AVAILABLE.value,
                        },
                        "$unset": {
                            "reserved_by": "",
                            "reservation_order_id": "",
                            "reserved_at": "",
                            "reservation_expires_at": "",
                        },
                    },
                )

        raise

ACTIVE_ORDER_STATUSES = [
    OrderStatus.PENDING_PAYMENT.value,
    OrderStatus.CONFIRMED.value,
    OrderStatus.PROCESSING.value,
    OrderStatus.SHIPPED.value,
]

CANCELLED_ORDER_STATUSES = [
    OrderStatus.CANCELLED.value,
    OrderStatus.EXPIRED.value,
]

@router.get("/active")
async def get_active_orders(
    current_user=Depends(get_current_user),
    response_model=list[OrderResponse]
):
    user_id = str(current_user["id"])

    cursor = db.orders.find(
        {
            "user_id": user_id,
            "status": {"$in": ACTIVE_ORDER_STATUSES},
        },
        {"_id": 0},
    ).sort("created_at", -1)

    orders = await cursor.to_list(length=100)

    return [OrderResponse.model_validate(doc) for doc in orders]

@router.get("/completed")
async def get_completed_orders(
    current_user=Depends(get_current_user),
    response_model=list[OrderResponse]
):
    user_id = str(current_user["id"])

    cursor = db.orders.find(
        {
            "user_id": user_id,
            "status": {"$in": OrderStatus.DELIVERED},
        },
        {"_id": 0},
    ).sort("created_at", -1)

    orders = await cursor.to_list(length=100)

    return [OrderResponse.model_validate(doc) for doc in orders]

@router.get("/cancelled")
async def get_cancelled_orders(
    current_user=Depends(get_current_user),
    response_model=list[OrderResponse]
):
    user_id = str(current_user["id"])

    cursor = db.orders.find(
        {
            "user_id": user_id,
            "status": {"$in": CANCELLED_ORDER_STATUSES},
        },
        {"_id": 0},
    ).sort("created_at", -1)

    orders = await cursor.to_list(length=100)

    return [OrderResponse.model_validate(doc) for doc in orders]