from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone

class DebateOption(BaseModel):
    label: str
    votes: int = 0
    color: Optional[str] = None


class Debate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    # Content
    title: str
    subtitle: Optional[str] = ""
    image: Optional[str] = None
    tags: List[str] = []

    # Debate type
    type: Literal["vs", "binary", "album-pick", "game"] = "binary"

    # UI badge (can be computed dynamically later)
    badge: Optional[str] = None
    badge_color: Optional[str] = None

    # Voting
    options: List[DebateOption] = []
    total_votes: int = 0

    # Debate-specific data
    contenders: Optional[List[dict]] = None
    extra: Optional[dict] = None
    albums: Optional[List[dict]] = None

    # Game-specific data
    avatars: Optional[int] = None
    stat: Optional[str] = None
    cta: Optional[str] = None

    # Engagement
    comments: int = 0
    views: int = 0
    shares: int = 0

    # Moderation / curation
    featured: bool = False
    pinned: bool = False

    # Metadata
    created_by: str = "anonymous"
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class DebateCreate(BaseModel):
    title: str
    subtitle: Optional[str] = ""
    type: Literal["vs", "binary", "album-pick", "game"] = "binary"
    badge: str = "NEW"
    badge_color: str = "#10b981"
    image: Optional[str] = None
    tags: List[str] = []
    options: List[DebateOption] = []
    extra: Optional[dict] = None
    avatars: Optional[int] = None
    total_votes: int = 0
    cta: Optional[str] = None
    created_by: str = "anonymous"


class DebateUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    badge: Optional[str] = None
    badge_color: Optional[str] = None
    tags: Optional[List[str]] = None


class VoteRequest(BaseModel):
    debate_id: str
    user_id: str
    option_index: int

class Vote(BaseModel):
    debate_id: str
    user_id: str
    option_index: int