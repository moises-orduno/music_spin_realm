from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from models.user import UserReference
from models.album import AlbumReference
from enum import Enum

class HuntAlbum(BaseModel):
    id: str
    title: str
    artist: str
    cover_url: Optional[str] = None


class HuntPrice(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None
    currency: str


class HuntCard(BaseModel):
    id: str
    album: HuntAlbum
    pressing: str
    condition: str
    price: HuntPrice
    details: Optional[str] = None
    hunters_count: int = 1


class HuntStatus(str, Enum):
    HUNTING = "hunting"
    FOUND = "found"
    COMPLETED = "completed"

class Hunt(BaseModel):
    id: str
    owner: UserReference
    album: AlbumReference

    pressing: str
    country_pressing: Optional[str] = None
    year: Optional[int] = None
    condition: str

    seller_location: Optional[str] = None
    ship_to: Optional[str] = None

    price: HuntPrice
    details: Optional[str] = None

    status: HuntStatus = HuntStatus.HUNTING

    created_at: datetime = Field(
            default_factory=lambda: datetime.now(timezone.utc)
        )

class CreateHuntRequest(BaseModel):
    album_id: str
    pressing: str
    country_pressing: Optional[str] = None
    year: Optional[int] = None
    condition: str
    seller_location: Optional[str] = None
    ship_to: Optional[str] = None
    price: HuntPrice
    details: Optional[str] = None
    status: HuntStatus = HuntStatus.HUNTING