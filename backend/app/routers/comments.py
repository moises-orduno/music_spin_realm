from fastapi import APIRouter, HTTPException
from db.mongodb import db
from typing import List, Optional

from models.comment import CommentCreate
from models.comment import Comment
from models.comment import ReplyCreate
from models.comment import CommentVoteRequest

from utils import _serialize

router = APIRouter(
    prefix="/comments",
    tags=["Comments"]
)

@router.post("/{debate_id}/comments")
async def add_comment(
    debate_id: str,
    payload: CommentCreate
):
    debate = await db.debates.find_one({"id": debate_id})

    if not debate:
        raise HTTPException(404, "Debate not found")

    comment = Comment(
        debate_id=debate_id,
        text=payload.text,
        author=payload.author
    )

    await db.comments.insert_one(comment.model_dump())

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

@router.post("/comments/{comment_id}/reply")
async def reply_comment(
    comment_id: str,
    payload: ReplyCreate
):
    parent = await db.comments.find_one(
        {"id": comment_id}
    )

    if not parent:
        raise HTTPException(404, "Comment not found")

    reply = Comment(
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

@router.post("/comments/{comment_id}/vote")
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

@router.get("/{debate_id}/comments")
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