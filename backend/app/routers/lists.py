from fastapi import APIRouter, HTTPException, Depends
import uuid
from db.mongodb import db
from models.topList import TopList,TopListCreate, TopListUpdate
from helpers.token_helper import get_current_user, get_optional_user
from models.user import UserReference
from datetime import datetime, timezone
import copy
from models.remixList import RemixCreate
from models.listItem import ListItem, ListItemCreate
from models.album import AlbumReference

router = APIRouter(
    prefix="/lists",
    tags=["Lists"]
)

@router.get("")
async def list_lists(limit: int = 50):

    docs = (
        await db.lists
        .find(
            {"parent_list_id": None},
            {"_id": 0}
        )
        .sort("likes_count", -1)
        .to_list(limit)
    )

    result = []

    for doc in docs:
        recent_albums = []

        for item in doc.get("items", [])[-3:]:
            album = item.get("album")

            if not album:
                continue

            recent_albums.append({
                "position": item.get("position"),
                "album": album
            })

        result.append({
            "id": doc["id"],
            "title": doc["title"],
            "image": doc.get("thumbnail_url"),
            "likes_count": doc.get("likes_count", 0),
            "comments_count": doc.get("comments_count", 0),
            "remix_count": doc.get("remix_count", 0),
            "items_count": len(doc.get("items", [])),
            "recent_albums": recent_albums
        })

    return result

@router.get("/me")
async def list_my_lists(
    current_user=Depends(get_current_user),
    limit: int = 50,
):

    docs = (
        await db.lists
        .find(
            {
                "creator_id": current_user["id"],
                "parent_list_id": None,
            },
            {"_id": 0}
        )
        .sort("created_at", -1)
        .to_list(limit)
    )

    result = []

    for doc in docs:
        result.append({
            "id": doc["id"],
            "title": doc["title"],
            "image": doc.get("thumbnail_url"),
            "likes_count": doc.get("likes_count", 0),
            "comments_count": doc.get("comments_count", 0),
            "remix_count": doc.get("remix_count", 0),
            "items_count": len(doc.get("items", [])),
            "recent_albums": [
                {
                    "position": item["position"],
                    "album": item["album"]
                }
                for item in doc.get("items", [])[-3:]
            ]
        })

    return result


@router.get("/saved")
async def get_saved_lists(
    limit: int = 50,
    current_user=Depends(get_current_user)
):
    saved_docs = (
        await db.saved_lists
        .find(
            {"user_id": current_user["id"]},
            {"_id": 0}
        )
        .sort("saved_at", -1)
        .to_list(limit)
    )

    list_ids = [doc["list_id"] for doc in saved_docs]

    if not list_ids:
        return []

    docs = await db.lists.find(
        {
            "id": {"$in": list_ids},
            "parent_list_id": None
        },
        {"_id": 0}
    ).to_list(None)

    docs_by_id = {doc["id"]: doc for doc in docs}

    result = []

    for list_id in list_ids:
        doc = docs_by_id.get(list_id)

        if not doc:
            continue

        recent_albums = [
            {
                "position": item.get("position"),
                "album": item.get("album")
            }
            for item in doc.get("items", [])[-3:]
            if item.get("album")
        ]

        result.append({
            "id": doc["id"],
            "title": doc["title"],
            "image": doc.get("thumbnail_url"),
            "likes_count": doc.get("likes_count", 0),
            "comments_count": doc.get("comments_count", 0),
            "remix_count": doc.get("remix_count", 0),
            "items_count": len(doc.get("items", [])),
            "recent_albums": recent_albums,
            "saved": True
        })

    return result

@router.get("/liked")
async def get_liked_lists(
    limit: int = 50,
    current_user=Depends(get_current_user)
):
    like_docs = (
        await db.likes
        .find(
            {"user_id": current_user["id"]},
            {"_id": 0}
        )
        .sort("created_at", -1)
        .to_list(limit)
    )

    list_ids = [doc["list_id"] for doc in like_docs]

    if not list_ids:
        return []

    docs = await db.lists.find(
        {
            "id": {"$in": list_ids},
            "parent_list_id": None
        },
        {"_id": 0}
    ).to_list(None)

    docs_by_id = {doc["id"]: doc for doc in docs}

    result = []

    for list_id in list_ids:
        doc = docs_by_id.get(list_id)

        if not doc:
            continue

        result.append({
            "id": doc["id"],
            "title": doc["title"],
            "image": doc.get("thumbnail_url"),
            "likes_count": doc.get("likes_count", 0),
            "comments_count": doc.get("comments_count", 0),
            "remix_count": doc.get("remix_count", 0),
            "items_count": len(doc.get("items", [])),
            "recent_albums": [
                {
                    "position": item["position"],
                    "album": item["album"]
                }
                for item in doc.get("items", [])[-3:]
            ],
            "liked": True
        })

    return result


