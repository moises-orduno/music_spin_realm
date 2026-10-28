# models/order.py

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum

class OrderItem(BaseModel):
    listing_id: str
    album_id: str
    title: str
    artist: Optional[str] = None
    cover_url: Optional[str] = None
    quantity: int = Field(default=1, ge=1)
    unit_price: float = Field(ge=0)
    currency: str

class OrderStatus(str, Enum):
    PENDING_PAYMENT = "pending_payment"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    PENDING_CANCELLED = "pending_cancelled"
    EXPIRED = "expired"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class OrderCreateRequest(BaseModel):
    shipping_address_id: str = Field(min_length=1)


class OrderResponse(BaseModel):
    id: str
    status: OrderStatus
    payment_status: PaymentStatus
    items: List[OrderItem]
    shipping_address: dict
    subtotal: float = Field(ge=0)
    shipping_cost: float = Field(ge=0)
    total: float = Field(ge=0)
    currency: str
    created_at: datetime
    updated_at: datetime