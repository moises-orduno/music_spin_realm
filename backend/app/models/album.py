from pydantic import BaseModel
from typing import Optional, List
import uuid
from pydantic import Field
from models.artist import ArtistReference
from models.track import Track

class Album(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    artist: ArtistReference
    year: Optional[int] = None
    cover_url: Optional[str] = None
    genres: List[str] = Field(default_factory=list)
    label: Optional[str] = None
    tracks: List[Track] = Field(default_factory=list)
    total_lists: int = 0
    total_debates: int = 0
    country: Optional[str] = None
    description: Optional[str] = None
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
    genres: List[str] = Field(default_factory=list)
    label: Optional[str] = None
    country: Optional[str] = None
    description: Optional[str] = None
    tracks: List[Track] = Field(default_factory=list)

class AlbumUpdate(BaseModel):
    title: Optional[str] = None
    year: Optional[int] = None
    cover_url: Optional[str] = None
    genres: Optional[List[str]] = None

class AlbumSuggestionRequest(BaseModel):
    album_ids: list[str]
    limit: int = 10
    
class AlbumSearchRequest(BaseModel):
    query: str
    list_id: Optional[str] = None
    limit: int = 10