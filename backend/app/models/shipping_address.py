from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field


def utc_now():
    return datetime.now(timezone.utc)


class ShippingAddressCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=100)
    phone: Optional[str] = None

    address_line1: str = Field(min_length=1, max_length=200)
    address_line2: Optional[str] = None
    neighborhood: Optional[str] = None

    city: str = Field(min_length=1)
    state: str = Field(min_length=1)
    postal_code: str = Field(min_length=1)
    country: str = "Mexico"

    delivery_instructions: Optional[str] = None
    is_default: bool = False


class ShippingAddress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str

    full_name: str
    phone: Optional[str] = None

    address_line1: str
    address_line2: Optional[str] = None
    neighborhood: Optional[str] = None

    city: str
    state: str
    postal_code: str
    country: str = "Mexico"

    delivery_instructions: Optional[str] = None
    is_default: bool = False

    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

class ShippingAddressUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    delivery_instructions: Optional[str] = None
    is_default: Optional[bool] = None