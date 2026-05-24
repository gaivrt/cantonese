from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import auth_router, lessons, recordings, students, scheduling

Base.metadata.create_all(bind=engine)

app = FastAPI(title="冰紅茶粵語教學平台")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(lessons.router)
app.include_router(recordings.router)
app.include_router(students.router)
app.include_router(scheduling.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
