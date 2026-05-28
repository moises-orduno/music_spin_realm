from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ============ Models ============

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


class DebateOption(BaseModel):
    label: str
    votes: int = 0
    color: Optional[str] = None


class Debate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: Optional[str] = ""
    type: Literal["vs", "binary", "album-pick", "game"] = "binary"
    badge: str = "TRENDING"  # TRENDING | HOT | NEW | CONTROVERSIAL | MOST_COMMENTED | FUN_GAMES
    badge_color: str = "#8b5cf6"
    image: Optional[str] = None
    tags: List[str] = []
    options: List[DebateOption] = []
    contenders: Optional[List[dict]] = None  # for vs type
    extra: Optional[dict] = None              # for vs with 3rd option
    albums: Optional[List[dict]] = None       # for album-pick
    avatars: Optional[int] = None             # for game type
    stat: Optional[str] = None                # for game
    cta: Optional[str] = None                 # for game
    comments: int = 0
    created_by: str = "anonymous"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DebateCreate(BaseModel):
    title: str
    subtitle: Optional[str] = ""
    type: Literal["vs", "binary", "album-pick", "game"] = "binary"
    badge: str = "NEW"
    badge_color: str = "#10b981"
    image: Optional[str] = None
    tags: List[str] = []
    options: List[DebateOption] = []
    contenders: Optional[List[dict]] = None
    extra: Optional[dict] = None
    albums: Optional[List[dict]] = None
    avatars: Optional[int] = None
    stat: Optional[str] = None
    cta: Optional[str] = None
    created_by: str = "anonymous"


class DebateUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    badge: Optional[str] = None
    badge_color: Optional[str] = None
    tags: Optional[List[str]] = None


class VoteRequest(BaseModel):
    option_index: int


# ============ Helpers ============

def _serialize(doc: dict) -> dict:
    if doc is None:
        return None
    doc.pop("_id", None)
    if isinstance(doc.get("created_at"), str):
        try:
            doc["created_at"] = datetime.fromisoformat(doc["created_at"])
        except Exception:
            pass
    return doc


# ============ Status (existing) ============

@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# ============ Debates CRUD ============

@api_router.get("/debates", response_model=List[Debate])
async def list_debates(badge: Optional[str] = None, limit: int = 100):
    query = {}
    if badge:
        query["badge"] = badge.upper()
    docs = await db.debates.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return [_serialize(d) for d in docs]


