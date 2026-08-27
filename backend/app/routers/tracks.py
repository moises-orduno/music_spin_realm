from fastapi import APIRouter, HTTPException
from db.mongodb import db
from models.album import Album
from models.track import Track, TrackUpdate
from fastapi import APIRouter
from datetime import datetime, timezone

from db.mongodb import db

router = APIRouter(
    prefix="/tracks",
    tags=["Tracks"]
)


@router.post("/{album_id}/tracks", response_model=Album)
async def add_track(
    album_id: str,
    track: Track
):
    result = await db.albums.update_one(
        {"id": album_id},
        {
            "$push": {
                "tracks": track.model_dump()
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Album not found"
        )

    album = await db.albums.find_one(
        {"id": album_id},
        {"_id": 0}
    )

    return album

@router.patch("/{album_id}/tracks/{track_id}", response_model=Album)
async def update_track(
    album_id: str,
    track_id: str,
    payload: TrackUpdate
):
    update_data = payload.model_dump(exclude_unset=True)

    set_fields = {
        f"tracks.$.{key}": value
        for key, value in update_data.items()
    }

    result = await db.albums.update_one(
        {
            "id": album_id,
            "tracks.id": track_id
        },
        {
            "$set": set_fields
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Album or track not found"
        )

    return await db.albums.find_one(
        {"id": album_id},
        {"_id": 0}
    )

@router.delete("/{album_id}/tracks/{track_id}", response_model=Album)
async def delete_track(
    album_id: str,
    track_id: str
):
    result = await db.albums.update_one(
        {"id": album_id},
        {
            "$pull": {
                "tracks": {
                    "id": track_id
                }
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Album not found"
        )

    return await db.albums.find_one(
        {"id": album_id},
        {"_id": 0}
    )