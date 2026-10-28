from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional

from db.mongodb import db
from helpers.token_helper import create_access_token
from helpers.password_checker import verify_password, hash_password
import httpx
import json
from helpers.token_helper import get_current_user, get_optional_user

from helpers.aws_upload import upload_avatar_to_s3

from models.user import (
    User,
    RegisterRequest,
    LoginRequest,
    ProfileResponse,
    UserFollow,
    GoogleLoginRequest
)

from fastapi import HTTPException

from models.album import (
    AlbumReference
)

from fastapi import File, Form, UploadFile
from utils import _serialize

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

def build_auth_response(user: dict) -> dict:
    return {
        "access_token": create_access_token(user["id"]),
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "display_name": user["display_name"],
            "avatar_url": user.get("avatar_url"),
            "bio": user.get("bio"),
            "email": user["email"],
            "role": user.get("role", "user"),
            "onboarding_completed": user.get(
                "onboarding_completed", False
            ),
        },
    }

@router.post("/login")
async def login(payload: LoginRequest):
    email = payload.email.strip().lower()

    user = await db.users.find_one({"email": email})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    password_hash = user.get("password_hash")

    if not password_hash or not verify_password(
        payload.password, password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return build_auth_response(user)

@router.post("/register")
async def register(payload: RegisterRequest):
    email = payload.email.strip().lower()
    username = payload.username.strip().lower()

    if await db.users.find_one({"email": email}):
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    if await db.users.find_one({"username": username}):
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    user = User(
        username=username,
        display_name=username,
        email=email,
        password_hash=hash_password(payload.password),
    )

    user_data = user.model_dump(mode="json")

    await db.users.insert_one(user_data)

    return build_auth_response(user_data)

@router.get("")
async def get_users(
    current_user=Depends(get_optional_user)
):
    projection = {
        "_id": 0,
        "id": 1,
        "username": 1,
        "display_name": 1,
        "avatar_url": 1,
        "bio": 1,
        "followers_count": 1,
        "following_count": 1,
        "favorite_genres": 1,
        "favorite_artists": 1,
    }

    # Default: logged out
    query = {}
    following_ids = set()

    # Logged in
    if current_user:
        current_user_id = current_user["id"]

        # Don't return the current user
        query = {
            "id": {"$ne": current_user_id}
        }

        # Get users the current user follows
        following_docs = await db.follows.find(
            {
                "follower_id": current_user_id
            },
            {
                "_id": 0,
                "following_id": 1
            }
        ).to_list(None)

        following_ids = {
            doc["following_id"]
            for doc in following_docs
        }

    # Get users
    users = await db.users.find(
        query,
        projection
    ).to_list(length=100)

    # Get one collection item per user
    user_ids = [user["id"] for user in users]

    collection_items = await db.collection_items.find(
        {
            "user_id": {"$in": user_ids}
        },
        {
            "_id": 0,
            "user_id": 1,
            "album_id": 1
        }
    ).to_list(None)

    # Keep only one album per user
    album_by_user = {}

    for item in collection_items:
        if item["user_id"] not in album_by_user:
            album_by_user[item["user_id"]] = item["album_id"]

    # Get albums
    album_ids = list(album_by_user.values())

    albums = await db.albums.find(
        {
            "id": {"$in": album_ids}
        },
        {
            "_id": 0,
            "id": 1,
            "title": 1,
            "cover_url": 1
        }
    ).to_list(None)

    albums_by_id = {
        album["id"]: album
        for album in albums
    }

    # Build response
    for user in users:
        user["is_following"] = user["id"] in following_ids

        album_id = album_by_user.get(user["id"])

        user["collection_album"] = (
            albums_by_id.get(album_id)
            if album_id
            else None
        )

    return users

@router.get("/following")
async def get_following(
    limit: int = 50,
    current_user=Depends(get_current_user)
):
    follow_docs = (
        await db.follows
        .find(
            {"follower_id": current_user["id"]},
            {"_id": 0}
        )
        .sort("created_at", -1)
        .to_list(limit)
    )

    user_ids = [doc["following_id"] for doc in follow_docs]

    if not user_ids:
        return []

    users = await db.users.find(
        {"id": {"$in": user_ids}},
        {
            "_id": 0,
            "id": 1,
            "username": 1,
            "display_name": 1,
            "profile_picture": 1,
            "description": 1,
            "followers_count": 1,
            "following_count": 1,
        }
    ).to_list(None)

    users_by_id = {user["id"]: user for user in users}

    result = []

    for user_id in user_ids:
        user = users_by_id.get(user_id)

        if not user:
            continue

        result.append({
            **user,
            "is_following": True
        })

    return result

@router.get("/followers")
async def get_followers(
    limit: int = 50,
    current_user=Depends(get_current_user)
):
    follow_docs = (
        await db.follows
        .find(
            {"following_id": current_user["id"]},
            {"_id": 0}
        )
        .sort("created_at", -1)
        .to_list(limit)
    )

    user_ids = [doc["follower_id"] for doc in follow_docs]

    if not user_ids:
        return []

    users = await db.users.find(
        {"id": {"$in": user_ids}},
        {
            "_id": 0,
            "id": 1,
            "username": 1,
            "display_name": 1,
            "profile_picture": 1,
            "description": 1,
            "followers_count": 1,
            "following_count": 1,
        }
    ).to_list(None)

    users_by_id = {user["id"]: user for user in users}

    # Which of your followers do you also follow?
    following_docs = await db.follows.find(
        {"follower_id": current_user["id"]},
        {"following_id": 1, "_id": 0}
    ).to_list(None)

    following_ids = {
        doc["following_id"]
        for doc in following_docs
    }

    result = []

    for user_id in user_ids:
        user = users_by_id.get(user_id)

        if not user:
            continue

        result.append({
            **user,
            "is_following": user_id in following_ids
        })

    return result

@router.patch("/me", response_model=User)
async def update_my_user(
    display_name: Optional[str] = Form(None),
    username: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    favorite_genres: Optional[str] = Form(None),
    favorite_artists: Optional[str] = Form(None),
    currently_listening_album_id: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None),
    current_user=Depends(get_current_user)
):
    user_id = str(current_user["id"])

    updates = {}

    if display_name is not None:
        updates["display_name"] = display_name

    if username is not None:
        updates["username"] = username

    if bio is not None:
        updates["bio"] = bio

    if favorite_genres is not None:
        try:
            genres = json.loads(favorite_genres)

            if not isinstance(genres, list):
                raise HTTPException(
                    status_code=400,
                    detail="Favorite genres must be a list."
                )

            updates["favorite_genres"] = genres

        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Invalid favorite genres format."
            )

    if favorite_artists is not None:
        try:
            artists = json.loads(favorite_artists)

            if not isinstance(artists, list):
                raise HTTPException(
                    status_code=400,
                    detail="Favorite artists must be a list."
                )

            if len(artists) > 5:
                raise HTTPException(
                    status_code=400,
                    detail="You can select a maximum of 5 favorite artists."
                )

            if len(set(artists)) != len(artists):
                raise HTTPException(
                    status_code=400,
                    detail="Favorite artists cannot contain duplicates."
                )

            updates["favorite_artists"] = artists

        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Invalid favorite artists format."
            )

    if currently_listening_album_id is not None:
        updates["currently_listening_album_id"] = (
            currently_listening_album_id
        )

    # Upload avatar to S3
    if avatar is not None:
        avatar_url = await upload_avatar_to_s3(
            avatar,
            user_id
        )

        updates["avatar_url"] = avatar_url

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

