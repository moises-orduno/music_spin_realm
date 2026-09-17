import re
from fastapi import APIRouter, HTTPException, Depends
from typing import List

from db.mongodb import db
from helpers.token_helper import create_access_token

from helpers.password_checker import verify_password, hash_password

from helpers.token_helper import get_current_user, get_optional_user

from models.user import (
    User,
    RegisterRequest,
    UserUpdate,
    LoginRequest,
    ProfileResponse
)

from utils import _serialize

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("", response_model=List[User])
async def list_users(limit: int = 100):

    docs = await (
        db.users
        .find({}, {"_id": 0})
        .to_list(limit)
    )

    return [_serialize(d) for d in docs]



@router.patch("/me", response_model=User)
async def update_my_user(
    payload: UserUpdate,
    current_user=Depends(get_current_user)
):
    user_id = str(current_user["id"])

    updates = {
        k: v
        for k, v in payload.model_dump().items()
        if v is not None
    }

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No fields to update"
        )

    result = await db.users.update_one(
        {"id": user_id},
        {"$set": updates}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    updated = await db.users.find_one(
        {"id": user_id},
        {"_id": 0}
    )

    return _serialize(updated)

@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: str):

    result = await db.users.delete_one(
        {"id": user_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return None

@router.get("/{username}", response_model=ProfileResponse)
async def get_profile(username: str):
    user = await db.users.find_one(
        {"username": username},
        {"_id": 0}
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user_id = str(user["id"])

    # Get favorite artists
    favorite_artists = []

    if user.get("favorite_artists"):
        artists = await db.artists.find(
            {
                "id": {
                    "$in": user["favorite_artists"]
                }
            },
            {
                "_id": 0,
                "id": 1,
                "name": 1,
                "image_url": 1
            }
        ).to_list(length=10)

        # Keep the same order as favorite_artists
        artists_by_id = {
            artist["id"]: artist
            for artist in artists
        }

        favorite_artists = [
            artists_by_id[artist_id]
            for artist_id in user["favorite_artists"]
            if artist_id in artists_by_id
        ]

    # Get favorite song
    favorite_song = None

    if user.get("favorite_song_id"):
        song = await db.songs.find_one(
            {"id": user["favorite_song_id"]},
            {"_id": 0}
        )

        if song:
            favorite_song = {
                "id": song["id"],
                "title": song["title"],
                "artist": song.get("artist"),
                "album_title": song.get("album_title"),
                "album_cover_url": song.get("album_cover_url"),
            }

    # Album count
    albums_count = await db.collection_items.count_documents(
        {"user_id": user_id}
    )

    return ProfileResponse(
        id=user["id"],
        username=user["username"],
        display_name=user["display_name"],
        avatar_url=user.get("avatar_url"),
        bio=user.get("bio"),

        albums_count=albums_count,
        lists_count=user.get("lists_count", 0),
        debates_count=user.get("debates_count", 0),
        following_count=user.get("following_count", 0),
        followers_count=user.get("followers_count", 0),

        favorite_genres=user.get(
            "favorite_genres",
            []
        ),

        favorite_artists=favorite_artists,

        favorite_song=favorite_song,
    )

@router.post("/login")
async def login(payload: LoginRequest):

    user = await db.users.find_one(
        {"email": payload.email}
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        payload.password,
        user["password_hash"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        user["id"]
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "display_name": user["display_name"],
            "avatar_url": user.get("avatar_url"),
            "bio": user.get("bio"),
            "email": user["email"]
        }
    }


@router.post("/register")
async def register(payload: RegisterRequest):

    email = payload.email.strip().lower()
    username = payload.username.strip().lower()

    existing_email = await db.users.find_one({
        "email": email
    })

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    existing_username = await db.users.find_one({
        "username": username
    })

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    user = User(
        username=username,
        display_name=username,
        email=email,
        password_hash=hash_password(payload.password),
    )

    await db.users.insert_one(
        user.model_dump(mode="json")
    )

    token = create_access_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "email": user.email,
            "role": user.role,
            "onboarding_completed": user.onboarding_completed,
        }
    }

@router.get("/users")
async def get_users(
    current_user=Depends(get_current_user)
):
    users = await db.users.find(
        {
            "id": {"$ne": current_user["id"]}
        },
        {
            "_id": 0,
            "id": 1,
            "username": 1,
            "display_name": 1,
            "profile_picture": 1,
            "description": 1,
            "followers_count": 1,
            "following_count": 1,
            "favorite_artist": 1,
            "favorite_genre": 1
        }
    ).to_list(length=100)

    return users