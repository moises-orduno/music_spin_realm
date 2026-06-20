from models.artist import Artist
from models.artist import ArtistCreate
from fastapi import APIRouter, HTTPException
from db.mongodb import db
from typing import List

router = APIRouter(
    prefix="/artists",
    tags=["Artists"]
)

@router.post("", response_model=Artist, status_code=201)
async def create_artist(payload: ArtistCreate):

    existing = await db.artists.find_one(
        {
            "name": {
                "$regex": f"^{payload.name}$",
                "$options": "i"
            }
        }
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Artist already exists"
        )

    artist = Artist(**payload.model_dump())

    await db.artists.insert_one(
        artist.model_dump()
    )

    return artist

@router.get("", response_model=List[Artist])
async def list_artists(limit: int = 100):
    return await (
        db.artists
        .find({}, {"_id": 0})
        .sort("name", 1)
        .to_list(limit)
    )


@router.get("/{artist_id}", response_model=Artist)
async def get_artist(artist_id: str):

    artist = await db.artists.find_one(
        {"id": artist_id},
        {"_id": 0}
    )

    if not artist:
        raise HTTPException(
            status_code=404,
            detail="Artist not found"
        )

    return artist

@router.post("/{user_id}/follow-artists/{artist_id}")
async def follow_artist(
    user_id: str,
    artist_id: str
):
    await db.users.update_one(
        {"id": user_id},
        {
            "$addToSet": {
                "followed_artists": artist_id
            }
        }
    )

    return {"success": True}

@router.delete("/{user_id}/follow-artists/{artist_id}")
async def unfollow_artist(
    user_id: str,
    artist_id: str
):
    await db.users.update_one(
        {"id": user_id},
        {
            "$pull": {
                "followed_artists": artist_id
            }
        }
    )

    return {"success": True}