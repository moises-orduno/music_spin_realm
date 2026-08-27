from fastapi import APIRouter, Depends, HTTPException
from db.mongodb import db
from models.marketplace import RecommendedListingCreate
from fastapi import APIRouter
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId

from helpers.token_helper import get_current_user
from db.mongodb import db

router = APIRouter(
    prefix="/marketplace",
    tags=["Marketplace"]
)
from typing import Optional

@router.get("/recommended-listings")
async def get_recommended_listings(
    limit: int = 10
):
    listings = await (
        db.recommended_listings
        .find(
            {"status": "available"},
            {"_id": 0}
        )
        .sort("created_at", -1)
        .to_list(limit)
    )

    return listings

@router.get("/albums/{album_id}/listings")
async def get_album_listings(
    album_id: str,
    limit: int = 10
):
    listings = await (
        db.recommended_listings
        .find(
            {
                "album.id": album_id,
                "status": "available"
            },
            {"_id": 0}
        )
        .sort("created_at", -1)
        .to_list(limit)
    )

    return listings

@router.post("/recommended-listings")
async def create_recommended_listing(
    listing: RecommendedListingCreate
):
    # Find album
    album = await db.albums.find_one(
        {"id": listing.album_id},
        {"_id": 0}
    )

    if not album:
        raise HTTPException(
            status_code=404,
            detail="Album not found"
        )

    # Create recommendation/listing
    recommended_listing = {
        "album": album,

        # Sale
        "price": listing.price,
        "currency": listing.currency,

        # Pressing
        "pressing_country": listing.pressing_country,
        "pressing_year": listing.pressing_year,
        "label": listing.label,
        "catalog_number": listing.catalog_number,
        "pressing_description": listing.pressing_description,

        # Format
        "format": listing.format,
        "speed": listing.speed,
        "channels": listing.channels,

        # Condition
        "media_condition": listing.media_condition,
        "sleeve_condition": listing.sleeve_condition,

        # Additional details
        "matrix_runout": listing.matrix_runout,
        "edition": listing.edition,
        "mastering": listing.mastering,
        "notes": listing.notes,

        # Images
        "images": listing.images,

        "status": "available",
        "created_at": datetime.now(timezone.utc)
    }

    await db.recommended_listings.insert_one(
        recommended_listing
    )

    # MongoDB adds _id, which shouldn't be returned
    recommended_listing.pop("_id", None)

    return recommended_listing

@router.get("/marketplace/hunt-matches")
async def get_marketplace_hunt_matches(
    current_user=Depends(get_current_user),
):
    user_id = str(current_user.id)

    # Get user's active hunts
    hunts = await db.hunts.find({
        "user_id": user_id,
        "status": "active"
    }).to_list(length=None)

    if not hunts:
        return {
            "items": [],
            "total": 0
        }

    # Build album -> hunts mapping
    album_hunts = {}

    for hunt in hunts:
        album_id = str(hunt["album_id"])

        if album_id not in album_hunts:
            album_hunts[album_id] = []

        album_hunts[album_id].append({
            "hunt_id": str(hunt["_id"]),
            "hunt_name": hunt.get("name")
        })

    album_ids = list(album_hunts.keys())

    # Find marketplace listings matching hunted albums
    listings = await db.marketplace_listings.find({
        "album_id": {
            "$in": album_ids
        },
        "status": "active"
    }).to_list(length=None)

    items = []

    for listing in listings:
        album_id = str(listing["album_id"])

        items.append({
            "listing_id": str(listing["_id"]),
            "album_id": album_id,
            "album": listing.get("album"),
            "price": listing.get("price"),
            "currency": listing.get("currency"),
            "pressing_country": listing.get("pressing_country"),
            "pressing_year": listing.get("pressing_year"),
            "label": listing.get("label"),
            "catalog_number": listing.get("catalog_number"),
            "pressing_description": listing.get("pressing_description"),
            "format": listing.get("format"),
            "speed": listing.get("speed"),
            "channels": listing.get("channels"),
            "media_condition": listing.get("media_condition"),
            "sleeve_condition": listing.get("sleeve_condition"),
            "matrix_runout": listing.get("matrix_runout"),
            "edition": listing.get("edition"),
            "mastering": listing.get("mastering"),
            "notes": listing.get("notes"),
            "images": listing.get("images"),
            "seller": listing.get("seller"),
            "matched_hunts": album_hunts.get(album_id, [])
        })

    return {
        "items": items,
        "total": len(items)
    }

@router.get("/recommended-listings/{listing_id}")
async def get_recommended_listing(
    listing_id: str,
    current_user=Depends(get_current_user),
):
    # Validate ObjectId
    try:
        listing_object_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid listing ID"
        )

    # Get listing
    listing = await db.marketplace_recommended_listings.find_one({
        "_id": listing_object_id,
        "status": "active"
    })

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Marketplace listing not found"
        )

    # ---------------------------------------------------------
    # Album
    # ---------------------------------------------------------

    album = None

    if listing.get("album_id"):
        try:
            album = await db.albums.find_one({
                "_id": ObjectId(str(listing["album_id"]))
            })
        except Exception:
            album = None

    # ---------------------------------------------------------
    # Artist
    # ---------------------------------------------------------

    artist = None

    if album and album.get("artist_id"):
        try:
            artist = await db.artists.find_one({
                "_id": ObjectId(str(album["artist_id"]))
            })
        except Exception:
            artist = None

    # ---------------------------------------------------------
    # Seller
    # ---------------------------------------------------------

    seller = None

    if listing.get("seller_id"):
        try:
            seller = await db.users.find_one({
                "_id": ObjectId(str(listing["seller_id"]))
            })
        except Exception:
            seller = None

    # ---------------------------------------------------------
    # Return response
    # ---------------------------------------------------------

    return {
        "id": str(listing["_id"]),

        "album": {
            "id": str(album["_id"]) if album else None,
            "name": album.get("name") if album else None,

            "artist_id": (
                str(album["artist_id"])
                if album and album.get("artist_id")
                else None
            ),

            "artist": {
                "id": str(artist["_id"]),
                "name": artist.get("name")
            } if artist else None,

            "cover_url": (
                album.get("cover_url")
                if album
                else None
            ),
        },

        "price": listing.get("price"),
        "currency": listing.get("currency", "MXN"),

        "pressing_country": listing.get("pressing_country"),
        "pressing_year": listing.get("pressing_year"),

        "label": listing.get("label"),
        "catalog_number": listing.get("catalog_number"),
        "pressing_description": listing.get(
            "pressing_description"
        ),

        "format": listing.get("format"),
        "speed": listing.get("speed"),
        "channels": listing.get("channels"),

        "media_condition": listing.get(
            "media_condition"
        ),
        "sleeve_condition": listing.get(
            "sleeve_condition"
        ),

        "matrix_runout": listing.get(
            "matrix_runout"
        ),

        "edition": listing.get("edition"),
        "mastering": listing.get("mastering"),
        "notes": listing.get("notes"),

        "images": listing.get("images", []),

        "seller": {
            "id": str(seller["_id"]),
            "display_name": seller.get(
                "display_name"
            ),
            "avatar_url": seller.get(
                "avatar_url"
            ),
        } if seller else None,

        "status": listing.get("status"),
    }