from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from models.album import Album


class CollectionItemCreate(BaseModel):
    album_id: str

    # Release / pressing information
    pressing: Optional[str] = "Unknown"
    pressing_country: Optional[str] = None
    pressing_year: Optional[int] = None

    label: Optional[str] = None
    catalog_number: Optional[str] = None
    barcode: Optional[str] = None
    matrix_runout: Optional[str] = None
    edition: Optional[str] = None

    # Condition
    media_condition: Optional[str] = None
    sleeve_condition: Optional[str] = None

    # Personal information
    price_paid: Optional[float] = None
    currency: Optional[str] = "USD"
    purchase_date: Optional[datetime] = None
    purchased_from: Optional[str] = None
    notes: Optional[str] = None

    # Source
    source: Optional[str] = "manual"
    source_release_id: Optional[str] = None


class CollectionItemUpdate(BaseModel):
    pressing: Optional[str] = None
    pressing_country: Optional[str] = None
    pressing_year: Optional[int] = None

    label: Optional[str] = None
    catalog_number: Optional[str] = None
    barcode: Optional[str] = None
    matrix_runout: Optional[str] = None
    edition: Optional[str] = None

    media_condition: Optional[str] = None
    sleeve_condition: Optional[str] = None

    price_paid: Optional[float] = None
    currency: Optional[str] = None
    purchase_date: Optional[datetime] = None
    purchased_from: Optional[str] = None
    notes: Optional[str] = None


class CollectionItemResponse(BaseModel):
    id: str
    user_id: str
    album_id: str

    pressing: Optional[str] = None
    pressing_country: Optional[str] = None
    pressing_year: Optional[int] = None

    label: Optional[str] = None
    catalog_number: Optional[str] = None
    barcode: Optional[str] = None
    matrix_runout: Optional[str] = None
    edition: Optional[str] = None

    media_condition: Optional[str] = None
    sleeve_condition: Optional[str] = None

    price_paid: Optional[float] = None
    currency: Optional[str] = None
    purchase_date: Optional[datetime] = None
    purchased_from: Optional[str] = None
    notes: Optional[str] = None

    source: Optional[str] = None
    source_release_id: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    album: Optional[Album] = None