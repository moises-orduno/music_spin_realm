from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from typing import Optional

from models.collection import (
    CollectionItemCreate,
    CollectionItemUpdate
)

from db.mongodb import db
from helpers.token_helper import get_current_user


router = APIRouter(
    prefix="/collection",
    tags=["Collection"]
)

@router.get("/me")
async def get_my_collection(
    current_user=Depends(get_current_user),
    search: Optional[str] = None,
    sort: str = "recently_added",
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0)
):
    user_id = str(current_user["id"])

    pipeline = [
        {
            "$match": {
                "user_id": user_id
            }
        },
        {
            "$lookup": {
                "from": "albums",
                "let": {
                    "album_id": "$album_id"
                },
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$eq": [
                                    "$id",
                                    "$$album_id"
                                ]
                            }
                        }
                    },
                    {
                        "$project": {
                            "_id": 0,
                            "id": 1,
                            "title": 1,
                            "artist": 1,
                            "year": 1,
                            "cover_url": 1,
                            "genres": 1,
                            "label": 1,
                            "tracks": 1,
                            "total_lists": 1,
                            "total_debates": 1,
                            "country": 1,
                            "description": 1,
                            "created_by": 1
                        }
                    }
                ],
                "as": "album"
            }
        },
        {
            "$unwind": {
                "path": "$album",
                "preserveNullAndEmptyArrays": True
            }
        }
    ]

    if search:
        pipeline.append({
            "$match": {
                "$or": [
                    {
                        "album.title": {
                            "$regex": search,
                            "$options": "i"
                        }
                    },
                    {
                        "album.artist.name": {
                            "$regex": search,
                            "$options": "i"
                        }
                    }
                ]
            }
        })

    sort_map = {
        "recently_added": {
            "created_at": -1
        },
        "oldest_added": {
            "created_at": 1
        },
        "title": {
            "album.title": 1
        },
        "artist": {
            "album.artist.name": 1
        },
        "year": {
            "pressing_year": 1
        }
    }

    pipeline.append({
        "$sort": sort_map.get(
            sort,
            {"created_at": -1}
        )
    })

    pipeline.extend([
        {
            "$skip": skip
        },
        {
            "$limit": limit
        }
    ])

    items = await db.collection.aggregate(
        pipeline
    ).to_list(length=limit)

    for item in items:
        item["id"] = str(item.pop("_id"))

    return {
        "items": items,
        "limit": limit,
        "skip": skip
    }

@router.post("/me")
async def add_to_my_collection(
    payload: CollectionItemCreate,
    current_user=Depends(get_current_user)
):
    user_id = str(current_user["id"])

    # Verify album exists using the album UUID
    album = await db.albums.find_one({
        "id": payload.album_id
    })

    if not album:
        raise HTTPException(
            status_code=404,
            detail="Album not found"
        )

    now = datetime.utcnow()

    collection_item = {
        "user_id": user_id,
        "album_id": payload.album_id,

        "pressing": payload.pressing,
        "pressing_country": payload.pressing_country,
        "pressing_year": payload.pressing_year,

        "label": payload.label,
        "catalog_number": payload.catalog_number,
        "barcode": payload.barcode,
        "matrix_runout": payload.matrix_runout,
        "edition": payload.edition,

        "media_condition": payload.media_condition,
        "sleeve_condition": payload.sleeve_condition,

        "price_paid": payload.price_paid,
        "currency": payload.currency,
        "purchase_date": payload.purchase_date,
        "purchased_from": payload.purchased_from,
        "notes": payload.notes,

        "source": payload.source,
        "source_release_id": payload.source_release_id,

        "created_at": now,
        "updated_at": now
    }

    result = await db.collection.insert_one(
        collection_item
    )

    collection_item["id"] = str(result.inserted_id)

    del collection_item["_id"]

    return collection_item