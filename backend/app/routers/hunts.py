from fastapi import APIRouter, HTTPException, Depends
import uuid
from db.mongodb import db
from helpers.token_helper import get_current_user, get_optional_user
import copy
from models.hunt import Hunt, CreateHuntRequest, HuntStatus
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
    request: CreateHuntRequest,
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