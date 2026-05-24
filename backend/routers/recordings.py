import os
import time
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import TextUnit, Recording
from ..auth import get_current_user, require_admin

UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads" / "audio"

router = APIRouter(prefix="/api/recordings", tags=["recordings"])


@router.post("/units/{unit_id}")
async def upload_recording(
    unit_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(require_admin),
):
    unit = db.query(TextUnit).filter(TextUnit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="TextUnit not found")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 5MB)")

    mime = file.content_type or "audio/webm"
    ext = "mp4" if "mp4" in mime else "webm"
    filename = f"{unit_id}_{int(time.time())}.{ext}"
    filepath = UPLOAD_DIR / filename

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    with open(filepath, "wb") as f:
        f.write(content)

    existing = db.query(Recording).filter(Recording.text_unit_id == unit_id).first()
    if existing:
        old_path = UPLOAD_DIR / Path(existing.file_path).name
        if old_path.exists():
            old_path.unlink()
        existing.file_path = filename
        existing.mime_type = mime
        existing.file_size = len(content)
        existing.duration_ms = 0
    else:
        rec = Recording(
            text_unit_id=unit_id,
            file_path=filename,
            mime_type=mime,
            file_size=len(content),
        )
        db.add(rec)

    db.commit()
    return {"status": "ok", "filename": filename}


@router.get("/units/{unit_id}/audio")
def get_audio(unit_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    rec = db.query(Recording).filter(Recording.text_unit_id == unit_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="No recording")

    filepath = UPLOAD_DIR / rec.file_path
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Audio file missing")

    return FileResponse(filepath, media_type=rec.mime_type)


@router.delete("/units/{unit_id}")
def delete_recording(unit_id: int, db: Session = Depends(get_db), user=Depends(require_admin)):
    rec = db.query(Recording).filter(Recording.text_unit_id == unit_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="No recording")

    filepath = UPLOAD_DIR / rec.file_path
    if filepath.exists():
        filepath.unlink()

    db.delete(rec)
    db.commit()
    return {"status": "ok"}
