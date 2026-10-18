# backend/app/main.py
import os, shutil, uuid, threading
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .detector import DeepfakeDetector

app = FastAPI(title="Deepfake & AI-Gen Detector API", version="1.0")

# CORS — allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models ONCE at startup (not per request)
detector = DeepfakeDetector()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

VIDEO_EXT = {".mp4", ".avi", ".mov", ".mkv", ".flv", ".wmv"}
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".tiff"}

# In-memory job store (use Redis/DB for production)
jobs: dict = {}


class JobStatus(BaseModel):
    job_id: str
    status: str          # "processing" | "done" | "error"
    result: dict | None = None
    error: str | None = None


@app.get("/")
def root():
    return {"message": "Deepfake Detection API", "status": "running"}


@app.post("/api/analyze", response_model=JobStatus)
async def analyze(file: UploadFile = File(...)):
    """Upload a file. Video analysis runs in background."""
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in VIDEO_EXT and ext not in IMAGE_EXT:
        raise HTTPException(400, f"Unsupported file type: {ext}")

    job_id = str(uuid.uuid4())
    save_path = os.path.join(UPLOAD_DIR, f"{job_id}{ext}")

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    jobs[job_id] = {"status": "processing", "result": None, "error": None}

    # Images are fast — run synchronously
    if ext in IMAGE_EXT:
        try:
            result = detector.predict_image(save_path)
            jobs[job_id] = {"status": "done", "result": result, "error": None}
        except Exception as e:
            jobs[job_id] = {"status": "error", "result": None, "error": str(e)}
        finally:
            os.remove(save_path)
        return JobStatus(job_id=job_id, **jobs[job_id])

    # Videos are slow — run in a background thread
    def _run_video():
        try:
            result = detector.predict_video(save_path)
            jobs[job_id] = {"status": "done", "result": result, "error": None}
        except Exception as e:
            jobs[job_id] = {"status": "error", "result": None, "error": str(e)}
        finally:
            if os.path.exists(save_path):
                os.remove(save_path)

    threading.Thread(target=_run_video, daemon=True).start()

    return JobStatus(job_id=job_id, status="processing")


@app.get("/api/status/{job_id}", response_model=JobStatus)
def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    return JobStatus(job_id=job_id, **jobs[job_id])


@app.get("/api/health")
def health():
    return {"status": "ok", "device": str(detector.device)}