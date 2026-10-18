# backend/app/main.py
"""
FastAPI Server for Atheia Deepfake & AI-Generated Media Detection.
Provides high-throughput image analysis, serialized background video jobs,
bounded TTL state tracking, and health telemetry.
"""

from contextlib import asynccontextmanager
import os
import shutil
import threading
import time
from typing import Any, Dict, Optional
import uuid

from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .detector import DeepfakeDetector
from .logger import PipelineStage, log_event

# --- Configuration & Limits ---
MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024     # 50 MB
MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024    # 500 MB
MAX_CONCURRENT_QUEUE = 10                   # Max in-flight processing jobs
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

VIDEO_EXT = {".mp4", ".avi", ".mov", ".mkv", ".flv", ".wmv"}
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}

START_TIME = time.time()


# --- Bounded Thread-Safe Job Store ---
class BoundedJobStore:
    """Thread-safe in-memory job cache with capacity capping and TTL eviction."""

    def __init__(self, max_size: int = 500, ttl_seconds: int = 3600):
        self._jobs: Dict[str, Dict[str, Any]] = {}
        self._created_at: Dict[str, float] = {}
        self._max_size = max_size
        self._ttl = ttl_seconds
        self._lock = threading.Lock()

    def __setitem__(self, job_id: str, value: Dict[str, Any]) -> None:
        with self._lock:
            self._evict_expired()
            if len(self._jobs) >= self._max_size:
                oldest = min(self._created_at, key=self._created_at.get)  # type: ignore
                self._jobs.pop(oldest, None)
                self._created_at.pop(oldest, None)
            self._jobs[job_id] = value.copy()
            self._created_at[job_id] = time.time()

    def __getitem__(self, job_id: str) -> Dict[str, Any]:
        with self._lock:
            self._evict_expired()
            if job_id not in self._jobs:
                raise KeyError(job_id)
            return self._jobs[job_id].copy()

    def __contains__(self, job_id: str) -> bool:
        with self._lock:
            self._evict_expired()
            return job_id in self._jobs

    def active_processing_count(self) -> int:
        with self._lock:
            return sum(1 for v in self._jobs.values() if v.get("status") == "processing")

    def total_count(self) -> int:
        with self._lock:
            return len(self._jobs)

    def _evict_expired(self) -> None:
        now = time.time()
        expired = [k for k, t in self._created_at.items() if now - t > self._ttl]
        for k in expired:
            self._jobs.pop(k, None)
            self._created_at.pop(k, None)


jobs = BoundedJobStore(max_size=500, ttl_seconds=3600)

# Hardware concurrency limiter for video inference (prevents GPU VRAM exhaustion)
VIDEO_SEMAPHORE = threading.Semaphore(1)


# --- Lifespan Event Handling ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    log_event(PipelineStage.STARTUP, "Atheia FastAPI backend starting up...")
    # Clean up any leftover temporary files in upload directory
    cleaned = 0
    if os.path.exists(UPLOAD_DIR):
        for fname in os.listdir(UPLOAD_DIR):
            fpath = os.path.join(UPLOAD_DIR, fname)
            try:
                if os.path.isfile(fpath):
                    os.remove(fpath)
                    cleaned += 1
            except Exception:
                pass
    if cleaned > 0:
        log_event(PipelineStage.CLEANUP, f"Purged {cleaned} stale temporary upload files.")
    yield
    # Shutdown tasks
    log_event(PipelineStage.STARTUP, "Atheia FastAPI backend shutting down.")


