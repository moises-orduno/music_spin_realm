from fastapi import APIRouter, HTTPException, Depends
import uuid
from db.mongodb import db
from helpers.token_helper import get_current_user, get_optional_user
import copy
from models.hunt import Hunt, HuntFormRequest, HuntStatus, UpdateHuntRequest
from models.album import AlbumReference
from datetime import datetime, timezone
from models.user import UserReference

router = APIRouter(
    prefix="/hunts",
    tags=["Hunts"]
)

@router.get("/me", response_model=list[Hunt])
async def get_my_hunts(
    status: HuntStatus = HuntStatus.HUNTING,
    current_user=Depends(get_current_user),
):
    docs = await (
        db.hunts.find(
            {
                "owner.user_id": current_user["id"],
                "status": status.value,
            },
            {"_id": 0},
        )
        .sort("created_at", -1)
        .to_list(100)
    )

    return [Hunt.model_validate(doc) for doc in docs]

@router.post("", response_model=Hunt, status_code=201)
async def create_hunt(
    request: HuntFormRequest,
    current_user=Depends(get_current_user),
):
    album = await db.albums.find_one(
        {"id": request.album_id},
        {"_id": 0, "id": 1, "title": 1, "artist": 1, "cover_url": 1},
    )

    if album is None:
        raise HTTPException(status_code=404, detail="Album not found")

    # Prevent duplicate hunt for the same album
    existing = await db.hunts.find_one({
        "owner.user_id": current_user["id"],
        "album.album_id": request.album_id,
        "pressing": request.pressing,
        "country_pressing": request.country_pressing,
        "year": request.year,
        "condition": request.condition,
    })

    if existing:
        raise HTTPException(
            status_code=409,
            detail="You are already hunting this album."
        )

    hunt = Hunt(
        id=str(uuid.uuid4()),
        owner=UserReference(
            user_id=current_user["id"],
            username=current_user["username"],
            display_name=current_user["display_name"],
            avatar_url=current_user.get("avatar_url"),
        ),
        album=AlbumReference(
            id=album["id"],
            title=album["title"],
            artist=album["artist"]["name"],
            cover_url=album.get("cover_url"),
        ),
        pressing=request.pressing,
        country_pressing=request.country_pressing,
        year=request.year,
        condition=request.condition,
        seller_location=request.seller_location,
        ship_to=request.ship_to,
        price=request.price,
        details=request.details,
    )

    await db.hunts.insert_one(hunt.model_dump())

    return hunt

@router.patch("/{hunt_id}", response_model=Hunt)
async def update_hunt(
    hunt_id: str,
    request: UpdateHuntRequest,
    current_user=Depends(get_current_user),
):
    hunt = await db.hunts.find_one({
        "id": hunt_id,
        "owner.user_id": current_user["id"],
    })

    if hunt is None:
        raise HTTPException(
            status_code=404,
            detail="Hunt not found"
        )

    updates = {
        key: value
        for key, value in request.model_dump().items()
        if value is not None
    }

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No fields to update"
        )

    await db.hunts.update_one(
        {
            "id": hunt_id,
            "owner.user_id": current_user["id"],
        },
        {
            "$set": updates
        }
    )

    updated_hunt = await db.hunts.find_one({
        "id": hunt_id
    })

    return Hunt(**updated_hunt)


@router.get("/{hunt_id}", response_model=Hunt)
async def get_hunt_by_id(
    hunt_id: str,
    current_user=Depends(get_current_user),
):
    doc = await db.hunts.find_one(
        {
            "id": hunt_id,
            "owner.user_id": current_user["id"],
        },
        {
            "_id": 0,
        },
    )

    if doc is None:
        raise HTTPException(
            status_code=404,
            detail="Hunt not found",
        )

    return Hunt.model_validate(doc)