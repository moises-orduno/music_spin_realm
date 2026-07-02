import re
from fastapi import APIRouter, HTTPException
from typing import List

from db.mongodb import db
from helpers.token_helper import create_access_token

from helpers.password_checker import verify_password, hash_password

from models.user import (
    User,
    UserCreate,
    UserUpdate,
    LoginRequest
)

from utils import _serialize

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/register")
async def register(payload: UserCreate):

    existing_email = await db.users.find_one(
        {"email": payload.email}
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    base_username = payload.email.split("@")[0]

    base_username = re.sub(
        r"[^a-zA-Z0-9_]",
        "",
        base_username.lower()
    )

    username = base_username
    counter = 1

    while await db.users.find_one(
        {"username": username}
    ):
        username = f"{base_username}{counter}"
        counter += 1

    user = User(
        username=username,
        display_name=payload.display_name,
        avatar_url=payload.avatar_url,
        bio=payload.bio,
        email=payload.email,
        password_hash=hash_password(
            payload.password
        )
    )

    await db.users.insert_one(
        user.model_dump()
    )

    token = create_access_token(
        user.id
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "email": user.email
        }
    }

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

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):

    doc = await db.users.find_one(
        {"id": user_id},
        {"_id": 0}
    )

    if not doc:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return _serialize(doc)

@router.get("", response_model=List[User])
async def list_users(limit: int = 100):

    docs = await (
        db.users
        .find({}, {"_id": 0})
        .to_list(limit)
    )

    return [_serialize(d) for d in docs]

@router.patch("/{user_id}", response_model=User)
async def update_user(
    user_id: str,
    payload: UserUpdate
):

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

@router.get("/{user_id}/lists")
async def get_user_lists(user_id: str):

    lists = await (
        db.lists
        .find(
            {"creator_id": user_id},
            {"_id": 0}
        )
        .sort("likes_count", -1)
        .to_list(100)
    )

    return lists