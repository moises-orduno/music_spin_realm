from fastapi import APIRouter, HTTPException, Depends
import uuid
from db.mongodb import db
from models.topList import TopList,TopListCreate
from helpers.token_helper import get_current_user, get_optional_user
from models.user import UserReference
from datetime import datetime, timezone

router = APIRouter(
    prefix="/lists",
    tags=["Lists"]
)

@router.get("")
async def list_lists(limit: int = 50):

    docs = (
        await db.lists
        .find({}, {"_id": 0})
        .sort("likes_count", -1)
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

    top_list = TopList(
        creator_id=current_user["id"],
        owner=owner,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        items=payload.items
    )

    await db.lists.insert_one(
        top_list.model_dump()
    )

    return top_list

@router.put("/{list_id}", response_model=TopList)
async def update_list(
    list_id: str,
    payload: TopListCreate,
    current_user=Depends(get_current_user)
):

    # Find existing list
    existing_list = await db.lists.find_one(
        {"id": list_id}
    )

    if not existing_list:
        raise HTTPException(
            status_code=404,
            detail="List not found"
        )

    # Verify ownership
    if existing_list["creator_id"] != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only edit your own lists"
        )

    update_data = {
        "title": payload.title,
        "description": payload.description,
        "category": payload.category,
        "items": payload.items,
        "updated_at": datetime.utcnow()
    }

    await db.lists.update_one(
        {"id": list_id},
        {
            "$set": update_data
        }
    )

    updated_list = await db.lists.find_one(
        {"id": list_id}
    )

    return TopList(**updated_list)

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

    original.pop("id", None)

    owner = UserReference(
        user_id=current_user["id"],
        username=current_user["username"],
        display_name=current_user["display_name"],
        avatar_url=current_user.get("avatar_url")
    )

    remix = TopList(
        **original,
        creator_id=current_user["id"],
        owner=owner,
        parent_list_id=list_id
    )

    await db.lists.insert_one(
        remix.model_dump()
    )

    await db.lists.update_one(
        {"id": list_id},
        {"$inc": {"remix_count": 1}}
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