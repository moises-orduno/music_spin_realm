from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import uuid

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    username: str
    display_name: str

    avatar_url: Optional[str] = None
    bio: Optional[str] = None

    followed_artists: List[str] = []
    followed_albums: List[str] = []

    followers_count: int = 0
    following_count: int = 0

    lists_count: int = 0
    debates_count: int = 0

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class UserCreate(BaseModel):
    email: str
    display_name: str

    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class UserReference(BaseModel):
    user_id: str

    username: str

    display_name: str

    avatar_url: Optional[str] = None

class UserFollow(BaseModel):
    follower_id: str

    following_id: str

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
