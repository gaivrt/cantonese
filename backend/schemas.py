from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    token: str
    role: str
    name: str
    credits: float | None = None


class TextUnitOut(BaseModel):
    id: int
    sort_order: int
    cantonese: str
    jyutping: str
    meaning: str
    speaker: str
    pos: str
    examples: list | dict | None = None
    metadata_: dict | None = None
    has_recording: bool = False

    class Config:
        from_attributes = True


class SectionOut(BaseModel):
    id: int
    title: str
    type: str
    sort_order: int
    units: list[TextUnitOut]

    class Config:
        from_attributes = True


class LessonSummary(BaseModel):
    id: int
    title: str
    theme: str
    level: str
    sort_order: int
    section_count: int = 0
    unit_count: int = 0
    assigned_at: str | None = None

    class Config:
        from_attributes = True


class LessonDetail(BaseModel):
    id: int
    title: str
    theme: str
    level: str
    sections: list[SectionOut]

    class Config:
        from_attributes = True
