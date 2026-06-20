from fastapi import APIRouter, HTTPException
from db.mongodb import db
from models.vinyl import VinylListing, VinylListingCreate
from typing import List, Optional
from utils import _serialize

router = APIRouter(
    prefix="/marketplace",
    tags=["Marketplace"]
)

@router.get("/{user_id}/recommended-listings-by-user")
async def recommended_listings(
    user_id: str,
    limit: int = 50
):

    # Verify user exists
    user = await db.users.find_one(
        {"id": user_id},
        {"_id": 0}
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Get all lists created by the user
    user_lists = await (
        db.lists
        .find(
            {"creator_id": user_id},
            {"_id": 0}
        )
        .to_list(100)
    )

    if not user_lists:
        return []

    # Build recommendation scores
    album_scores = {}

    for top_list in user_lists:

        for item in top_list.get("items", []):

            album = item.get("album")

            if not album:
                continue

            album_id = album.get("id")

            if not album_id:
                continue

            position = item.get("position", 10)

            # Position 1 = 10 points
            # Position 2 = 9 points
            # Position 10 = 1 point
            points = max(1, 11 - position)

            album_scores[album_id] = (
                album_scores.get(album_id, 0)
                + points
            )

    if not album_scores:
        return []

    # Get marketplace listings
    listings = await (
        db.marketplace
        .find(
            {
                "album.id": {
                    "$in": list(album_scores.keys())
                },
                "status": "available"
            },
            {"_id": 0}
        )
        .to_list(500)
    )

    # Attach recommendation score
    for listing in listings:

        album_id = listing["album"]["id"]

        listing["recommendation_score"] = (
            album_scores.get(album_id, 0)
        )

    # Sort by score first, then cheapest
    listings.sort(
        key=lambda x: (
            -x["recommendation_score"],
            x["price"]
        )
    )

    return listings[:limit]

@router.get("", response_model=List[VinylListing])
async def get_marketplace(
    album_id: Optional[str] = None,
    artist_id: Optional[str] = None,
    status: Optional[str] = "available",
    limit: int = 100
):
    query = {}

    if album_id:
        query["album.id"] = album_id

    if artist_id:
        query["album.artist.artist_id"] = artist_id

    if status:
        query["status"] = status

    docs = (
        await db.marketplace
        .find(query, {"_id": 0})
        .sort("created_at", -1)
        .to_list(limit)
    )

    return [_serialize(d) for d in docs]

@router.post(
    "",
    response_model=VinylListing,
    status_code=201
)
async def create_listing(
    payload: VinylListingCreate
):

    listing = VinylListing(
        **payload.model_dump()
    )

    await db.marketplace.insert_one(
        listing.model_dump()
    )

    return listing