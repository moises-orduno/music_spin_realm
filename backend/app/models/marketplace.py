from pydantic import BaseModel
from typing import Optional

class RecommendedListingCreate(BaseModel):
    album_id: str

    # Sale
    price: float
    currency: str = "USD"

    # Pressing
    pressing_country: Optional[str] = None
    pressing_year: Optional[int] = None
    label: Optional[str] = None
    catalog_number: Optional[str] = None
    pressing_description: Optional[str] = None

    # Format
    format: Optional[str] = None
    speed: Optional[int] = None
    channels: Optional[str] = None  # Stereo / Mono

    # Condition
    media_condition: Optional[str] = None
    sleeve_condition: Optional[str] = None

    # Additional details
    matrix_runout: Optional[str] = None
    edition: Optional[str] = None
    mastering: Optional[str] = None
    notes: Optional[str] = None

    # Photos
    images: list[str] = []