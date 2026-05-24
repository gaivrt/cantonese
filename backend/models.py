import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Enum
)
from sqlalchemy.orm import relationship

from .database import Base


def utcnow():
    return datetime.now(timezone.utc)


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(10), nullable=False, default="student")
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=utcnow)

    profile = relationship("StudentProfile", back_populates="user", uselist=False)


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    level = Column(String(20), default="beginner")
    notes = Column(Text, default="")
    credits = Column(Float, default=0)
    phone = Column(String(20), default="")
    booking_token = Column(String(36), unique=True, default=gen_uuid, index=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="profile")
    assignments = relationship("LessonAssignment", back_populates="student")
    bookings = relationship("Booking", back_populates="student")
    credit_logs = relationship("CreditLog", back_populates="student")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    theme = Column(String(50), default="")
    level = Column(String(20), default="")
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)

    sections = relationship("Section", back_populates="lesson", order_by="Section.sort_order")
    assignments = relationship("LessonAssignment", back_populates="lesson")


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    title = Column(String(200), nullable=False)
    type = Column(String(30), nullable=False)
    sort_order = Column(Integer, default=0)

    lesson = relationship("Lesson", back_populates="sections")
    units = relationship("TextUnit", back_populates="section", order_by="TextUnit.sort_order")


class TextUnit(Base):
    __tablename__ = "text_units"

    id = Column(Integer, primary_key=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    sort_order = Column(Integer, default=0)
    cantonese = Column(Text, default="")
    jyutping = Column(Text, default="")
    meaning = Column(Text, default="")
    speaker = Column(String(50), default="")
    pos = Column(String(20), default="")
    examples = Column(JSON, default=None)
    metadata_ = Column("metadata", JSON, default=None)

    section = relationship("Section", back_populates="units")
    recording = relationship("Recording", back_populates="text_unit", uselist=False)


class Recording(Base):
    __tablename__ = "recordings"

    id = Column(Integer, primary_key=True)
    text_unit_id = Column(Integer, ForeignKey("text_units.id"), unique=True, nullable=False)
    file_path = Column(String(500), nullable=False)
    duration_ms = Column(Integer, default=0)
    mime_type = Column(String(50), default="audio/webm")
    file_size = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)

    text_unit = relationship("TextUnit", back_populates="recording")


class LessonAssignment(Base):
    __tablename__ = "lesson_assignments"

    id = Column(Integer, primary_key=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    assigned_at = Column(DateTime, default=utcnow)

    lesson = relationship("Lesson", back_populates="assignments")
    student = relationship("StudentProfile", back_populates="assignments")


class TimeSlot(Base):
    __tablename__ = "time_slots"

    id = Column(Integer, primary_key=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String(20), default="available", index=True)
    created_at = Column(DateTime, default=utcnow)

    booking = relationship("Booking", back_populates="time_slot", uselist=False)


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True)
    time_slot_id = Column(Integer, ForeignKey("time_slots.id"), unique=True, nullable=False)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    status = Column(String(20), default="confirmed")
    booked_at = Column(DateTime, default=utcnow)

    time_slot = relationship("TimeSlot", back_populates="booking")
    student = relationship("StudentProfile", back_populates="bookings")
    credit_log = relationship("CreditLog", back_populates="booking", uselist=False)


class CreditLog(Base):
    __tablename__ = "credit_logs"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    change = Column(Float, nullable=False)
    reason = Column(String(200), default="")
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    student = relationship("StudentProfile", back_populates="credit_logs")
    booking = relationship("Booking", back_populates="credit_log")
