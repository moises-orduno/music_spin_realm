from pydantic import BaseModel
from typing import Optional

from models.album import AlbumReference


class ListItem(BaseModel):
    position: int
    album: AlbumReference
    why_this_album: str
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