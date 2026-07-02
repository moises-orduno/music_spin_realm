import uuid
from typing import Optional, Literal
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    debate_id: str

    parent_comment_id: Optional[str] = None

    text: str
    author: str = "anonymous"

    votes: int = 0
    replies_count: int = 0

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

class ReplyCreate(BaseModel):
    text: str
    author: str = "anonymous"

class CommentVoteRequest(BaseModel):
    direction: Literal["up", "down"]


class CommentCreate(BaseModel):
    text: str
    parent_comment_id: Optional[str] = None