@router.post("", response_model=TopList, status_code=201)
async def create_list(
    payload: TopListCreate,
    current_user=Depends(get_current_user)
):

    owner = UserReference(
        user_id=current_user["id"],
        username=current_user["username"],
        display_name=current_user["display_name"],
        avatar_url=current_user.get("avatar_url")
    )

    items = []

    for item in payload.items:
        album = await db.albums.find_one({"id": item.album_id})

        if not album:
            raise HTTPException(
                status_code=404,
                detail=f"Album {item.album_id} not found"
            )

        album_ref = AlbumReference(
            id=album["id"],
            title=album["title"],
            artist=album["artist"]["name"],
            cover_url=album.get("cover_url"),
        )

        items.append(
            ListItem(
                position=item.position,
                album=album_ref,
                why_this_album=item.why_this_album,
                favorite_lyric=item.favorite_lyric,
                owned=item.owned,
                hunting=item.hunting,
            )
        )

    top_list = TopList(
        creator_id=current_user["id"],
        owner=owner,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        is_public=payload.is_public,
        items=items,
    )

    await db.lists.insert_one(
        top_list.model_dump()
    )

    return top_list

@router.get("/{list_id}")
async def get_list(
    list_id: str,
    current_user=Depends(get_optional_user)
):
    doc = await db.lists.find_one(
        {"id": list_id},
        {"_id": 0}
    )

    if not doc:
        raise HTTPException(status_code=404, detail="List not found")

    items = sorted(
        doc.get("items", []),
        key=lambda item: item.get("position", 0)
    )

    liked = False
    saved = False

    if current_user:
        user_id = current_user["id"]

        like = await db.likes.find_one({
            "user_id": user_id,
            "list_id": list_id
        })

        saved_item = await db.saved_lists.find_one({
            "user_id": user_id,
            "list_id": list_id
        })

        liked = like is not None
        saved = saved_item is not None

    return {
        "id": doc["id"],
        "title": doc["title"],
        "description": doc.get("description"),
        "category": doc.get("category"),
        "image": doc.get("thumbnail_url"),
        "owner": doc.get("owner"),
        "likes_count": doc.get("likes_count", 0),
        "comments_count": doc.get("comments_count", 0),
        "remix_count": doc.get("remix_count", 0),
        "liked": liked,
        "saved": saved,
        "items_count": len(items),
        "items": [
            {
                "position": item["position"],
                "why_this_album": item["why_this_album"],
                "favorite_lyric": item.get("favorite_lyric"),
                "owned": item.get("owned", False),
                "hunting": item.get("hunting", False),
                "album": item["album"],
            }
            for item in items
        ],
    }



@router.patch("/{list_id}", response_model=TopList)
async def update_list(
    list_id: str,
    data: TopListUpdate,
    current_user=Depends(get_current_user),
):
    top_list = await db.lists.find_one({
        "id": list_id,
    })

    if not top_list:
        raise HTTPException(
            status_code=404,
            detail="List not found",
        )

    if top_list["creator_id"] != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to edit this list",
        )

    updates = data.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No fields to update",
        )

    if data.items is not None:
        items = []

        for item in data.items:
            list_item = await build_list_item(item)
            items.append(list_item.model_dump())

        updates["items"] = items

    await db.lists.update_one(
        {"id": list_id},
        {"$set": updates},
    )

    updated_list = await db.lists.find_one({
        "id": list_id
    })

    return TopList(**updated_list)

