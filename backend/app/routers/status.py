from fastapi import APIRouter
from db.mongodb import db

router = APIRouter(
    prefix="/status",
    tags=["Status"]
)

@router.get("/")
async def get_status():
    pass

@router.post("/")
async def create_status():
    pass