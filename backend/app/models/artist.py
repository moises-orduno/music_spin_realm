# models/artist.py

from pydantic import BaseModel, Field
from typing import Optional, List
import uuid


class Artist(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    name: str

    image_url: Optional[str] = None

    country: Optional[str] = None

    formed_year: Optional[int] = None

    genres: List[str] = []

    monthly_list_appearances: int = 0

    total_lists: int = 0

    total_debates: int = 0

    followers: int = 0

    created_by: str = "system"


class ArtistCreate(BaseModel):
    name: str

    image_url: Optional[str] = None

    country: Optional[str] = None

    formed_year: Optional[int] = None

    genres: List[str] = []

class ArtistReference(BaseModel):
    artist_id: str
    name: str
    image_url: Optional[str] = None