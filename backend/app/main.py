from fastapi import FastAPI

from routers.debates import router as debates_router
from routers.status import router as status_router
from routers.comments import router as comments_router


app = FastAPI()

app.include_router(debates_router)
app.include_router(status_router)
app.include_router(comments_router)