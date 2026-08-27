from pydantic import BaseModel, Field
from typing import Optional, List
import uuid

from models.artist import ArtistReference


class Track(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    track_number: int
    duration_seconds: Optional[int] = None
    # Useful for vinyl
    side: Optional[str] = None  # A, B, C, D
    # Optional if you eventually support collaborations
    artists: List[ArtistReference] = []
    is_bonus_track: bool = False

class TrackReference(BaseModel):
    id: str
    title: str

class TrackUpdate(BaseModel):
    title: Optional[str] = None
    track_number: Optional[int] = None
    duration_seconds: Optional[int] = None
    side: Optional[str] = None