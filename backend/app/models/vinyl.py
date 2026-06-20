from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timezone
import uuid

from models.album import AlbumReference
from models.user import UserReference


class VinylListing(BaseModel):

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    views_count: int = 0

    likes_count: int = 0

    status: Literal[
        "available",
        "reserved",
        "sold"
    ] = "available"

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

class VinylListingCreate(BaseModel):

    seller: UserReference

    album: AlbumReference

    price: float

    special_price: Optional[float] = None

    currency: str = "USD"

    media_condition: Literal[
        "M", "NM", "VG+", "VG", "G", "F", "P"
    ]

    sleeve_condition: Literal[
        "M", "NM", "VG+", "VG", "G", "F", "P"
    ]

    pressing_country: Optional[str] = None

    pressing_year: Optional[int] = None

    label: Optional[str] = None

    catalog_number: Optional[str] = None

    barcode: Optional[str] = None

    edition: Optional[str] = None

    color_variant: Optional[str] = None

    is_reissue: bool = False

    is_first_press: bool = False

    is_limited_edition: bool = False

    numbered_copy: Optional[str] = None

    notes: Optional[str] = None

    images: List[str] = []