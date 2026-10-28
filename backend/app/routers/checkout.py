from fastapi import APIRouter, Depends, HTTPException, status

from db.mongodb import db
from helpers.token_helper import get_current_user
from models.checkout import CheckoutValidateRequest

router = APIRouter(prefix="/checkout", tags=["Checkout"])

@router.post("/validate")
async def validate_checkout(
    payload: CheckoutValidateRequest,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["id"])

    # 1. Get the user's cart
    cart = await db.carts.find_one(
        {"user_id": user_id},
        {"_id": 0},
    )

    if not cart or not cart.get("items"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your cart is empty",
        )

    # 2. Verify the shipping address belongs to the user
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

    # 3. Validate every listing and calculate prices from the database
    checkout_items = []
    unavailable_items = []
    subtotal = 0.0
    currencies = set()

    for cart_item in cart["items"]:
        listing_id = cart_item["listing_id"]

        listing = await db.recommended_listings.find_one(
            {"id": listing_id},
            {"_id": 0},
        )

        if not listing:
            unavailable_items.append({
                "listing_id": listing_id,
                "reason": "Listing not found",
            })
            continue

        if listing.get("status") != "available":
            unavailable_items.append({
                "listing_id": listing_id,
                "reason": "Listing is no longer available",
            })
            continue

        quantity = cart_item.get("quantity", 1)

        if quantity < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid quantity for listing {listing_id}",
            )

        price = float(listing["price"])
        currency = listing.get("currency", "USD")

        currencies.add(currency)

        checkout_items.append({
            "listing_id": listing["id"],
            "album_id": listing["album_id"],
            "quantity": quantity,
            "unit_price": price,
            "currency": currency,
        })

        subtotal += price * quantity

    # 4. Stop checkout if any listing is unavailable
    if unavailable_items:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": "Some items in your cart are no longer available",
                "unavailable_items": unavailable_items,
            },
        )

    # 5. Ensure the order uses a single currency
    if len(currencies) != 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All items must use the same currency",
        )

    currency = next(iter(currencies))

    # Shipping cost should be calculated using your shipping rules.
    shipping_cost = 0.0
    total = round(subtotal + shipping_cost, 2)

    # 6. Return the validated checkout summary
    return {
        "valid": True,
        "items": checkout_items,
        "shipping_address": address,
        "subtotal": round(subtotal, 2),
        "shipping_cost": shipping_cost,
        "total": total,
        "currency": currency,
    }