@router.get("/{username}", response_model=ProfileResponse)
async def get_profile(
    username: str,
    current_user=Depends(get_current_user)
):
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
    current_user_id = str(current_user["id"])

    # Check if current user follows this profile
    is_following = False

    if current_user_id != user_id:
        following = await db.follows.find_one({
            "follower_id": current_user_id,
            "following_id": user_id
        })

        is_following = following is not None

    # Get favorite artists
    favorite_artists = []
    is_own_profile = current_user_id == user_id

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

        artists_by_id = {
            artist["id"]: artist
            for artist in artists
        }

        favorite_artists = [
            artists_by_id[artist_id]
            for artist_id in user["favorite_artists"]
            if artist_id in artists_by_id
        ]

    # Get currently listening album
    currently_listening_album = None

    if user.get("currently_listening_album_id"):
        album = await db.albums.find_one(
            {"id": user["currently_listening_album_id"]},
            {
                "_id": 0,
                "id": 1,
                "title": 1,
                "artist": 1,
                "cover_url": 1
            }
        )

        if album:
            currently_listening_album = AlbumReference(
                id=album["id"],
                title=album["title"],
                artist=album["artist"]["name"],
                cover_url=album.get("cover_url")
            )

    return ProfileResponse(
        id=user["id"],
        username=user["username"],
        display_name=user["display_name"],
        email=user.get("email") if is_own_profile else None,
        avatar_url=user.get("avatar_url"),
        bio=user.get("bio"),

        collections_count=user.get("collections_count", 0),
        lists_count=user.get("lists_count", 0),
        debates_count=user.get("debates_count", 0),
        following_count=user.get("following_count", 0),
        followers_count=user.get("followers_count", 0),

        is_following=is_following,

        favorite_genres=user.get(
            "favorite_genres",
            []
        ),

        favorite_artists=favorite_artists,

        currently_listening_album=currently_listening_album,
    )

