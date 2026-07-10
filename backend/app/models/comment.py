import uuid
from typing import Optional, Literal
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from models.user import UserReference

class CommentDebate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    debate_id: str
    author: UserReference
    text: str
    parent_comment_id: Optional[str] = None
    likes: int = 0
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

class CommentList(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    list_id: str
    author: UserReference
    text: str
    parent_comment_id: Optional[str] = None
    likes: int = 0
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