from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, StudentProfile, LessonAssignment, CreditLog
from ..auth import hash_password, require_admin

router = APIRouter(prefix="/api/students", tags=["students"])


class CreateStudentReq(BaseModel):
    username: str
    password: str
    name: str
    level: str = "beginner"
    phone: str = ""
    notes: str = ""
    credits: float = 0


class UpdateStudentReq(BaseModel):
    name: str | None = None
    level: str | None = None
    phone: str | None = None
    notes: str | None = None


class ResetPasswordReq(BaseModel):
    new_password: str


class AddCreditsReq(BaseModel):
    amount: float
    reason: str = "充值"


class AssignLessonReq(BaseModel):
    lesson_ids: list[int]


class StudentOut(BaseModel):
    id: int
    user_id: int
    username: str
    name: str
    level: str
    phone: str
    notes: str
    credits: float
    booking_token: str
    lesson_ids: list[int] = []
    class Config:
        from_attributes = True


@router.get("/", response_model=list[StudentOut])
def list_students(db: Session = Depends(get_db), user=Depends(require_admin)):
    profiles = db.query(StudentProfile).all()
    result = []
    for p in profiles:
        result.append(StudentOut(
            id=p.id,
            user_id=p.user_id,
            username=p.user.username,
            name=p.user.name,
            level=p.level,
            phone=p.phone,
            notes=p.notes,
            credits=p.credits,
            booking_token=p.booking_token,
            lesson_ids=[a.lesson_id for a in p.assignments],
        ))
    return result


@router.post("/", response_model=StudentOut)
def create_student(req: CreateStudentReq, db: Session = Depends(get_db), user=Depends(require_admin)):
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")

    u = User(
        username=req.username,
        password_hash=hash_password(req.password),
        role="student",
        name=req.name,
    )
    db.add(u)
    db.flush()

    p = StudentProfile(
        user_id=u.id,
        level=req.level,
        phone=req.phone,
        notes=req.notes,
        credits=req.credits,
    )
    db.add(p)
    db.commit()
    db.refresh(p)

    return StudentOut(
        id=p.id, user_id=u.id, username=u.username, name=u.name,
        level=p.level, phone=p.phone, notes=p.notes, credits=p.credits,
        booking_token=p.booking_token, lesson_ids=[],
    )


@router.patch("/{student_id}", response_model=StudentOut)
def update_student(student_id: int, req: UpdateStudentReq, db: Session = Depends(get_db), user=Depends(require_admin)):
    p = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Student not found")

    if req.name is not None:
        p.user.name = req.name
    if req.level is not None:
        p.level = req.level
    if req.phone is not None:
        p.phone = req.phone
    if req.notes is not None:
        p.notes = req.notes

    db.commit()
    db.refresh(p)

    return StudentOut(
        id=p.id, user_id=p.user_id, username=p.user.username, name=p.user.name,
        level=p.level, phone=p.phone, notes=p.notes, credits=p.credits,
        booking_token=p.booking_token, lesson_ids=[a.lesson_id for a in p.assignments],
    )


@router.post("/{student_id}/reset-password")
def reset_password(student_id: int, req: ResetPasswordReq, db: Session = Depends(get_db), user=Depends(require_admin)):
    p = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Student not found")
    if len(req.new_password) < 4:
        raise HTTPException(status_code=400, detail="Password too short")
    p.user.password_hash = hash_password(req.new_password)
    db.commit()
    return {"status": "ok"}


@router.post("/{student_id}/credits")
def add_credits(student_id: int, req: AddCreditsReq, db: Session = Depends(get_db), user=Depends(require_admin)):
    p = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Student not found")

    p.credits += req.amount
    log = CreditLog(student_id=student_id, change=req.amount, reason=req.reason)
    db.add(log)
    db.commit()

    return {"credits": p.credits}


@router.put("/{student_id}/lessons")
def assign_lessons(student_id: int, req: AssignLessonReq, db: Session = Depends(get_db), user=Depends(require_admin)):
    p = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Student not found")

    db.query(LessonAssignment).filter(LessonAssignment.student_id == student_id).delete()
    for lid in req.lesson_ids:
        db.add(LessonAssignment(lesson_id=lid, student_id=student_id))
    db.commit()

    return {"lesson_ids": req.lesson_ids}


@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db), user=Depends(require_admin)):
    p = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Student not found")

    db.query(LessonAssignment).filter(LessonAssignment.student_id == student_id).delete()
    db.query(CreditLog).filter(CreditLog.student_id == student_id).delete()
    db.delete(p)
    db.query(User).filter(User.id == p.user_id).delete()
    db.commit()

    return {"status": "ok"}
