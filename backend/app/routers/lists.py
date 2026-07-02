from fastapi import APIRouter, HTTPException, Depends

from db.mongodb import db
from models.topList import TopList,TopListCreate
from helpers.token_helper import get_current_user
from models.user import UserReference

router = APIRouter(
    prefix="/list",
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
                item["album"]
                for item in doc.get("items", [])[:3]
            ]
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