@router.delete("/{list_id}")
async def delete_list(
    list_id: str,
    current_user=Depends(get_current_user),
):
    top_list = await db.top_lists.find_one({
        "id": list_id,
        "creator_id": current_user["id"],
    })

    if not top_list:
        raise HTTPException(
            status_code=404,
            detail="List not found",
        )

    result = await db.top_lists.delete_one({
        "id": list_id,
        "creator_id": current_user["id"],
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="List not found",
        )

    return {
        "message": "List deleted successfully",
        "id": list_id,
    }

async def build_list_item(item: ListItemCreate) -> ListItem:
    album = await db.albums.find_one({"id": item.album_id})

    if not album:
        raise HTTPException(
            status_code=404,
            detail=f"Album {item.album_id} not found"
        )

    album_ref = AlbumReference(
        id=album["id"],
        title=album["title"],
        artist=album["artist"]["name"],
        cover_url=album.get("cover_url"),
    )

    return ListItem(
        position=item.position,
        album=album_ref,
        why_this_album=item.why_this_album,
        favorite_lyric=item.favorite_lyric,
        owned=item.owned,
        hunting=item.hunting,
    )

@router.post("/{list_id}/remix", response_model=TopList)
async def remix_list(
    list_id: str,
    current_user=Depends(get_current_user)
):
    original = await db.lists.find_one(
        {"id": list_id},
        {"_id": 0}
    )

    if not original:
        raise HTTPException(
            status_code=404,
            detail="List not found"
        )

    owner = UserReference(
        user_id=current_user["id"],
        username=current_user["username"],
        display_name=current_user["display_name"],
        avatar_url=current_user.get("avatar_url")
    )

    remix = TopList(
        creator_id=current_user["id"],
        owner=owner,

        title=original["title"],
        description=original.get("description"),
        category=original.get("category"),

        # Copy albums so remix can modify independently
        items=copy.deepcopy(original["items"]),

        parent_list_id=list_id,

        likes_count=0,
        comments_count=0,
        remix_count=0,
        views_count=0,

        is_public=False
    )

    await db.lists.insert_one(
        remix.model_dump()
    )

    await db.lists.update_one(
        {"id": list_id},
        {
            "$inc": {
                "remix_count": 1
            }
        }
    )

    return remix

@router.get("/{list_id}/remixes")
async def get_remixes(
    list_id: str,
    limit: int = 100
):
    remixes = (
        await db.lists
        .find(
            {"parent_list_id": list_id},
            {"_id": 0}
        )
        .sort("likes_count", -1)
        .to_list(limit)
    )

    return remixes

@router.post("/{list_id}/save")
async def toggle_save_list(
    list_id: str,
    current_user=Depends(get_current_user)
):
    # Verify the list exists
    existing_list = await db.lists.find_one({"id": list_id})

    if not existing_list:
        raise HTTPException(status_code=404, detail="List not found")

    # Has the user already saved it?
    saved = await db.saved_lists.find_one({
        "user_id": current_user["id"],
        "list_id": list_id
    })

    if saved:
        # Unsave
        await db.saved_lists.delete_one({"id": saved["id"]})

        return {
            "saved": False,
            "message": "List removed from saved"
        }

    # Save
    save = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "list_id": list_id,
        "saved_at": datetime.now(timezone.utc)
    }

    await db.saved_lists.insert_one(save)

    return {
        "saved": True,
        "message": "List saved"
    }

@router.post("/{list_id}/like")
async def toggle_like_list(
    list_id: str,
    current_user=Depends(get_current_user)
):
    # Verify list exists
    existing_list = await db.lists.find_one({"id": list_id})

    if not existing_list:
        raise HTTPException(
            status_code=404,
            detail="List not found"
        )

    # Check if already liked
    liked = await db.likes.find_one({
        "user_id": current_user["id"],
        "list_id": list_id
    })

    if liked:
        # Remove like
        await db.likes.delete_one({
            "id": liked["id"]
        })

        await db.lists.update_one(
            {"id": list_id},
            {"$inc": {"likes_count": -1}}
        )

        return {
            "liked": False,
            "message": "Like removed"
        }

    # Add like
    like = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "list_id": list_id,
        "created_at": datetime.now(timezone.utc)
    }

    await db.likes.insert_one(like)

    await db.lists.update_one(
        {"id": list_id},
        {"$inc": {"likes_count": 1}}
    )

    return {
        "liked": True,
        "message": "List liked"
    }

@router.post("/{list_id}/remix", response_model=TopList)
async def remix_list(
    list_id: str,
    payload: RemixCreate,
    current_user=Depends(get_current_user)
):
    original = await db.lists.find_one(
        {"id": list_id},
        {"_id": 0}
    )

    if not original:
        raise HTTPException(
            status_code=404,
            detail="List not found"
        )

    owner = UserReference(
        user_id=current_user["id"],
        username=current_user["username"],
        display_name=current_user["display_name"],
        avatar_url=current_user.get("avatar_url")
    )

    remix = TopList(
        creator_id=current_user["id"],
        owner=owner,

        title=payload.title,
        description=payload.description,
        category=payload.category,
        items=payload.items,

        parent_list_id=list_id,

        likes_count=0,
        comments_count=0,
        remix_count=0,
        views_count=0,

        is_public=True
    )

    await db.lists.insert_one(
        remix.model_dump()
    )

    await db.lists.update_one(
        {"id": list_id},
        {
            "$inc": {
                "remix_count": 1
            }
        }
    )

    return remix
