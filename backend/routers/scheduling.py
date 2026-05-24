from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from sqlalchemy.orm import joinedload

from ..database import get_db
from ..models import TimeSlot, Booking, StudentProfile, CreditLog
from ..auth import require_admin

router = APIRouter(prefix="/api/scheduling", tags=["scheduling"])


class CreateSlotsReq(BaseModel):
    slots: list[dict]


class SlotOut(BaseModel):
    id: int
    start_time: str
    end_time: str
    status: str
    student_name: str | None = None

    class Config:
        from_attributes = True


@router.post("/slots")
def create_slots(req: CreateSlotsReq, db: Session = Depends(get_db), user=Depends(require_admin)):
    created = []
    for s in req.slots:
        start = datetime.fromisoformat(s["start_time"])
        end = datetime.fromisoformat(s["end_time"])
        overlap = (
            db.query(TimeSlot)
            .filter(
                TimeSlot.status.in_(["available", "booked"]),
                TimeSlot.start_time < end,
                TimeSlot.end_time > start,
            )
            .first()
        )
        if overlap:
            raise HTTPException(
                status_code=409,
                detail=f"與已有時段重疊：{overlap.start_time.strftime('%H:%M')}–{overlap.end_time.strftime('%H:%M')}",
            )
        slot = TimeSlot(start_time=start, end_time=end)
        db.add(slot)
        db.flush()
        created.append(slot.id)
    db.commit()
    return {"created": len(created), "ids": created}


@router.get("/slots", response_model=list[SlotOut])
def list_slots(db: Session = Depends(get_db), user=Depends(require_admin)):
    slots = (
        db.query(TimeSlot)
        .options(
            joinedload(TimeSlot.booking)
            .joinedload(Booking.student)
            .joinedload(StudentProfile.user)
        )
        .order_by(TimeSlot.start_time.desc())
        .all()
    )
    result = []
    for s in slots:
        student_name = None
        if s.booking and s.booking.student and s.booking.student.user:
            student_name = s.booking.student.user.name
        result.append(SlotOut(
            id=s.id,
            start_time=s.start_time.isoformat(),
            end_time=s.end_time.isoformat(),
            status=s.status,
            student_name=student_name,
        ))
    return result


@router.patch("/slots/{slot_id}/complete")
def complete_slot(slot_id: int, db: Session = Depends(get_db), user=Depends(require_admin)):
    slot = db.query(TimeSlot).filter(TimeSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    if slot.status != "booked":
        raise HTTPException(status_code=400, detail="Slot is not booked")

    slot.status = "completed"
    if slot.booking:
        slot.booking.status = "completed"

    db.commit()
    return {"status": "completed"}


@router.patch("/slots/{slot_id}/cancel")
def cancel_slot(slot_id: int, db: Session = Depends(get_db), user=Depends(require_admin)):
    slot = db.query(TimeSlot).filter(TimeSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    if slot.booking:
        profile = slot.booking.student
        if profile:
            profile.credits += 1
            db.add(CreditLog(student_id=profile.id, change=1, reason="課程取消退還", booking_id=slot.booking.id))
        db.delete(slot.booking)

    slot.status = "available"
    db.commit()
    return {"status": "cancelled"}


@router.delete("/slots/{slot_id}")
def delete_slot(slot_id: int, db: Session = Depends(get_db), user=Depends(require_admin)):
    slot = db.query(TimeSlot).filter(TimeSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    if slot.status == "booked":
        raise HTTPException(status_code=400, detail="Cannot delete a booked slot")

    if slot.booking:
        db.delete(slot.booking)
    db.delete(slot)
    db.commit()
    return {"status": "ok"}


# --- Student booking (token-based, no login required) ---

class BookSlotReq(BaseModel):
    slot_id: int


class BookingPageOut(BaseModel):
    student_name: str
    credits: float
    available_slots: list[SlotOut]
    my_bookings: list[SlotOut]


@router.get("/book/{token}", response_model=BookingPageOut)
def booking_page(token: str, db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.booking_token == token).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Invalid booking link")

    available = db.query(TimeSlot).filter(TimeSlot.status == "available").order_by(TimeSlot.start_time).all()
    my_bookings = (
        db.query(TimeSlot)
        .join(Booking)
        .filter(Booking.student_id == profile.id, Booking.status.in_(["confirmed", "completed"]))
        .order_by(TimeSlot.start_time.desc())
        .all()
    )

    return BookingPageOut(
        student_name=profile.user.name,
        credits=profile.credits,
        available_slots=[SlotOut(id=s.id, start_time=s.start_time.isoformat(), end_time=s.end_time.isoformat(), status=s.status) for s in available],
        my_bookings=[SlotOut(id=s.id, start_time=s.start_time.isoformat(), end_time=s.end_time.isoformat(), status=s.status) for s in my_bookings],
    )


@router.post("/book/{token}")
def book_slot(token: str, req: BookSlotReq, db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.booking_token == token).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Invalid booking link")

    if profile.credits < 1:
        raise HTTPException(status_code=400, detail="課時不足，請聯繫老師充值")

    updated = (
        db.query(TimeSlot)
        .filter(TimeSlot.id == req.slot_id, TimeSlot.status == "available")
        .update({"status": "booked"})
    )
    if updated == 0:
        raise HTTPException(status_code=409, detail="該時段已被預約")

    profile.credits -= 1
    booking = Booking(time_slot_id=req.slot_id, student_id=profile.id)
    db.add(booking)
    db.add(CreditLog(student_id=profile.id, change=-1, reason="預約扣減"))
    db.commit()

    return {"status": "booked"}


class CancelBookingReq(BaseModel):
    slot_id: int


@router.post("/book/{token}/cancel")
def cancel_booking(token: str, req: CancelBookingReq, db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.booking_token == token).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Invalid booking link")

    slot = db.query(TimeSlot).filter(TimeSlot.id == req.slot_id, TimeSlot.status == "booked").first()
    if not slot:
        raise HTTPException(status_code=404, detail="找不到此預約")

    booking = db.query(Booking).filter(Booking.time_slot_id == slot.id, Booking.student_id == profile.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="這不是你的預約")

    hours_until = (slot.start_time - datetime.now()).total_seconds() / 3600
    if hours_until < 4:
        raise HTTPException(status_code=400, detail="距開課不足4小時，無法取消。如需取消請聯繫老師。")

    profile.credits += 1
    db.add(CreditLog(student_id=profile.id, change=1, reason="學生取消退還"))
    slot.status = "available"
    db.delete(booking)
    db.commit()

    return {"status": "cancelled"}
