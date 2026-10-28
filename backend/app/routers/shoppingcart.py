from helpers.token_helper import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone

router = APIRouter(prefix="/cart", tags=["Cart"])
from db.mongodb import db
from models.shoppingcart import AddToCartRequest

@router.get("")
async def get_cart(
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["id"])

    cart = await db.carts.find_one(
        {"user_id": user_id},
        {"_id": 0},
    )

    if not cart or not cart.get("items"):
        return {
            "items": [],
            "item_count": 0,
            "subtotal": 0,
            "currency": "USD",
        }

    cart_items = cart.get("items", [])

    # Fetch recommended listings referenced by the cart
    listing_ids = list({
        item["listing_id"]
        for item in cart_items
        if item.get("listing_id")
    })

    listings_cursor = db.recommended_listings.find({
        "id": {"$in": listing_ids},
        "status": "available",
    })

    listings = await listings_cursor.to_list(length=None)

    listings_by_id = {
        listing["id"]: listing
        for listing in listings
    }

    # Fetch albums referenced by those listings
    album_ids = list({
        listing["album_id"]
        for listing in listings
        if listing.get("album_id")
    })

    albums_cursor = db.albums.find({
        "id": {"$in": album_ids},
    })

    albums = await albums_cursor.to_list(length=None)

    albums_by_id = {
        album["id"]: album
        for album in albums
    }

    response_items = []
    subtotal = 0
    currency = "USD"

    for cart_item in cart_items:
        listing_id = cart_item.get("listing_id")
        listing = listings_by_id.get(listing_id)

        if not listing:
            continue

        album = albums_by_id.get(listing.get("album_id"))

        if not album:
            continue

        price = float(listing.get("price", 0))
        quantity = int(cart_item.get("quantity", 1))
        item_currency = listing.get("currency", "USD")

        subtotal += price * quantity
        currency = item_currency

        artist = album.get("artist") or {}

        response_items.append({
            "listing_id": listing["id"],
            "album_id": album["id"],

            "quantity": quantity,
            "price": price,
            "currency": item_currency,
            "line_total": round(price * quantity, 2),

            # Album details
            "album": {
                "id": album["id"],
                "title": album["title"],
                "artist": (
                    artist.get("name", "")
                    if isinstance(artist, dict)
                    else artist
                ),
                "year": album.get("year"),
                "cover_url": album.get("cover_url"),
            },

            # Marketplace listing details
            "listing": {
                "status": listing.get("status"),
                "pressing_country": listing.get("pressing_country"),
                "pressing_year": listing.get("pressing_year"),
                "label": listing.get("label"),
                "catalog_number": listing.get("catalog_number"),
                "pressing_description": listing.get("pressing_description"),
                "format": listing.get("format"),
                "media_condition": listing.get("media_condition"),
                "sleeve_condition": listing.get("sleeve_condition"),
                "images": listing.get("images", []),
            },
        })

    return {
        "items": response_items,
        "item_count": sum(
            item["quantity"] for item in response_items
        ),
        "subtotal": round(subtotal, 2),
        "currency": currency,
    }

@router.post("")
async def add_to_cart(
    payload: AddToCartRequest,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["id"])
    now = datetime.now(timezone.utc)
    listing_id = payload.listing_id

    # Verify the listing exists and is available
    listing = await db.recommended_listings.find_one({
        "id": listing_id,
        "status": "available",
    })

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found or is no longer available",
        )

    # Find the user's cart
    cart = await db.carts.find_one({
        "user_id": user_id,
    })

    if cart:
        items = cart.get("items", [])

        # Prevent duplicate listing entries
        if any(
            item.get("listing_id") == listing_id
            for item in items
        ):
            raise HTTPException(
                status_code=409,
                detail="This listing is already in your cart",
            )

        await db.carts.update_one(
            {"user_id": user_id},
            {
                "$push": {
                    "items": {
                        "listing_id": listing_id,
                        "quantity": 1,
                        "added_at": now,
                    }
                },
                "$set": {
                    "updated_at": now,
                },
            },
        )

    else:
        # Create a new cart for the user
        await db.carts.insert_one({
            "user_id": user_id,
            "items": [
                {
                    "listing_id": listing_id,
                    "quantity": 1,
                    "added_at": now,
                }
            ],
            "created_at": now,
            "updated_at": now,
        })

    return {
        "message": "Item added to cart",
        "listing_id": listing_id,
        "quantity": 1,
    }

@router.delete("/{listing_id}")
async def remove_from_cart(
    listing_id: str,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["id"])

    cart = await db.carts.find_one({
        "user_id": user_id,
    })

    if not cart:
        raise HTTPException(
            status_code=404,
            detail="Cart not found",
        )

    items = cart.get("items", [])

    # Check that the listing is in the cart
    if not any(
        item.get("listing_id") == listing_id
        for item in items
    ):
        raise HTTPException(
            status_code=404,
            detail="Item not found in cart",
        )

    # Remove the item
    updated_items = [
        item for item in items
        if item.get("listing_id") != listing_id
    ]

    await db.carts.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "items": updated_items,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return {
        "message": "Item removed from cart",
        "items": updated_items,
        "item_count": sum(
            item.get("quantity", 1)
            for item in updated_items
        ),
    }