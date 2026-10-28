from pydantic import BaseModel
from typing import Optional

from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field

from enum import Enum


class ListingStatus(str, Enum):
    AVAILABLE = "available"
    SOLD = "sold"
    RESERVED = "reserved"
    PENDING = "pending"
    DRAFT = "draft"
    REMOVED = "removed"

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class RecommendedListingCreate(BaseModel):
    album_id: str

    # Sale
    price: float = Field(gt=0)
    currency: str = "USD"

    # Inventory lifecycle
    status: ListingStatus = ListingStatus.AVAILABLE
    sold_at: Optional[datetime] = None

    # Pressing
    pressing_country: Optional[str] = None
    pressing_year: Optional[int] = None
    label: Optional[str] = None
    catalog_number: Optional[str] = None
    pressing_description: Optional[str] = None

    # Format
    format: Optional[str] = None
    speed: Optional[int] = None
    channels: Optional[str] = None

    # Condition
    media_condition: Optional[str] = None
    sleeve_condition: Optional[str] = None

    # Additional details
    matrix_runout: Optional[str] = None
    edition: Optional[str] = None
    mastering: Optional[str] = None
    notes: Optional[str] = None

    # Photos
    images: list[str] = Field(default_factory=list)