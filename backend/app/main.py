from fastapi import FastAPI

from routers.debates import router as debates_router
from routers.status import router as status_router
from routers.comments import router as comments_router
from routers.lists import router as lists_router
from routers.albums import router as albums_router
from routers.artists import router as artists_router
from routers.marketplace import router as marketplace_router
from routers.users import router as users_router


app = FastAPI()

app.include_router(debates_router)
app.include_router(status_router)
app.include_router(comments_router)
app.include_router(lists_router)
app.include_router(albums_router)
app.include_router(artists_router)
app.include_router(marketplace_router)
app.include_router(users_router)