from fastapi import APIRouter, Depends, HTTPException
from db.mongodb import db
from models.marketplace import RecommendedListingCreate
from fastapi import APIRouter
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from models.user import User, UserRole

from fastapi.encoders import jsonable_encoder
import uuid
from helpers.token_helper import get_current_user
from db.mongodb import db

router = APIRouter(
    prefix="/marketplace",
    tags=["Marketplace"]
)
from typing import Optional

from fastapi import Depends, HTTPException, status


async def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:

    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user

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

    # Only get album IDs from listings that have them
    album_ids = [
        listing["album_id"]
        for listing in listings
        if listing.get("album_id")
    ]

    albums = await (
        db.albums
        .find(
            {"id": {"$in": album_ids}},
            {"_id": 0}
        )
        .to_list(None)
    )

    albums_by_id = {
        album["id"]: album
        for album in albums
    }

    result = []

    for listing in listings:
        album = None

        if listing.get("album_id"):
            album = albums_by_id.get(listing["album_id"])

        result.append({
            **listing,

            "album": {
                "id": album["id"],
                "title": album["title"],
                "cover_url": album.get("cover_url"),
                "artist": album.get("artist"),
            } if album else None,
        })

    return result

@router.get("/albums/{album_id}/listings")
async def get_album_listings(
    album_id: str,
    limit: int = 10
):
    album = await db.albums.find_one(
        {"id": album_id},
        {"_id": 0}
    )

    if not album:
        raise HTTPException(
            status_code=404,
            detail="Album not found"
        )

    listings = await (
        db.recommended_listings
        .find(
            {
                "album_id": album_id,
                "status": "available"
            },
            {"_id": 0}
        )
        .sort("created_at", -1)
        .to_list(limit)
    )

    return {
        "album": {
            "id": album["id"],
            "title": album["title"],
            "cover_url": album.get("cover_url"),
            "artist": album.get("artist"),
        },
        "listings": listings,
    }

@router.post("/recommended-listings")
async def create_recommended_listing(
    listing: RecommendedListingCreate
    # ,
    # current_user: User = Depends(require_admin),
):
    # Find album
    album = await db.albums.find_one(
        {"id": listing.album_id},
        {"_id": 0},
    )

    if not album:
        raise HTTPException(
            status_code=404,
            detail="Album not found",
        )

    listing_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    recommended_listing = {
        # Identity
        "id": listing_id,
        "album_id": listing.album_id,

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

        # Marketplace
        "status": "available",

        # Admin / ownership
        "created_by": "System",
        "created_at": now,
        "updated_at": now,
    }

    await db.recommended_listings.insert_one(
        recommended_listing
    )

    # Return the album together with the listing
    response = {
        **recommended_listing,
        "album": album,
    }

    # Protect against any ObjectId nested inside the album
    return jsonable_encoder(
        response,
        custom_encoder={ObjectId: str},
    )

@router.get("/hunt-matches")
async def get_marketplace_hunt_matches(
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["id"])

    # ---------------------------------------------------------
    # Get user's active hunts
    # ---------------------------------------------------------

    hunts = await db.hunts.find(
        {
            "user_id": user_id,
            "status": "active"
        },
        {
            "_id": 1,
            "album_id": 1,
            "name": 1,
        }
    ).to_list(length=None)

    if not hunts:
        return {
            "items": [],
            "total": 0
        }

    # ---------------------------------------------------------
    # Build album -> hunts mapping
    # ---------------------------------------------------------

    album_hunts = {}

    for hunt in hunts:
        album_id = str(hunt["album_id"])

        if album_id not in album_hunts:
            album_hunts[album_id] = []

        album_hunts[album_id].append({
            "hunt_id": str(hunt["_id"]),
            "hunt_name": hunt.get("name"),
        })

    album_ids = list(album_hunts.keys())

    # ---------------------------------------------------------
    # Get marketplace listings
    # ---------------------------------------------------------

    listings = await db.recommended_listings.find(
        {
            "album_id": {
                "$in": album_ids
            },
            "status": "available"
        },
        {
            "_id": 0
        }
    ).to_list(length=None)

    if not listings:
        return {
            "items": [],
            "total": 0
        }

    # ---------------------------------------------------------
    # Get albums
    # ---------------------------------------------------------

    albums = await db.albums.find(
        {
            "id": {
                "$in": album_ids
            }
        },
        {
            "_id": 0
        }
    ).to_list(length=None)

    albums_by_id = {
        album["id"]: album
        for album in albums
    }

    # ---------------------------------------------------------
    # Build response
    # ---------------------------------------------------------

    items = []

    for listing in listings:

        album_id = str(listing["album_id"])
        album = albums_by_id.get(album_id)

        items.append({
            "listing_id": listing["id"],
            "album_id": album_id,

            "album": {
                "id": album["id"],
                "title": album["title"],
                "cover_url": album.get("cover_url"),
                "artist": album.get("artist"),
            } if album else None,

            "price": listing.get("price"),
            "currency": listing.get("currency"),

            "pressing_country": listing.get(
                "pressing_country"
            ),
            "pressing_year": listing.get(
                "pressing_year"
            ),

            "label": listing.get("label"),
            "catalog_number": listing.get(
                "catalog_number"
            ),
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

            "matched_hunts": album_hunts.get(
                album_id,
                []
            ),
        })

    return {
        "items": items,
        "total": len(items)
    }

@router.get("/recommended-listings/{listing_id}")
async def get_recommended_listing(
    listing_id: str
):
    # Get listing
    listing = await db.recommended_listings.find_one(
        {
            "id": listing_id,
            "status": "available"
        },
        {
            "_id": 0
        }
    )

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
        album = await db.albums.find_one(
            {
                "id": listing["album_id"]
            },
            {
                "_id": 0
            }
        )

    # ---------------------------------------------------------
    # Return response
    # ---------------------------------------------------------

    return {
        "id": listing["id"],

        "album": {
            "id": album.get("id") if album else None,
            "name": album.get("title") if album else None,

            "artist": (
                album.get("artist")
                if album
                else None
            ),

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

        "status": listing.get("status"),
    }