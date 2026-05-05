from app.core.database import SessionLocal
from app.models.user_table import User


def extract_user_facts(user_id: str, message: str):

    text = message.lower()

    db = SessionLocal()
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        db.close()
        return

    if "my name is" in text:
        name = text.split("my name is")[-1].strip().title()
        user.name = name

    if "call me" in text:
        nickname = text.split("call me")[-1].strip().title()
        user.nickname = nickname

    if "i am" in text and "years old" in text:
        try:
            age_part = text.split("i am")[-1].split("years old")[0]
            age = int(age_part.strip())
            user.age = age
        except:
            pass

    db.commit()
    db.close()
