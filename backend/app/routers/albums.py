from typing import Optional
import random

from fastapi import APIRouter, Depends, HTTPException, status

from db.mongodb import db
from helpers.token_helper import get_current_user
from models.album import AlbumCreate, Album, AlbumUpdate, AlbumSuggestionRequest, AlbumSearchRequest

import re
from fastapi import APIRouter, HTTPException

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
    payload: AlbumCreate
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

@router.post("/suggestions")
async def album_suggestions(request: AlbumSuggestionRequest):

    existing_album_ids = request.album_ids

    if not existing_album_ids:
        return await db.albums.find(
            {},
            {"_id": 0}
        ).sort(
            "total_lists", -1
        ).limit(
            request.limit
        ).to_list(
            request.limit
        )

    # Use the first album as the reference
    seed_album_id = random.choice(existing_album_ids)

    album = await db.albums.find_one(
        {"id": seed_album_id},
        {"_id": 0}
    )

    if not album:
        raise HTTPException(
            status_code=404,
            detail="Album not found"
        )

    suggestions = []

    # Same artist
    same_artist = await db.albums.find(
        {
            "artist.artist_id": album["artist"]["artist_id"],
            "id": {"$nin": existing_album_ids}
        },
        {"_id": 0}
    ).limit(request.limit // 2).to_list(request.limit // 2)

    suggestions.extend(same_artist)

    excluded_ids = existing_album_ids + [
        item["id"] for item in same_artist
    ]

    # Same genre
    similar_genre = await db.albums.find(
        {
            "genres": {"$in": album["genres"]},
            "id": {"$nin": excluded_ids}
        },
        {"_id": 0}
    ).sort(
        "total_lists", -1
    ).limit(
        request.limit - len(same_artist)
    ).to_list(
        request.limit - len(same_artist)
    )

    suggestions.extend(similar_genre)

    # Remove duplicates
    unique = []
    seen = set()

    for item in suggestions:
        if item["id"] not in seen:
            seen.add(item["id"])
            unique.append(item)

    return unique

@router.post("/search")
async def search_albums(request: AlbumSearchRequest):

    query = request.query.strip()

    if not query:
        return []

    excluded_ids = []

    if request.list_id:
        top_list = await db.lists.find_one(
            {"id": request.list_id},
            {"_id": 0}
        )

        # Only exclude albums if the list exists
        if top_list:
            excluded_ids = [
                item["album"]["id"]
                for item in top_list.get("items", [])
            ]

    escaped = re.escape(query)

    pipeline = [
        {
            "$match": {
                "id": {
                    "$nin": excluded_ids
                },
                "$or": [
                    {
                        "title": {
                            "$regex": escaped,
                            "$options": "i"
                        }
                    },
                    {
                        "artist.name": {
                            "$regex": escaped,
                            "$options": "i"
                        }
                    }
                ]
            }
        },
        {
            "$addFields": {
                "score": {
                    "$switch": {
                        "branches": [
                            # Exact album title
                            {
                                "case": {
                                    "$eq": [
                                        {"$toLower": "$title"},
                                        query.lower()
                                    ]
                                },
                                "then": 100
                            },

                            # Exact artist
                            {
                                "case": {
                                    "$eq": [
                                        {"$toLower": "$artist.name"},
                                        query.lower()
                                    ]
                                },
                                "then": 95
                            },

                            # Album title starts with query
                            {
                                "case": {
                                    "$regexMatch": {
                                        "input": "$title",
                                        "regex": f"^{escaped}",
                                        "options": "i"
                                    }
                                },
                                "then": 90
                            },

                            # Artist starts with query
                            {
                                "case": {
                                    "$regexMatch": {
                                        "input": "$artist.name",
                                        "regex": f"^{escaped}",
                                        "options": "i"
                                    }
                                },
                                "then": 85
                            },

                            # Album title contains query
                            {
                                "case": {
                                    "$regexMatch": {
                                        "input": "$title",
                                        "regex": escaped,
                                        "options": "i"
                                    }
                                },
                                "then": 80
                            },

                            # Artist contains query
                            {
                                "case": {
                                    "$regexMatch": {
                                        "input": "$artist.name",
                                        "regex": escaped,
                                        "options": "i"
                                    }
                                },
                                "then": 75
                            }
                        ],
                        "default": 0
                    }
                }
            }
        },
        {
            "$sort": {
                "score": -1,
                "total_lists": -1,
                "total_debates": -1,
                "year": -1,
                "title": 1
            }
        },
        {
            "$project": {
                "_id": 0,
                "id": 1,
                "title": 1,
                "artist": 1,
                "cover_url": 1,
                "year": 1,
                "genres": 1,
                "label": 1,
                "total_lists": 1,
                "total_debates": 1,
            }
        },
        {
            "$limit": request.limit
        }
    ]

    albums = await db.albums.aggregate(pipeline).to_list(request.limit)

    return albums

@router.get("/{album_id}/similar")
async def get_similar_albums(album_id: str, limit: int = 5):

    album = await db.albums.find_one(
        {"id": album_id},
        {"_id": 0}
    )

    if not album:
        raise HTTPException(
            status_code=404,
            detail="Album not found"
        )

    artist_id = album.get("artist", {}).get("id")
    genres = album.get("genres", [])
    year = album.get("year")

    pipeline = [
        {
            "$match": {
                "id": {"$ne": album_id}
            }
        },
        {
            "$addFields": {
                "similarity_score": {
                    "$add": [
                        # Same artist
                        {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$artist.id",
                                        artist_id
                                    ]
                                },
                                50,
                                0
                            ]
                        },

                        # Shared genres
                        {
                            "$multiply": [
                                {
                                    "$size": {
                                        "$setIntersection": [
                                            {"$ifNull": ["$genres", []]},
                                            genres
                                        ]
                                    }
                                },
                                15
                            ]
                        },

                        # Same decade
                        {
                            "$cond": [
                                {
                                    "$eq": [
                                        {
                                            "$floor": {
                                                "$divide": ["$year", 10]
                                            }
                                        },
                                        {
                                            "$floor": {
                                                "$divide": [year, 10]
                                            }
                                        }
                                    ]
                                },
                                15,
                                0
                            ]
                        },

                        # Same label
                        {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$label",
                                        album.get("label")
                                    ]
                                },
                                5,
                                0
                            ]
                        }
                    ]
                }
            }
        },
        {
            "$sort": {
                "similarity_score": -1,
                "total_lists": -1,
                "total_debates": -1,
                "year": -1
            }
        },
        {
            "$project": {
                "_id": 0,
                "id": 1,
                "title": 1,
                "artist": 1,
                "cover_url": 1,
                "year": 1,
                "genres": 1,
                "label": 1,
                "total_lists": 1,
                "total_debates": 1,
                "similarity_score": 1
            }
        },
        {
            "$limit": limit
        }
    ]

    return await db.albums.aggregate(pipeline).to_list(limit)