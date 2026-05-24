from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import User, Lesson, Section, TextUnit, LessonAssignment, StudentProfile
from ..auth import get_current_user
from ..schemas import LessonSummary, LessonDetail, SectionOut, TextUnitOut

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


@router.get("/", response_model=list[LessonSummary])
def list_lessons(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role == "student":
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        if not profile:
            return []
        assignments = (
            db.query(LessonAssignment)
            .filter(LessonAssignment.student_id == profile.id)
            .order_by(LessonAssignment.assigned_at.asc())
            .all()
        )
        result = []
        for a in assignments:
            lesson = a.lesson
            section_count = len(lesson.sections)
            unit_count = sum(len(s.units) for s in lesson.sections)
            result.append(LessonSummary(
                id=lesson.id,
                title=lesson.title,
                theme=lesson.theme,
                level=lesson.level,
                sort_order=lesson.sort_order,
                section_count=section_count,
                unit_count=unit_count,
                assigned_at=a.assigned_at.isoformat() if a.assigned_at else None,
            ))
        return result

    lessons = db.query(Lesson).order_by(Lesson.sort_order).all()
    result = []
    for lesson in lessons:
        section_count = len(lesson.sections)
        unit_count = sum(len(s.units) for s in lesson.sections)
        result.append(LessonSummary(
            id=lesson.id,
            title=lesson.title,
            theme=lesson.theme,
            level=lesson.level,
            sort_order=lesson.sort_order,
            section_count=section_count,
            unit_count=unit_count,
        ))
    return result


@router.get("/{lesson_id}", response_model=LessonDetail)
def get_lesson(lesson_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    lesson = (
        db.query(Lesson)
        .options(
            joinedload(Lesson.sections)
            .joinedload(Section.units)
            .joinedload(TextUnit.recording)
        )
        .filter(Lesson.id == lesson_id)
        .first()
    )
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if user.role == "student":
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        if profile:
            has_access = db.query(LessonAssignment).filter(
                LessonAssignment.student_id == profile.id,
                LessonAssignment.lesson_id == lesson_id,
            ).first()
            if not has_access:
                raise HTTPException(status_code=403, detail="未分配此教材")

    sections_out = []
    for section in sorted(lesson.sections, key=lambda s: s.sort_order):
        units_out = []
        for unit in sorted(section.units, key=lambda u: u.sort_order):
            units_out.append(TextUnitOut(
                id=unit.id,
                sort_order=unit.sort_order,
                cantonese=unit.cantonese or "",
                jyutping=unit.jyutping or "",
                meaning=unit.meaning or "",
                speaker=unit.speaker or "",
                pos=unit.pos or "",
                examples=unit.examples,
                metadata_=unit.metadata_,
                has_recording=unit.recording is not None,
            ))
        sections_out.append(SectionOut(
            id=section.id,
            title=section.title,
            type=section.type,
            sort_order=section.sort_order,
            units=units_out,
        ))

    return LessonDetail(
        id=lesson.id,
        title=lesson.title,
        theme=lesson.theme,
        level=lesson.level,
        sections=sections_out,
    )
