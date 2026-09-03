from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timezone
from typing import Optional
import uuid

from models.collection import (
    CollectionItemCreate,
    CollectionItemResponse,
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

    items = await db.collection_items.aggregate(
        pipeline
    ).to_list(length=limit)

    for item in items:
        item.pop("_id", None)

    return {
        "items": items,
        "limit": limit,
        "skip": skip
    }

@router.post("/me", response_model=CollectionItemResponse)
async def add_to_my_collection(
    payload: CollectionItemCreate,
    current_user=Depends(get_current_user)
):
    user_id = str(current_user["id"])

    album = await db.albums.find_one({
        "id": payload.album_id
    })

    if not album:
        raise HTTPException(
            status_code=404,
            detail="Album not found"
        )

    now = datetime.now(timezone.utc)

    collection_item = {
        "id": str(uuid.uuid4()),
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
        "updated_at": now,
    }

    await db.collection_items.insert_one(collection_item)

    # Don't expose Mongo's _id
    collection_item.pop("_id", None)

    return CollectionItemResponse(**collection_item)

@router.get("/{collection_id}")
async def get_collection_item(
    collection_id: str,
    current_user=Depends(get_current_user),
):
    item = await db.collection_items.find_one({
        "id": collection_id,
        "user_id": str(current_user["id"]),
    })

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Collection item not found"
        )

    # Get album
    album = await db.albums.find_one(
        {"id": item["album_id"]},
        {
            "_id": 0,
            "id": 1,
            "title": 1,
            "artist": 1,
            "cover_url": 1,
            "year": 1,
            "genres": 1,
        }
    )

    if album:
        item["album"] = album

    # Remove Mongo ObjectId
    item.pop("_id", None)

    return item

@router.delete("/{collection_id}")
async def delete_collection(
    collection_id: str,
    current_user=Depends(get_current_user),
):
    result = await db.collection_items.delete_one({
        "id": collection_id,
        "user_id": current_user["id"],
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Collection item not found"
        )

    return {
        "message": "Collection item deleted successfully",
        "id": collection_id,
    }

@router.patch("/{collection_id}")
async def update_collection_item(
    collection_id: str,
    payload: CollectionItemUpdate,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["id"])

    # Only update fields actually provided
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields to update"
        )

    update_data["updated_at"] = datetime.now(timezone.utc)

    result = await db.collection_items.update_one(
        {
            "id": collection_id,
            "user_id": user_id,
        },
        {
            "$set": update_data
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Collection item not found"
        )

    updated_item = await db.collection_items.find_one(
        {
            "id": collection_id,
            "user_id": user_id,
        },
        {
            "_id": 0
        }
    )

    return updated_item