@router.post("/{user_id}/follow")
async def toggle_follow_user(
    user_id: str,
    current_user=Depends(get_current_user)
):
    current_user_id = current_user["id"]

    # Don't allow following yourself
    if user_id == current_user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot follow yourself"
        )

    # Verify target user exists
    target_user = await db.users.find_one({
        "id": user_id
    })

    if not target_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Check existing follow
    existing_follow = await db.follows.find_one({
        "follower_id": current_user_id,
        "following_id": user_id
    })

    # ---------------------------------------------------------
    # UNFOLLOW
    # ---------------------------------------------------------

    if existing_follow:
        await db.follows.delete_one({
            "follower_id": current_user_id,
            "following_id": user_id
        })

        # Target user loses a follower
        await db.users.update_one(
            {"id": user_id},
            {
                "$inc": {
                    "followers_count": -1
                }
            }
        )

        # Current user loses someone they're following
        await db.users.update_one(
            {"id": current_user_id},
            {
                "$inc": {
                    "following_count": -1
                }
            }
        )

        return {
            "following": False,
            "followers_count": max(
                0,
                target_user.get("followers_count", 0) - 1
            ),
            "message": "User unfollowed"
        }

    # ---------------------------------------------------------
    # FOLLOW
    # ---------------------------------------------------------

    follow = UserFollow(
        follower_id=current_user_id,
        following_id=user_id
    )

    await db.follows.insert_one(
        follow.model_dump(mode="json")
    )

    # Target user gains a follower
    await db.users.update_one(
        {"id": user_id},
        {
            "$inc": {
                "followers_count": 1
            }
        }
    )

    # Current user gains someone they're following
    await db.users.update_one(
        {"id": current_user_id},
        {
            "$inc": {
                "following_count": 1
            }
        }
    )

    return {
        "following": True,
        "followers_count": target_user.get("followers_count", 0) + 1,
        "message": "User followed"
    }

@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: str):

    result = await db.users.delete_one(
        {"id": user_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return None

@router.post("/google/access-token")
async def google_login(payload: GoogleLoginRequest):

    # Get the Google profile using the access token.
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={
                "Authorization": f"Bearer {payload.access_token}"
            },
        )

    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google access token",
        )

    google_user = response.json()

    if (
        not google_user.get("sub")
        or not google_user.get("email")
        or not google_user.get("email_verified")
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account email is not verified",
        )

    google_id = google_user["sub"]
    email = google_user["email"].strip().lower()

    # Find an account already linked to this Google identity.
    user = await db.users.find_one({"google_id": google_id})

    if not user:
        # Check whether this email already belongs to an account.
        user = await db.users.find_one({"email": email})

        if user:
            # Don't silently link a different Google identity.
            if user.get("google_id") and user["google_id"] != google_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email is linked to another Google account",
                )

            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"google_id": google_id}},
            )

            user["google_id"] = google_id

        else:
            # Generate a unique username.
            base_username = (
                google_user.get("given_name")
                or email.split("@")[0]
            ).strip().lower()

            base_username = "".join(
                char
                for char in base_username
                if char.isalnum() or char in "_-"
            )[:25] or "user"

            username = base_username
            suffix = 1

            while await db.users.find_one({"username": username}):
                suffix += 1
                username = f"{base_username[:20]}{suffix}"

            # Create the new SpinRealm user.
            user_model = User(
                username=username,
                display_name=google_user.get("name") or username,
                email=email,
                password_hash=None,
                avatar_url=google_user.get("picture"),
            )

            user_data = user_model.model_dump(mode="json")
            user_data["google_id"] = google_id

            await db.users.insert_one(user_data)
            user = user_data

    # Return the same response structure as email login/register.
    return build_auth_response(user)