from fastapi import APIRouter, HTTPException
from typing import List

from db.mongodb import db

from models.user import (
    User,
    UserCreate,
    UserUpdate
)

from utils import _serialize

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

import re

@router.post("", response_model=User, status_code=201)
async def create_user(payload: UserCreate):

    # Make sure email is unique
    existing_email = await db.users.find_one(
        {"email": payload.email}
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # username base from email
    base_username = payload.email.split("@")[0]

    # remove special chars
    base_username = re.sub(
        r"[^a-zA-Z0-9_]",
        "",
        base_username.lower()
    )

    username = base_username
    counter = 1

    # Find available username
    while await db.users.find_one({"username": username}):
        username = f"{base_username}{counter}"
        counter += 1

    user = User(
        username=username,
        display_name=payload.display_name,
        avatar_url=payload.avatar_url,
        bio=payload.bio,
        email=payload.email
    )

    await db.users.insert_one(
        user.model_dump()
    )

    return user

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