# backend/app/logger.py
"""
Structured logger for Atheia deepfake detection pipeline.
Provides contextualized logging across ingestion, face localization,
neural inference, aggregation, and response serialization stages.
"""

import json
import logging
import sys
import time
from typing import Any, Dict, Optional

# Configure standard root logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger("atheia")


class PipelineStage:
    STARTUP = "STARTUP"
    INGESTION = "INGESTION"
    FACE_DETECTION = "FACE_DETECTION"
    INFERENCE = "INFERENCE"
    AGGREGATION = "AGGREGATION"
    SERIALIZATION = "SERIALIZATION"
    CLEANUP = "CLEANUP"
    ERROR = "ERROR"


def log_event(
    stage: str,
    message: str,
    job_id: Optional[str] = None,
    level: str = "INFO",
    elapsed_ms: Optional[float] = None,
    extra: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Emits a structured JSON-compatible pipeline log entry.

    Args:
        stage: PipelineStage name (e.g., INFERENCE, FACE_DETECTION).
        message: Human-readable status message.
        job_id: Unique task identifier (if available).
        level: Log level ("INFO", "WARNING", "ERROR", "DEBUG").
        elapsed_ms: Execution duration for the stage in milliseconds.
        extra: Additional key-value metadata to attach.
    """
    payload: Dict[str, Any] = {
        "timestamp": time.time(),
        "stage": stage,
        "message": message,
    }
    if job_id:
        payload["job_id"] = job_id
    if elapsed_ms is not None:
        payload["elapsed_ms"] = round(elapsed_ms, 2)
    if extra:
        payload["metadata"] = extra

    log_msg = f"[{stage}]"
    if job_id:
        log_msg += f" [{job_id[:8]}]"
    log_msg += f" {message}"
    if elapsed_ms is not None:
        log_msg += f" ({elapsed_ms:.1f}ms)"

    lvl = getattr(logging, level.upper(), logging.INFO)
    logger.log(lvl, log_msg)
