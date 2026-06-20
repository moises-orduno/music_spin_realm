from fastapi import APIRouter, HTTPException
from db.mongodb import db
from typing import List, Optional

from models.debate import Debate
from models.debate import DebateCreate
from models.debate import DebateUpdate
from models.debate import VoteRequest

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


@router.post("/debates/{debate_id}/vote", response_model=Debate)
async def vote_debate(debate_id: str, payload: VoteRequest):
    doc = await db.debates.find_one({"id": debate_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Debate not found")
    options = doc.get("options", [])
    if payload.option_index < 0 or payload.option_index >= len(options):
        raise HTTPException(status_code=400, detail="Invalid option_index")
 