app = FastAPI(
    title="Atheia Deepfake & AI-Gen Detector API",
    version="1.1",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load detection engine once on startup
detector = DeepfakeDetector()


# --- Pydantic Data Contracts ---
class JobStatus(BaseModel):
    job_id: str = Field(..., description="Unique UUID job identifier")
    status: str = Field(..., description="'processing' | 'done' | 'error'")
    result: Optional[Dict[str, Any]] = Field(None, description="Detection result dictionary")
    error: Optional[str] = Field(None, description="Error message if status is error")


class HealthResponse(BaseModel):
    status: str
    device: str
    active_jobs: int
    uptime_seconds: float


# --- API Routes ---
@app.get("/", tags=["General"])
def root():
    return {
        "service": "Atheia Deepfake & AI-Gen Detection Engine",
        "status": "online",
        "device": str(detector.device),
        "version": "1.1",
    }


@app.post("/api/analyze", response_model=JobStatus, tags=["Inference"])
async def analyze(file: UploadFile = File(...)):
    """
    Accepts multipart image or video uploads.
    Images execute synchronously; videos are processed in background threads.
    """
    filename = file.filename or "unknown"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in VIDEO_EXT and ext not in IMAGE_EXT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Supported: {', '.join(IMAGE_EXT | VIDEO_EXT)}",
        )

    # Check capacity limit
    if jobs.active_processing_count() >= MAX_CONCURRENT_QUEUE:
        log_event(PipelineStage.INGESTION, "Queue limit reached.", level="WARNING")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Inference queue is currently full. Please retry momentarily.",
        )

    job_id = str(uuid.uuid4())
    save_path = os.path.join(UPLOAD_DIR, f"{job_id}{ext}")

    # Stream file to disk and validate size
    max_size = MAX_VIDEO_SIZE_BYTES if ext in VIDEO_EXT else MAX_IMAGE_SIZE_BYTES
    bytes_written = 0

    try:
        with open(save_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1 MB chunks
                bytes_written += len(chunk)
                if bytes_written > max_size:
                    status_code_413 = getattr(status, "HTTP_413_CONTENT_TOO_LARGE", 413)
                    raise HTTPException(
                        status_code=status_code_413,
                        detail=f"File exceeds maximum allowed size ({max_size // (1024*1024)} MB).",
                    )
                buffer.write(chunk)
    except HTTPException:
        if os.path.exists(save_path):
            os.remove(save_path)
        raise
    except Exception as e:
        if os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(status_code=500, detail=f"Failed to stage upload: {str(e)}")

    if bytes_written == 0:
        if os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes).",
        )

    log_event(
        PipelineStage.INGESTION,
        f"Staged {filename} ({bytes_written / (1024*1024):.2f} MB)",
        job_id=job_id,
    )
    jobs[job_id] = {"status": "processing", "result": None, "error": None}

    # Synchronous processing for static images
    if ext in IMAGE_EXT:
        t_start = time.time()
        try:
            result = detector.predict_image(save_path)
            jobs[job_id] = {"status": "done", "result": result, "error": None}
            log_event(
                PipelineStage.INFERENCE,
                f"Image job finished: {result.get('prediction', 'UNKNOWN')}",
                job_id=job_id,
                elapsed_ms=(time.time() - t_start) * 1000,
            )
        except Exception as e:
            log_event(PipelineStage.ERROR, f"Image prediction failed: {str(e)}", job_id=job_id, level="ERROR")
            jobs[job_id] = {"status": "error", "result": None, "error": str(e)}
        finally:
            if os.path.exists(save_path):
                try:
                    os.remove(save_path)
                except Exception:
                    pass

        return JobStatus(job_id=job_id, **jobs[job_id])

    # Asynchronous background thread for video sequences
    def _run_video_worker():
        worker_start = time.time()
        log_event(PipelineStage.INFERENCE, "Worker acquired video task, waiting on semaphore...", job_id=job_id)
        with VIDEO_SEMAPHORE:
            log_event(PipelineStage.INFERENCE, "Video analysis lock acquired. Executing inference...", job_id=job_id)
            try:
                result = detector.predict_video(save_path)
                jobs[job_id] = {"status": "done", "result": result, "error": None}
                log_event(
                    PipelineStage.INFERENCE,
                    f"Video job finished: {result.get('prediction', 'UNKNOWN')}",
                    job_id=job_id,
                    elapsed_ms=(time.time() - worker_start) * 1000,
                )
            except Exception as e:
                log_event(PipelineStage.ERROR, f"Video worker error: {str(e)}", job_id=job_id, level="ERROR")
                jobs[job_id] = {"status": "error", "result": None, "error": str(e)}
            finally:
                if os.path.exists(save_path):
                    try:
                        os.remove(save_path)
                    except Exception:
                        pass

    worker_thread = threading.Thread(target=_run_video_worker, daemon=True)
    worker_thread.start()

    return JobStatus(job_id=job_id, status="processing")


@app.get("/api/status/{job_id}", response_model=JobStatus, tags=["Inference"])
def get_status(job_id: str):
    """Retrieves current processing status or completed verdict for a job ID."""
    if job_id not in jobs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job '{job_id}' not found or expired.",
        )
    return JobStatus(job_id=job_id, **jobs[job_id])


@app.get("/api/health", response_model=HealthResponse, tags=["General"])
def health():
    """System health check and runtime telemetry."""
    return HealthResponse(
        status="ok",
        device=str(detector.device),
        active_jobs=jobs.active_processing_count(),
        uptime_seconds=round(time.time() - START_TIME, 1),
    )