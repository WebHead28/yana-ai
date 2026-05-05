from fastapi import APIRouter, Depends
from app.personality.personality_test import QUESTIONS
from app.personality.deduction import build_personality_vector
from app.models.users import complete_personality
from app.core.database import SessionLocal
from app.models.personality_table import UserPersonality
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/personality")


@router.get("/questions")
def get_questions():
    return QUESTIONS


@router.post("/submit")
def submit(
    data: dict,
    user_id: str = Depends(get_current_user)
):

    answers = data.get("answers", {})

    personality = build_personality_vector(answers)

    db = SessionLocal()

    existing = db.query(UserPersonality).filter(
        UserPersonality.user_id == user_id
    ).first()

    if existing:
        for key, value in personality.items():
            setattr(existing, key, value)
    else:
        new_personality = UserPersonality(
            user_id=user_id,
            **personality
        )
        db.add(new_personality)

    db.commit()
    db.close()

    complete_personality(user_id)

    return {
        "status": "saved",
        "personality_vector": personality
    }
