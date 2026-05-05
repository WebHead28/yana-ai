from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.schemas.chat import ChatRequest

from app.personality.engine import PersonalityEngine
from app.core.llm import stream_llm
from app.personality.adaptive import build_adaptive_style

from app.core.dependencies import get_current_user
from app.models.user_table import User
from app.core.database import SessionLocal

from app.models.personality_table import UserPersonality
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage

from app.core.memory_extractor import extract_user_facts


router = APIRouter()
engine = PersonalityEngine("yana_core")


@router.post("/")
async def chat(
    data: ChatRequest,
    user_id: str = Depends(get_current_user)
):

    db = SessionLocal()

    # ==================================
    # 1️⃣ HANDLE SESSION
    # ==================================
    if data.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == data.session_id,
            ChatSession.user_id == user_id
        ).first()

        if not session:
            db.close()
            return {"error": "Invalid session_id"}
    else:
        clean_title = data.message.strip()[:40]
        session = ChatSession(
            user_id=user_id,
            title=clean_title if clean_title else "New Chat"
        )

        db.add(session)
        db.commit()
        db.refresh(session)

    session_id = session.id

    # ==================================
    # 2️⃣ LOAD CHAT HISTORY FROM DB
    # ==================================
    messages_db = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at).all()

    history = [
        {"role": m.role, "content": m.content}
        for m in messages_db
    ]

    user_msg = data.message

    # ==================================
    # 3️⃣ EXTRACT MEMORY FACTS
    # ==================================
    extract_user_facts(user_id, user_msg)

    # ==================================
    # 4️⃣ LOAD PERSONALITY PROFILE
    # ==================================
    db_personality = db.query(UserPersonality).filter(
        UserPersonality.user_id == user_id
    ).first()

    profile = {}

    if db_personality:
        profile = {
            "emotional_openness": db_personality.emotional_openness,
            "anxiety_level": db_personality.anxiety_level,
            "attachment_need": db_personality.attachment_need,
            "emotional_stability": db_personality.emotional_stability,
            "avoidance": db_personality.avoidance,
            "social_energy": db_personality.social_energy,
        }

    system_prompt = engine.build_system_prompt()
    adaptive_rules = build_adaptive_style(profile)

    profile_text = "\n".join(
        [f"{k}: {v}" for k, v in profile.items()]
    )

    user_obj = db.query(User).filter(
        User.user_id == user_id
    ).first()

    profile_identity = ""

    if user_obj:
        profile_identity = f"""
    User Identity:
    Name: {user_obj.name}
    Nickname: {user_obj.nickname}
    Age: {user_obj.age}
    """


    messages = [
        {
            "role": "system",
            "content": (
            system_prompt +
                "\n\nAdaptive Behavior Instructions:\n"
                + adaptive_rules +
                "\n\nUser Personality:\n"
                + profile_text +
                "\n\n" +
                profile_identity
            )
        }
    ]


    # Add last 8 messages for continuity
    for msg in history[-8:]:
        messages.append(msg)

    messages.append({
        "role": "user",
        "content": user_msg
    })

    # ==================================
    # 5️⃣ STREAM RESPONSE + SAVE TO DB
    # ==================================
    def generate():

        full_reply = ""

        for token in stream_llm(messages):
            full_reply += token
            yield token

        # Save user message
        db.add(ChatMessage(
            session_id=session_id,
            role="user",
            content=user_msg
        ))

        # Save assistant reply
        db.add(ChatMessage(
            session_id=session_id,
            role="assistant",
            content=full_reply
        ))

        db.commit()
        db.close()

    return StreamingResponse(generate(), media_type="text/plain")

@router.get("/sessions")
def get_sessions(user_id: str = Depends(get_current_user)):

    db = SessionLocal()

    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == user_id
    ).order_by(ChatSession.created_at.desc()).all()

    result = [
        {
            "session_id": s.id,
            "title": s.title,
            "created_at": s.created_at
        }
        for s in sessions
    ]


    db.close()
    return result

@router.get("/messages/{session_id}")
def get_messages(session_id: str, user_id: str = Depends(get_current_user)):

    db = SessionLocal()

    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id
    ).first()

    if not session:
        db.close()
        return {"error": "Invalid session"}

    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at).all()

    result = [
        {
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at
        }
        for m in messages
    ]

    db.close()
    return result

from fastapi import HTTPException
from pydantic import BaseModel

class RenameSessionRequest(BaseModel):
    session_id: str
    new_title: str

@router.put("/rename")
def rename_session(
    data: RenameSessionRequest,
    user_id: str = Depends(get_current_user)
):

    db = SessionLocal()

    session = db.query(ChatSession).filter(
        ChatSession.id == data.session_id,
        ChatSession.user_id == user_id
    ).first()

    if not session:
        db.close()
        raise HTTPException(status_code=404, detail="Session not found")

    session.title = data.new_title.strip()[:60]

    db.commit()
    db.close()

    return {"status": "renamed"}

@router.delete("/delete/{session_id}")
def delete_session(
    session_id: str,
    user_id: str = Depends(get_current_user)
):

    db = SessionLocal()

    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id
    ).first()

    if not session:
        db.close()
        raise HTTPException(status_code=404, detail="Session not found")

    # Delete messages first
    db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).delete()

    # Delete session
    db.delete(session)

    db.commit()
    db.close()

    return {"status": "deleted"}
