from pydantic import BaseModel
from typing import Optional, List

from models.listItem import ListItem



class RemixCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    items: List[ListItem]