# models/checkout.py

from typing import Optional
from pydantic import BaseModel, Field

class CheckoutValidateRequest(BaseModel):
    shipping_address_id: str = Field(min_length=1)

class ShippingAddressSnapshot(BaseModel):
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    neighborhood: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    delivery_instructions: Optional[str] = None