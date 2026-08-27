from pydantic import BaseModel
from typing import Optional

from models.album import AlbumReference
from models.track import TrackReference


class ListItem(BaseModel):
    position: int
    album: AlbumReference
    why_this_album: Optional[str] = None
    favorite_track: Optional[TrackReference] = None
    favorite_lyric: Optional[str] = None
    owned: bool = False
    hunting: bool = False

class ListItemCreate(BaseModel):
    album_id: str
    position: int
    why_this_album: str
    favorite_lyric: Optional[str] = None
    owned: bool = False
    hunting: bool = False