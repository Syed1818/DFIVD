# backend/app/main.py
import os
import shutil
import uuid
import threading
import asyncio
import time
import glob
from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .detector import DeepfakeDetector

app = FastAPI(title="Deepfake & AI-Gen Detector API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = DeepfakeDetector()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

VIDEO_EXT = {".mp4", ".avi", ".mov", ".mkv", ".flv", ".wmv"}
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".tiff"}

# In-memory job store with zero-retention (jobs get purged)
jobs: dict = {}


class JobStatus(BaseModel):
    job_id: str
    status: str
    result: dict | None = None
    error: str | None = None

# --- WebSocket Manager ---


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, job_id: str):
        await websocket.accept()
        if job_id not in self.active_connections:
            self.active_connections[job_id] = []
        self.active_connections[job_id].append(websocket)

    def disconnect(self, websocket: WebSocket, job_id: str):
        if job_id in self.active_connections:
            self.active_connections[job_id].remove(websocket)
            if not self.active_connections[job_id]:
                del self.active_connections[job_id]

    async def broadcast(self, job_id: str, message: dict):
        if job_id in self.active_connections:
            for connection in self.active_connections[job_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass


manager = ConnectionManager()

# --- Zero Trust Tasks ---


async def cleanup_stale_jobs():
    """Background task to wipe completed jobs from memory after 5 minutes, or abandoned jobs after 1 hour."""
    while True:
        await asyncio.sleep(60)
        current_time = time.time()
        stale_keys = []
        for k, v in jobs.items():
            age = current_time - v.get("created_at", 0)
            if v.get("status") in ["done", "error"] and age > 300:
                stale_keys.append(k)
            elif age > 3600:
                stale_keys.append(k)
        for k in stale_keys:
            del jobs[k]


@app.on_event("startup")
async def startup_event():
    # Purge uploads dir on boot
    files = glob.glob(os.path.join(UPLOAD_DIR, "*"))
    for f in files:
        try:
            os.remove(f)
        except Exception:
            pass
    asyncio.create_task(cleanup_stale_jobs())

# --- Endpoints ---


@app.get("/")
def root():
    return {"message": "Deepfake Detection API", "status": "running"}


@app.websocket("/ws/status/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    await manager.connect(websocket, job_id)
    try:
        # If job already done or errored, send it immediately
        if job_id in jobs and jobs[job_id]["status"] in ["done", "error"]:
            await websocket.send_json(jobs[job_id])

        while True:
            await websocket.receive_text()  # Keep connection open
    except WebSocketDisconnect:
        manager.disconnect(websocket, job_id)


@app.post("/api/analyze", response_model=JobStatus)
async def analyze(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in VIDEO_EXT and ext not in IMAGE_EXT:
        raise HTTPException(400, f"Unsupported file type: {ext}")

    job_id = str(uuid.uuid4())
    save_path = os.path.join(UPLOAD_DIR, f"{job_id}{ext}")

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    jobs[job_id] = {"status": "processing", "result": None,
                    "error": None, "created_at": time.time()}

    if ext in IMAGE_EXT:
        try:
            result = detector.predict_image(save_path)
            jobs[job_id].update({"status": "done", "result": result})
        except Exception as e:
            jobs[job_id].update({"status": "error", "error": str(e)})
        finally:
            if os.path.exists(save_path):
                os.remove(save_path)
        return JobStatus(job_id=job_id, status=jobs[job_id]["status"], result=jobs[job_id].get("result"), error=jobs[job_id].get("error"))

    # For videos, broadcast progress via websocket
    def _run_video(loop):
        def progress_cb(progress_data):
            # Send progress securely
            asyncio.run_coroutine_threadsafe(
                manager.broadcast(
                    job_id, {"status": "processing", "progress": progress_data}),
                loop
            )

        try:
            # Send initial message
            asyncio.run_coroutine_threadsafe(
                manager.broadcast(
                    job_id, {"status": "processing", "message": "Initializing temporal sequence analysis..."}),
                loop
            )
            result = detector.predict_video(save_path, progress_cb=progress_cb)
            if job_id in jobs:
                jobs[job_id].update({"status": "done", "result": result})
                asyncio.run_coroutine_threadsafe(
                    manager.broadcast(job_id, jobs[job_id]),
                    loop
                )
        except Exception as e:
            if job_id in jobs:
                jobs[job_id].update({"status": "error", "error": str(e)})
                asyncio.run_coroutine_threadsafe(
                    manager.broadcast(job_id, jobs[job_id]),
                    loop
                )
        finally:
            if os.path.exists(save_path):
                os.remove(save_path)

    loop = asyncio.get_running_loop()
    threading.Thread(target=_run_video, args=(loop,), daemon=True).start()

    return JobStatus(job_id=job_id, status="processing")


@app.get("/api/status/{job_id}", response_model=JobStatus)
def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found or purged")
    return JobStatus(job_id=job_id, status=jobs[job_id]["status"], result=jobs[job_id].get("result"), error=jobs[job_id].get("error"))


@app.get("/api/health")
def health():
    return {"status": "ok", "device": str(detector.device)}
