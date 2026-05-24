"""Seed database from JSON lesson files.

Usage:
    uv run python -m backend.cli.seed          # seed (skip existing)
    uv run python -m backend.cli.seed --force   # wipe and re-seed
"""
import json
import sys
from pathlib import Path

from sqlalchemy.orm import Session

from backend.database import engine, Base, SessionLocal
from backend.models import User, StudentProfile, Lesson, Section, TextUnit
from backend.auth import hash_password

DATA_DIR = Path(__file__).parent.parent / "data"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

DEMO_STUDENTS = [
    {"username": "gaivr", "password": "gaivr123", "name": "GAIVR", "level": "intermediate", "credits": 10},
]


def seed_admin(db: Session):
    existing = db.query(User).filter(User.username == ADMIN_USERNAME).first()
    if existing:
        print(f"  Admin user '{ADMIN_USERNAME}' already exists, skipping")
        return
    admin = User(
        username=ADMIN_USERNAME,
        password_hash=hash_password(ADMIN_PASSWORD),
        role="admin",
        name="冰紅茶老師",
    )
    db.add(admin)
    db.commit()
    print(f"  Created admin user: {ADMIN_USERNAME} / {ADMIN_PASSWORD}")


def seed_students(db: Session):
    for s in DEMO_STUDENTS:
        existing = db.query(User).filter(User.username == s["username"]).first()
        if existing:
            print(f"  Student '{s['username']}' already exists, skipping")
            continue
        user = User(
            username=s["username"],
            password_hash=hash_password(s["password"]),
            role="student",
            name=s["name"],
        )
        db.add(user)
        db.flush()
        profile = StudentProfile(
            user_id=user.id,
            level=s["level"],
            credits=s["credits"],
        )
        db.add(profile)
        db.commit()
        print(f"  Created student: {s['username']} / {s['password']} ({s['name']}, {s['credits']} credits)")


def seed_lessons(db: Session, force: bool):
    json_files = sorted(DATA_DIR.glob("*.json"))
    if not json_files:
        print("  No JSON files found in", DATA_DIR)
        return

    total_lessons = 0
    total_units = 0

    for idx, json_path in enumerate(json_files):
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        title = data.get("title", json_path.stem)

        if not force:
            existing = db.query(Lesson).filter(Lesson.title == title).first()
            if existing:
                print(f"  Lesson '{title}' already exists, skipping")
                continue

        lesson = Lesson(
            title=title,
            theme=data.get("theme", ""),
            level=data.get("level", ""),
            sort_order=idx,
        )
        db.add(lesson)
        db.flush()

        for s_idx, section_data in enumerate(data.get("sections", [])):
            section = Section(
                lesson_id=lesson.id,
                title=section_data.get("title", ""),
                type=section_data.get("type", "numbered_sentences"),
                sort_order=s_idx,
            )
            db.add(section)
            db.flush()

            for u_idx, unit_data in enumerate(section_data.get("units", [])):
                unit = TextUnit(
                    section_id=section.id,
                    sort_order=u_idx,
                    cantonese=unit_data.get("cantonese", ""),
                    jyutping=unit_data.get("jyutping", ""),
                    meaning=unit_data.get("meaning", "") or "",
                    speaker=unit_data.get("speaker", "") or "",
                    pos=unit_data.get("pos", "") or "",
                    examples=unit_data.get("examples"),
                    metadata_=unit_data.get("metadata"),
                )
                db.add(unit)
                total_units += 1

        total_lessons += 1

    db.commit()
    print(f"  Seeded {total_lessons} lessons, {total_units} text units")


def main():
    force = "--force" in sys.argv

    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if force:
            print("Force mode: clearing existing data...")
            db.query(TextUnit).delete()
            db.query(Section).delete()
            db.query(Lesson).delete()
            db.commit()

        print("Seeding admin user...")
        seed_admin(db)

        print("Seeding students...")
        seed_students(db)

        print("Seeding lessons...")
        seed_lessons(db, force)

        print("Done!")
    finally:
        db.close()


if __name__ == "__main__":
    main()
