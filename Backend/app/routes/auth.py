from fastapi import APIRouter, HTTPException, Depends


from app.schemas.auth import RegisterRequest, LoginRequest
from app.models.users import create_user, authenticate
from app.models.profile_memory import initialize_profile
from app.core.auth_service import create_access_token
from app.core.dependencies import get_current_user
from app.core.database import SessionLocal
from app.models.user_table import User



router = APIRouter(prefix="/auth")


# ======================
# REGISTER
# ======================
@router.post("/register")
def register(data: RegisterRequest):

    user = create_user(
        data.username,
        data.email,
        data.password
    )

    if not user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    initialize_profile(user["user_id"])

    return user


# ======================
# LOGIN
# ======================
@router.post("/login")
def login(data: LoginRequest):

    user = authenticate(data.username, data.password)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(user["user_id"])

    initialize_profile(user["user_id"])


    return {
        "access_token": token,
        "user_id": user["user_id"],
        "personality_completed": user["personality_completed"]
    }

@router.get("/profile")
def get_profile(user_id: str = Depends(get_current_user)):

    db = SessionLocal()

    user = db.query(User).filter(
        User.user_id == user_id
    ).first()

    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")

    result = {
        "username": user.username,
        "email": user.email,
        "name": user.name,
        "nickname": user.nickname,
        "age": user.age,
        "personality_completed": user.personality_completed
    }

    db.close()

    return result

from pydantic import BaseModel

class UpdateProfileRequest(BaseModel):
    name: str | None = None
    nickname: str | None = None
    age: int | None = None
    email: str | None = None


@router.put("/profile")
def update_profile(
    data: UpdateProfileRequest,
    user_id: str = Depends(get_current_user)
):

    db = SessionLocal()

    user = db.query(User).filter(
        User.user_id == user_id
    ).first()

    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")

    if data.name is not None:
        user.name = data.name

    if data.nickname is not None:
        user.nickname = data.nickname

    if data.age is not None:
        user.age = data.age

    if data.email is not None:
        user.email = data.email

    db.commit()
    db.close()

    return {"status": "profile updated"}