@api_router.get("/debates/{debate_id}", response_model=Debate)
async def get_debate(debate_id: str):
    doc = await db.debates.find_one({"id": debate_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Debate not found")
    return _serialize(doc)


@api_router.post("/debates", response_model=Debate, status_code=201)
async def create_debate(payload: DebateCreate):
    debate = Debate(**payload.model_dump())
    doc = debate.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.debates.insert_one(doc)
    return debate


@api_router.patch("/debates/{debate_id}", response_model=Debate)
async def update_debate(debate_id: str, payload: DebateUpdate):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.debates.update_one({"id": debate_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Debate not found")
    doc = await db.debates.find_one({"id": debate_id}, {"_id": 0})
    return _serialize(doc)


@api_router.delete("/debates/{debate_id}", status_code=204)
async def delete_debate(debate_id: str):
    result = await db.debates.delete_one({"id": debate_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Debate not found")
    return None


@api_router.post("/debates/{debate_id}/vote", response_model=Debate)
async def vote_debate(debate_id: str, payload: VoteRequest):
    doc = await db.debates.find_one({"id": debate_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Debate not found")
    options = doc.get("options", [])
    if payload.option_index < 0 or payload.option_index >= len(options):
        raise HTTPException(status_code=400, detail="Invalid option_index")
    await db.debates.update_one(
        {"id": debate_id},
        {"$inc": {f"options.{payload.option_index}.votes": 1}}
    )
    updated = await db.debates.find_one({"id": debate_id}, {"_id": 0})
    return _serialize(updated)


@api_router.post("/debates/seed")
async def seed_debates():
    """Seed the database with sample debates if empty."""
    count = await db.debates.count_documents({})
    if count > 0:
        return {"seeded": False, "existing_count": count}

    samples = [
        {
            "title": "Who did more for metal?",
            "subtitle": "The foundation. The evolution. The legacy.",
            "type": "vs",
            "badge": "TRENDING",
            "badge_color": "#8b5cf6",
            "contenders": [
                {"name": "Black Sabbath", "pct": 42, "image": "linear-gradient(135deg, #3a3a3a, #0a0a0a)"},
                {"name": "Metallica", "pct": 38, "image": "linear-gradient(135deg, #2a2a2a, #050505)"},
            ],
            "extra": {"name": "AC/DC", "pct": 20},
            "options": [
                {"label": "Black Sabbath", "votes": 966, "color": "#8b5cf6"},
                {"label": "Metallica", "votes": 874, "color": "#a78bfa"},
                {"label": "AC/DC", "votes": 460, "color": "#56536b"},
            ],
            "tags": ["Metal", "Rock"],
            "comments": 652,
        },
        {
            "title": "Can you separate art from the artist?",
            "subtitle": "Where do you draw the line?",
            "type": "binary",
            "badge": "HOT",
            "badge_color": "#ef4444",
            "options": [
                {"label": "Yes", "votes": 4698, "color": "#8b5cf6"},
                {"label": "No", "votes": 3402, "color": "#56536b"},
            ],
            "tags": ["Philosophy"],
            "comments": 2100,
        },
        {
            "title": "Beatles vs Beach Boys: who had better harmonies?",
            "type": "vs",
            "badge": "TRENDING",
            "badge_color": "#8b5cf6",
            "contenders": [
                {"name": "The Beatles", "pct": 63, "image": "linear-gradient(135deg, #4a4a5a, #1a1a25)"},
                {"name": "The Beach Boys", "pct": 37, "image": "linear-gradient(135deg, #c2a876, #3a2a15)"},
            ],
            "options": [
                {"label": "The Beatles", "votes": 3402, "color": "#8b5cf6"},
                {"label": "The Beach Boys", "votes": 1998, "color": "#56536b"},
            ],
            "tags": ["Beatles", "Beach Boys"],
            "comments": 1200,
        },
        {
            "title": "Which album has no skips?",
            "subtitle": "Name the perfect album.",
            "type": "album-pick",
            "badge": "NEW",
            "badge_color": "#10b981",
            "albums": [
                {"title": "Dark Side of the Moon", "cover": "radial-gradient(circle, #fff, #6ab0d8 28%, #0a1530 60%)"},
                {"title": "In Rainbows", "cover": "linear-gradient(135deg, #e85a2f, #8a2f14)"},
                {"title": "Rumours", "cover": "linear-gradient(135deg, #c2a876, #3a2a15)"},
                {"title": "Nevermind", "cover": "linear-gradient(135deg, #1a5a9c, #0a2f5c)"},
                {"title": "OK Computer", "cover": "linear-gradient(135deg, #8a8575, #3a3630)"},
            ],
            "options": [
                {"label": "Dark Side of the Moon", "votes": 800},
                {"label": "In Rainbows", "votes": 620},
                {"label": "Rumours", "votes": 540},
                {"label": "Nevermind", "votes": 720},
                {"label": "OK Computer", "votes": 420},
            ],
            "tags": ["Albums"],
            "comments": 894,
        },
        {
            "title": "Form your band: 90s Edition",
            "subtitle": "You have $30. Build the ultimate 90s band.",
            "type": "game",
            "badge": "FUN & GAMES",
            "badge_color": "#a78bfa",
            "avatars": 6,
            "stat": "1.7K lineups created",
            "cta": "Play Now",
            "options": [],
            "tags": ["90s", "Game"],
            "comments": 412,
        },
        {
            "title": "Is rock dead, or just sleeping?",
            "type": "binary",
            "badge": "CONTROVERSIAL",
            "badge_color": "#f59e0b",
            "options": [
                {"label": "Dead", "votes": 1312, "color": "#8b5cf6"},
                {"label": "Sleeping", "votes": 2788, "color": "#56536b"},
            ],
            "tags": ["Rock"],
            "comments": 1100,
        },
    ]

    inserted = []
    for s in samples:
        d = Debate(**s)
        doc = d.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.debates.insert_one(doc)
        inserted.append(d.id)
    return {"seeded": True, "count": len(inserted), "ids": inserted}


# ============ Wire up ============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
