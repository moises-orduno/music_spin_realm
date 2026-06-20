from pydantic import BaseModel
from typing import Optional, List
import uuid
from pydantic import Field
from models.artist import ArtistReference

class Album(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    artist: ArtistReference
    year: Optional[int] = None
    cover_url: Optional[str] = None
    genres: List[str] = []
    label: Optional[str] = None
    total_lists: int = 0
    total_debates: int = 0
    created_by: str = "system"

class AlbumReference(BaseModel):
    id: str
    title: str
    artist: str
    cover_url: Optional[str] = None

class AlbumCreate(BaseModel):
    title: str
    artist: ArtistReference
    year: Optional[int] = None
    cover_url: Optional[str] = None
    genres: List[str] = []
    label: Optional[str] = None