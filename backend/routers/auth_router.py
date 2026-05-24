from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, StudentProfile
from ..auth import verify_password, create_token, get_current_user
from ..schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    token = create_token(user.id, user.role)
    credits = None
    if user.role == "student" and user.profile:
        credits = user.profile.credits
    return TokenResponse(token=token, role=user.role, name=user.name, credits=credits)


@router.get("/me")
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    credits = None
    booking_token = None
    if user.role == "student":
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        if profile:
            credits = profile.credits
            booking_token = profile.booking_token
    return {"name": user.name, "role": user.role, "credits": credits, "booking_token": booking_token}
