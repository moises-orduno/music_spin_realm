from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from db.mongodb import db
from helpers.token_helper import get_current_user
from models.album import AlbumCreate, Album, AlbumUpdate

router = APIRouter(
    prefix="/albums",
    tags=["Albums"]
)


@router.get("")
async def list_albums(
    q: Optional[str] = None,
    limit: int = 50
):
    query = {}

    if q:
        query = {
            "$or": [
                {"title": {"$regex": q, "$options": "i"}},
                {"artist.name": {"$regex": q, "$options": "i"}}
            ]
        }

    albums = await (
        db.albums
        .find(query, {"_id": 0})
        .limit(limit)
        .to_list(limit)
    )

    return albums


@router.post(
    "",
    response_model=Album,
    status_code=status.HTTP_201_CREATED
)
async def create_album(
    payload: AlbumCreate,
    current_user=Depends(get_current_user)
):
    existing = await db.albums.find_one(
        {
            "title": payload.title,
            "artist.artist_id": payload.artist.artist_id
        }
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Album already exists"
        )

    album = Album(**payload.model_dump())

    await db.albums.insert_one(
        album.model_dump()
    )

    return album

@router.patch("/{album_id}", response_model=Album)
async def update_album(
    album_id: str,
    payload: AlbumUpdate
):
    update_data = payload.model_dump(exclude_unset=True)

    result = await db.albums.update_one(
        {"id": album_id},
        {"$set": update_data}
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


@router.get("/trending")
async def trending_albums(limit: int = 20):

    pipeline = [
        {"$unwind": "$items"},
        {
            "$group": {
                "_id": "$items.album.album_id",
                "title": {"$first": "$items.album.title"},
                "artist": {"$first": "$items.album.artist"},
                "appearances": {"$sum": 1}
            }
        },
        {"$sort": {"appearances": -1}},
        {"$limit": limit}
    ]

    return await db.lists.aggregate(
        pipeline
    ).to_list(limit)


@router.get("/{album_id}")
async def get_album(album_id: str):

    album = await db.albums.find_one(
        {"id": album_id},
        {"_id": 0}
    )

    if album is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Album not found"
        )

    return album


@router.get("/{album_id}/lists")
async def get_album_lists(
    album_id: str,
    limit: int = 50
):

    return await (
        db.lists
        .find(
            {"items.album.album_id": album_id},
            {"_id": 0}
        )
        .sort("likes_count", -1)
        .to_list(limit)
    )


@router.get("/{album_id}/stats")
async def album_stats(album_id: str):

    lists_count = await db.lists.count_documents(
        {"items.album.album_id": album_id}
    )

    debates_count = await db.debates.count_documents(
        {"albums.album_id": album_id}
    )

    return {
        "album_id": album_id,
        "lists_count": lists_count,
        "debates_count": debates_count
    }


@router.get("/artist/{artist_id}/discography")
async def discography(artist_id: str):

    return await (
        db.albums
        .find(
            {"artist.artist_id": artist_id},
            {"_id": 0}
        )
        .sort("year", 1)
        .to_list(500)
    )


@router.post("/follow/{album_id}")
async def follow_album(
    album_id: str,
    current_user=Depends(get_current_user)
):
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$addToSet": {
                "followed_albums": album_id
            }
        }
    )

    return {"success": True}


@router.delete("/follow/{album_id}")
async def unfollow_album(
    album_id: str,
    current_user=Depends(get_current_user)
):
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$pull": {
                "followed_albums": album_id
            }
        }
    )

    return {"success": True}