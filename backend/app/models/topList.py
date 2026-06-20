from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone

from models.listItem import ListItem
from models.user import UserReference


from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from models.user import UserReference


class TopList(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    creator_id: str

    owner: UserReference

    title: str

    description: Optional[str] = None

    category: Optional[str] = None

    items: List[ListItem]

    parent_list_id: Optional[str] = None

    likes_count: int = 0

    comments_count: int = 0

    remix_count: int = 0

    views_count: int = 0

    is_public: bool = True

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

class TopListCreate(BaseModel):
    owner: UserReference

    title: str

    description: Optional[str] = None

    category: Optional[str] = None

    items: List[ListItem]