from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.debates import router as debates_router
from routers.status import router as status_router
from routers.comments import router as comments_router
from routers.lists import router as lists_router
from routers.albums import router as albums_router
from routers.artists import router as artists_router
from routers.marketplace import router as marketplace_router
from routers.users import router as users_router


app = FastAPI()

# ✅ CORS FIRST (on the same app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ THEN include routers
app.include_router(debates_router, prefix="/api")
app.include_router(status_router, prefix="/api")
app.include_router(comments_router, prefix="/api")
app.include_router(lists_router, prefix="/api")
app.include_router(albums_router, prefix="/api")
app.include_router(artists_router, prefix="/api")
app.include_router(marketplace_router, prefix="/api")
app.include_router(users_router, prefix="/api")