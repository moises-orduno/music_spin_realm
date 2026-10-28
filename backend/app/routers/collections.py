from fastapi import APIRouter, Depends, HTTPException, Query, File, Form, UploadFile, status
from datetime import datetime, timezone
from typing import Optional
import uuid
from helpers.aws_upload import upload_collection_image_to_s3

from models.collection import (
    CollectionItemResponse
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
    album_id: str = Form(None),

    pressing: Optional[str] = Form(None),
    pressing_country: Optional[str] = Form(None),
    pressing_year: Optional[int] = Form(None),

    label: Optional[str] = Form(None),
    catalog_number: Optional[str] = Form(None),
    barcode: Optional[str] = Form(None),
    matrix_runout: Optional[str] = Form(None),
    edition: Optional[str] = Form(None),

    media_condition: Optional[str] = Form(None),
    sleeve_condition: Optional[str] = Form(None),

    favorite: bool = Form(False),

    price_paid: Optional[float] = Form(None),
    currency: Optional[str] = Form(None),
    purchase_date: Optional[str] = Form(None),
    purchased_from: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),

    source: Optional[str] = Form(None),
    source_release_id: Optional[str] = Form(None),

    image: Optional[UploadFile] = File(None),

    current_user=Depends(get_current_user),
):
    user_id = str(current_user["id"])

    album = await db.albums.find_one({
        "id": album_id
    })

    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Album not found",
        )

    now = datetime.now(timezone.utc)
    collection_id = str(uuid.uuid4())

    image_url = None

    # Upload the collection photo to S3, if provided.
    if image is not None:
        uploaded = await upload_collection_image_to_s3(
            image,
            user_id,
            collection_id,
        )

        image_url = uploaded

    collection_item = {
        "id": collection_id,
        "user_id": user_id,
        "album_id": album_id,

        "pressing": pressing,
        "pressing_country": pressing_country,
        "pressing_year": pressing_year,

        "label": label,
        "catalog_number": catalog_number,
        "barcode": barcode,
        "matrix_runout": matrix_runout,
        "edition": edition,

        "media_condition": media_condition,
        "sleeve_condition": sleeve_condition,

        "favorite": favorite,

        "price_paid": price_paid,
        "currency": currency,
        "purchase_date": purchase_date,
        "purchased_from": purchased_from,
        "notes": notes,

        "source": source,
        "source_release_id": source_release_id,

        # S3 image fields
        "image_url": image_url,

        "created_at": now,
        "updated_at": now,
    }

    await db.collection_items.insert_one(collection_item)

    await db.users.update_one(
        {"id": user_id},
        {
            "$inc": {
                "collections_count": 1
            }
        },
    )

    collection_item.pop("_id", None)
    collection_item.pop("image_key", None)

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
            status_code=status.HTTP_404_NOT_FOUND,
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection item not found"
        )

    await db.users.update_one(
    {"id": current_user["id"]},
        {
            "$inc": {
                "collections_count": -1
            }
        }
    )

    return {
        "message": "Collection item deleted successfully",
        "id": collection_id,
    }

@router.patch("/{collection_id}", response_model=CollectionItemResponse)
async def update_collection_item(
    collection_id: str,

    pressing: Optional[str] = Form(None),
    pressing_country: Optional[str] = Form(None),
    pressing_year: Optional[int] = Form(None),

    label: Optional[str] = Form(None),
    catalog_number: Optional[str] = Form(None),
    barcode: Optional[str] = Form(None),
    matrix_runout: Optional[str] = Form(None),
    edition: Optional[str] = Form(None),

    media_condition: Optional[str] = Form(None),
    sleeve_condition: Optional[str] = Form(None),

    favorite: Optional[bool] = Form(None),

    price_paid: Optional[float] = Form(None),
    currency: Optional[str] = Form(None),
    purchase_date: Optional[str] = Form(None),
    purchased_from: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),

    source: Optional[str] = Form(None),
    source_release_id: Optional[str] = Form(None),

    image: Optional[UploadFile] = File(None),

    current_user=Depends(get_current_user),
):
    user_id = str(current_user["id"])

    updates = {}

    # Only update fields explicitly provided.
    fields = {
        "pressing": pressing,
        "pressing_country": pressing_country,
        "pressing_year": pressing_year,
        "label": label,
        "catalog_number": catalog_number,
        "barcode": barcode,
        "matrix_runout": matrix_runout,
        "edition": edition,
        "media_condition": media_condition,
        "sleeve_condition": sleeve_condition,
        "favorite": favorite,
        "price_paid": price_paid,
        "currency": currency,
        "purchase_date": purchase_date,
        "purchased_from": purchased_from,
        "notes": notes,
        "source": source,
        "source_release_id": source_release_id,
    }

    for field, value in fields.items():
        if value is not None:
            updates[field] = value

    # Upload a new collection photo to S3, if provided.
    if image is not None:
        image_url = await upload_collection_image_to_s3(
            image,
            user_id,
            collection_id,
        )

        updates["image_url"] = image_url

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    updates["updated_at"] = datetime.now(timezone.utc)

    result = await db.collection_items.update_one(
        {
            "id": collection_id,
            "user_id": user_id,
        },
        {
            "$set": updates,
        },
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection item not found",
        )

    updated_item = await db.collection_items.find_one(
        {
            "id": collection_id,
            "user_id": user_id,
        },
        {
            "_id": 0,
        },
    )

    return CollectionItemResponse(**updated_item)