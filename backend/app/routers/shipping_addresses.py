from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status, HTTPException

from db.mongodb import db
from helpers.token_helper import get_current_user
from models.shipping_address import (
    ShippingAddress,
    ShippingAddressCreate,
    ShippingAddressUpdate
)

router = APIRouter(
    prefix="/users/me/addresses",
    tags=["Shipping Addresses"],
)

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
async def create_shipping_address(
    payload: ShippingAddressCreate,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["id"])

    address = ShippingAddress(
        user_id=user_id,
        **payload.model_dump(),
    )

    if address.is_default:
        await db.shipping_addresses.update_many(
            {"user_id": user_id},
            {"$set": {"is_default": False}},
        )

    await db.shipping_addresses.insert_one(
        address.model_dump(mode="json")
    )

    return {
        "message": "Shipping address created",
        "address": address.model_dump(mode="json"),
    }

@router.get("", response_model=list[ShippingAddress])
async def get_shipping_addresses(
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["id"])

    cursor = db.shipping_addresses.find(
        {"user_id": user_id},
        {"_id": 0},
    )

    addresses = await cursor.to_list(length=100)

    return [ShippingAddress.model_validate(doc) for doc in addresses]

@router.get("/{address_id}", response_model=ShippingAddress)
async def get_shipping_address(
    address_id: str,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["id"])

    address = await db.shipping_addresses.find_one(
        {
            "id": address_id,
            "user_id": user_id,
        },
        {"_id": 0},
    )

    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping address not found",
        )

    return ShippingAddress.model_validate(address)

@router.patch("/{address_id}")
async def update_shipping_address(
    address_id: str,
    payload: ShippingAddressUpdate,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["id"])

    address = await db.shipping_addresses.find_one({
        "id": address_id,
        "user_id": user_id,
    })

    if address is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping address not found",
        )

    updates = {
        key: value
        for key, value in payload.model_dump(exclude_unset=True).items()
        if value is not None
    }

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    # If setting this address as default, unset the previous default.
    if updates.get("is_default") is True:
        await db.shipping_addresses.update_many(
            {"user_id": user_id},
            {"$set": {"is_default": False}},
        )

    updates["updated_at"] = datetime.now(timezone.utc)

    await db.shipping_addresses.update_one(
        {
            "id": address_id,
            "user_id": user_id,
        },
        {"$set": updates},
    )

    updated_address = await db.shipping_addresses.find_one(
        {
            "id": address_id,
            "user_id": user_id,
        },
        {"_id": 0},
    )

    return {"address": updated_address}

@router.delete("/{address_id}")
async def delete_shipping_address(
    address_id: str,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["id"])

    result = await db.shipping_addresses.delete_one({
        "id": address_id,
        "user_id": user_id,
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping address not found",
        )

    return {
        "message": "Shipping address deleted successfully",
        "id": address_id,
    }