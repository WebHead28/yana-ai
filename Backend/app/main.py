from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models.user_table import User
from app.models.personality_table import UserPersonality

from app.routes.chat import router as chat_router
from app.routes.auth import router as auth_router
from app.routes.personality import router as personality_router

from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage


app = FastAPI(
    title="YANA API",
    description="Backend for Y.A.N.A - You Are Not Alone",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(personality_router)
app.include_router(chat_router, prefix="/chat")


@app.get("/")
def root():
    return {"message": "YANA backend is running ❤"}
