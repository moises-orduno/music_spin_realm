from fastapi import APIRouter, HTTPException, Depends
from db.mongodb import db

from models.comment import CommentDebate,CommentList,ReplyCreate,CommentVoteRequest,CommentCreate
from helpers.token_helper import get_current_user
from models.user import UserReference

router = APIRouter(
    prefix="/comments",
    tags=["Comments"]
)

@router.post("/debates/{debate_id}")
async def add_debate_comment(
    debate_id: str,
    payload: CommentCreate,
    current_user=Depends(get_current_user)
):
    debate = await db.debates.find_one({"id": debate_id})

    if not debate:
        raise HTTPException(
            status_code=404,
            detail="Debate not found"
        )

    author = UserReference(
        user_id=current_user["id"],
        username=current_user["username"],
        display_name=current_user["display_name"],
        avatar_url=current_user.get("avatar_url")
    )

    comment = CommentDebate(
        debate_id=debate_id,
        text=payload.text,
        parent_comment_id=payload.parent_comment_id,
        author=author
    )

    await db.comments.insert_one(
        comment.model_dump()
    )

    await db.debates.update_one(
        {"id": debate_id},
        {
            "$inc": {
                "comments": 1,
                "relevance_score": 5
            }
        }
    )

    return comment

@router.post("/{comment_id}/reply")
async def reply_comment(
    comment_id: str,
    payload: ReplyCreate
):
    parent = await db.comments.find_one(
        {"id": comment_id}
    )

    if not parent:
        raise HTTPException(404, "Comment not found")

    reply = CommentDebate(
        debate_id=parent["debate_id"],
        parent_comment_id=comment_id,
        text=payload.text,
        author=payload.author
    )

    await db.comments.insert_one(reply.model_dump())

    await db.comments.update_one(
        {"id": comment_id},
        {"$inc": {"replies_count": 1}}
    )

    return reply

@router.post("/{comment_id}/vote")
async def vote_comment(
    comment_id: str,
    payload: CommentVoteRequest
):
    increment = 1 if payload.direction == "up" else -1

    result = await db.comments.update_one(
        {"id": comment_id},
        {
            "$inc": {
                "votes": increment
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(404, "Comment not found")

    return {"success": True}

@router.get("/debates/{debate_id}")
async def get_comments(debate_id: str):
    comments = await (
        db.comments
        .find(
            {
                "debate_id": debate_id,
                "parent_comment_id": None
            },
            {"_id": 0}
        )
        .sort("votes", -1)
        .to_list(100)
    )

    return comments

# Create comment for a list
@router.post("/lists/{list_id}", response_model=CommentList, status_code=201)
async def add_list_comment(
    list_id: str,
    payload: CommentCreate,
    current_user=Depends(get_current_user)
):

    top_list = await db.lists.find_one(
        {"id": list_id}
    )

    if not top_list:
        raise HTTPException(
            status_code=404,
            detail="List not found"
        )

    author = UserReference(
        user_id=current_user["id"],
        username=current_user["username"],
        display_name=current_user["display_name"],
        avatar_url=current_user.get("avatar_url")
    )

    comment = CommentList(
        list_id=list_id,
        text=payload.text,
        parent_comment_id=payload.parent_comment_id,
        author=author
    )

    await db.comments.insert_one(
        comment.model_dump()
    )

    await db.lists.update_one(
        {"id": list_id},
        {
            "$inc": {
                "comments_count": 1,
                "relevance_score": 5
            }
        }
    )

    return comment


# Get comments for a list
@router.get("/lists/{list_id}")
async def get_list_comments(
    list_id: str,
    limit: int = 100
):

    comments = await (
        db.comments
        .find(
            {
                "list_id": list_id,
                "parent_comment_id": None
            },
            {
                "_id": 0
            }
        )
        .sort(
            "likes_count",
            -1
        )
        .to_list(limit)
    )

    return comments