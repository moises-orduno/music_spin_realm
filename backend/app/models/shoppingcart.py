from datetime import datetime, timezone
from pydantic import BaseModel, Field


def utc_now():
    return datetime.now(timezone.utc)


class CartItem(BaseModel):
    listing_id: str
    quantity: int = Field(default=1, ge=1, le=1)
    added_at: datetime = Field(default_factory=utc_now)


class Cart(BaseModel):
    user_id: str
    items: list[CartItem] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

class AddToCartRequest(BaseModel):
    listing_id: str