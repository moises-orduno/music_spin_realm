from jose import jwt
from datetime import datetime, timedelta,timezone

from fastapi import Depends, HTTPException
from jose import jwt, JWTError
from db.mongodb import db
from fastapi.security import OAuth2PasswordBearer
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

optional_oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=False
)



SECRET_KEY = "CHANGE_ME"
ALGORITHM = "HS256"


def create_access_token(user_id: str):
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

async def get_current_user(
    token: str = Depends(oauth2_scheme)
):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = await db.users.find_one({"id": user_id})

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user

async def get_optional_user(
    token: Optional[str] = Depends(optional_oauth2_scheme)
):
    if not token:
        return None

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            return None

    except JWTError:
        return None

    user = await db.users.find_one({"id": user_id})

    return user