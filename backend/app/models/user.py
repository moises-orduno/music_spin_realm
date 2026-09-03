from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, timezone
import uuid
from typing import Optional, List

from enum import Enum
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr, Field
import uuid


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    email: EmailStr
    username: str
    display_name: str
    password_hash: str

    role: UserRole = UserRole.USER

    avatar_url: Optional[str] = None
    bio: Optional[str] = None

    followed_artists: List[str] = Field(default_factory=list)
    followed_albums: List[str] = Field(default_factory=list)

    followers_count: int = 0
    following_count: int = 0

    lists_count: int = 0
    debates_count: int = 0

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    display_name: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
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