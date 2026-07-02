from fastapi import APIRouter, HTTPException, Depends
from db.mongodb import db
from typing import List, Optional

from models.debate import Debate
from models.debate import DebateCreate
from models.debate import DebateUpdate
from models.debate import VoteRequest

from helpers.token_helper import get_current_user

from utils import _serialize

router = APIRouter(
    prefix="/debates",
    tags=["Debates"]
)

# ============ Debates CRUD ============

@router.get("", response_model=List[Debate])
async def list_debates(badge: Optional[str] = None, limit: int = 100):
    query = {}
    if badge:
        query["badge"] = badge.upper()
    docs = await db.debates.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return [_serialize(d) for d in docs]


@router.get("/{debate_id}", response_model=Debate)
async def get_debate(debate_id: str):
    doc = await db.debates.find_one({"id": debate_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Debate not found")
    return _serialize(doc)


@router.post("", response_model=Debate, status_code=201)
async def create_debate(payload: DebateCreate):
    debate = Debate(**payload.model_dump())
    doc = debate.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.debates.insert_one(doc)
    return debate


@router.patch("/{debate_id}", response_model=Debate)
async def update_debate(debate_id: str, payload: DebateUpdate):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.debates.update_one({"id": debate_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Debate not found")
    doc = await db.debates.find_one({"id": debate_id}, {"_id": 0})
    return _serialize(doc)


@router.delete("/{debate_id}", status_code=204)
async def delete_debate(debate_id: str):
    result = await db.debates.delete_one({"id": debate_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Debate not found")
    return None

@router.post("/{debate_id}/vote")
async def vote_debate(
    debate_id: str,
    payload: VoteRequest,
    current_user=Depends(get_current_user)
):
    user_id = current_user["id"]

    # Check debate exists
    debate = await db.debates.find_one({"id": debate_id})
    if not debate:
        raise HTTPException(404, "Debate not found")

    # Validate option
    options = debate.get("options", [])
    if payload.option_index < 0 or payload.option_index >= len(options):
        raise HTTPException(400, "Invalid option_index")

    # 3. Check existing vote for this user
    existing_vote = await db.votes.find_one({
        "debate_id": debate_id,
        "user_id": payload.user_id
    })

    # -------------------------
    # CASE 1: No previous vote → CREATE
    # -------------------------
    if not existing_vote:
        await db.votes.insert_one({
            "debate_id": debate_id,
            "user_id": payload.user_id,
            "option_index": payload.option_index
        })

        await db.debates.update_one(
            {"id": debate_id},
            {
                "$inc": {
                    f"options.{payload.option_index}.votes": 1,
                    "total_votes": 1
                }
            }
        )

        return {"action": "created"}

    # -------------------------
    # CASE 2: Clicking SAME option → REMOVE (toggle off)
    # -------------------------
    if existing_vote["option_index"] == payload.option_index:

        await db.votes.delete_one({
            "debate_id": debate_id,
            "user_id": payload.user_id
        })

        await db.debates.update_one(
            {"id": debate_id},
            {
                "$inc": {
                    f"options.{payload.option_index}.votes": -1,
                    "total_votes": -1
                }
            }
        )

        return {"action": "removed"}

    # -------------------------
    # CASE 3: Switching vote
    # -------------------------
    old_index = existing_vote["option_index"]
    new_index = payload.option_index

    await db.votes.update_one(
        {"_id": existing_vote["_id"]},
        {"$set": {"option_index": new_index}}
    )

    await db.debates.update_one(
        {"id": debate_id},
        {
            "$inc": {
                f"options.{old_index}.votes": -1,
                f"options.{new_index}.votes": 1
            }
        }
    )

    return {"action": "switched"}