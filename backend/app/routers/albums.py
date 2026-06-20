from typing import Optional
from fastapi import APIRouter, HTTPException
from db.mongodb import db
from models.album import AlbumCreate, Album

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
                {"artist": {"$regex": q, "$options": "i"}}
            ]
        }

    albums = await (
        db.albums
        .find(query, {"_id": 0})
        .limit(limit)
        .to_list(limit)
    )

    return albums

@router.get("/{album_id}")
async def get_album(album_id: str):

    album = await db.albums.find_one(
        {"id": album_id},
        {"_id": 0}
    )

    if not album:
        raise HTTPException(
            status_code=404,
            detail="Album not found"
        )

    return album

@router.get("/{album_id}/lists")
async def get_album_lists(
    album_id: str,
    limit: int = 50
):

    lists = await (
        db.lists
        .find(
            {
                "items.album.album_id": album_id
            },
            {"_id": 0}
        )
        .sort("likes_count", -1)
        .to_list(limit)
    )

    return lists

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

    albums = await db.lists.aggregate(
        pipeline
    ).to_list(limit)

    return albums

@router.post("", response_model=Album, status_code=201)
async def create_album(payload: AlbumCreate):

    existing = await db.albums.find_one(
        {
            "title": payload.title,
            "artist.artist_id": payload.artist.artist_id
        }
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Album already exists"
        )

    album = Album(**payload.model_dump())

    await db.albums.insert_one(
        album.model_dump()
    )

    return album

@router.get("/{artist_id}/discography")
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

@router.post("/{user_id}/follow-albums/{album_id}")
async def follow_album(
    user_id: str,
    album_id: str
):
    await db.users.update_one(
        {"id": user_id},
        {
            "$addToSet": {
                "followed_albums": album_id
            }
        }
    )

    return {"success": True}

@router.delete("/{user_id}/follow-albums/{album_id}")
async def unfollow_album(
    user_id: str,
    album_id: str
):
    await db.users.update_one(
        {"id": user_id},
        {
            "$pull": {
                "followed_albums": album_id
            }
        }
    )

    return {"success": True}

@router.get("/{user_id}/followed-artists")
async def followed_artists(user_id: str):

    user = await db.users.find_one(
        {"id": user_id},
        {"_id": 0}
    )

    artist_ids = user.get("followed_artists", [])

    artists = await (
        db.artists
        .find(
            {"id": {"$in": artist_ids}},
            {"_id": 0}
        )
        .to_list(100)
    )

    return artists