# backend/app/detector.py
"""
Deepfake & AI-Generated Media Detection Engine.
Integrates Caffe SSD face detection, EfficientNet-B0 spatial classification,
and optional ViFi-CLIP (DAViD) multi-modal feature extraction.
"""

import base64
import os
import time
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms

from .logger import PipelineStage, log_event

# --- Path Configuration ---
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BACKEND_DIR, "models")
DAVID_DIR = os.path.join(BACKEND_DIR, "david")
WEIGHTS_PATH = os.path.join(MODELS_DIR, "efficientnet_b0_ffpp_c23.pth")
PROTO_PATH = os.path.join(MODELS_DIR, "deploy.prototxt")
CAFFE_PATH = os.path.join(MODELS_DIR, "res10_300x300_ssd_iter_140000.caffemodel")
DAVID_CHECKPOINT = os.path.join(MODELS_DIR, "david_encoder_clean.pth")
DAVID_CLASSIFIER = os.path.join(MODELS_DIR, "best_detector_model.pt")


class DeepfakeDetector:
    """
    Production-grade deepfake detector supporting multi-face extraction,
    batched neural inference, temperature calibration, and temporal aggregation.
    """

    def __init__(self, temperature: float = 1.25, batch_size: int = 16):
        start_t = time.time()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.temperature = temperature
        self.batch_size = batch_size

        log_event(PipelineStage.STARTUP, f"Initializing detector on device: {self.device}")

        required_files = [WEIGHTS_PATH, PROTO_PATH, CAFFE_PATH]
        missing_files = [path for path in required_files if not os.path.exists(path)]
        if missing_files:
            missing_names = ", ".join(os.path.basename(path) for path in missing_files)
            raise FileNotFoundError(
                f"Missing model assets in {MODELS_DIR}: {missing_names}. "
                "Download the model files using python download_models.py before starting."
            )

        # --- Spatial model (EfficientNet-B0) ---
        self.spatial = models.efficientnet_b0(weights=None)
        self.spatial.classifier[1] = nn.Linear(
            self.spatial.classifier[1].in_features, 2
        )
        ckpt = torch.load(WEIGHTS_PATH, map_location=self.device)
        state = ckpt.get("state_dict", ckpt.get("model", ckpt))
        state = {
            k.replace("backbone.", "").replace("module.", ""): v
            for k, v in state.items()
        }
        self.spatial.load_state_dict(state, strict=False)
        self.spatial.to(self.device).eval()

        # Freeze spatial parameters for zero-overhead inference
        for param in self.spatial.parameters():
            param.requires_grad = False

        # --- Caffe SSD Face Detector ---
        self.face_net = cv2.dnn.readNetFromCaffe(PROTO_PATH, CAFFE_PATH)

        # --- Optional DAViD ViFi-CLIP Models ---
        self.david_encoder = None
        self.david_classifier = None
        if os.path.exists(DAVID_CHECKPOINT) and os.path.exists(DAVID_CLASSIFIER):
            self._load_david()
        else:
            log_event(
                PipelineStage.STARTUP,
                "DAViD checkpoints not found; spatial detector active as primary.",
            )

        # --- Normalization Transforms ---
        # ImageNet normalization for EfficientNet-B0
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
            ),
        ])
        # OpenAI CLIP normalization for ViFi-CLIP (DAViD)
        self.clip_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.48145466, 0.4578275, 0.40821073],
                std=[0.26862954, 0.26130258, 0.27577711],
            ),
        ])

        elapsed = (time.time() - start_t) * 1000
        log_event(
            PipelineStage.STARTUP,
            "DeepfakeDetector successfully initialized.",
            elapsed_ms=elapsed,
        )

    def _load_david(self) -> None:
        """Loads DAViD ViFi-CLIP feature extractor and classification head."""
        import sys

        sys.path.insert(0, DAVID_DIR)
        from encoder import load_feature_extractor
        from model import ClassificationHead

        log_event(PipelineStage.STARTUP, "Loading DAViD ViFi-CLIP weights...")
        self.david_encoder = (
            load_feature_extractor(
                arch="ViT-B/16",
                class_names=("real", "deepfake", "ai_gen"),
                checkpoint_path=DAVID_CHECKPOINT,
            )
            .eval()
            .to(self.device)
        )
        for p in self.david_encoder.parameters():
            p.requires_grad = False

        self.david_classifier = ClassificationHead(input_dim=512, num_classes=3)
        cls_state = torch.load(DAVID_CLASSIFIER, map_location="cpu", weights_only=False)
        if isinstance(cls_state, dict) and "model" in cls_state:
            cls_state = cls_state["model"]
        cls_state = {k.replace("module.", ""): v for k, v in cls_state.items()}
        self.david_classifier.load_state_dict(cls_state, strict=False)
        self.david_classifier.eval().to(self.device)
        for p in self.david_classifier.parameters():
            p.requires_grad = False

        log_event(PipelineStage.STARTUP, "DAViD multi-modal network ready.")

    # -------------------------------------------------------------------------
    # Face Extraction Pipeline (Aspect-Ratio Preserving, Multi-Face Support)
    # -------------------------------------------------------------------------

    def crop_faces(
        self,
        img: np.ndarray,
        conf: float = 0.5,
        max_faces: int = 5,
    ) -> List[Tuple[Image.Image, Tuple[int, int, int, int], float]]:
        """
        Detects and extracts all faces exceeding the confidence threshold.

        Applies aspect-ratio preserving square expansion centered on the face
        to prevent anamorphic feature distortion during resize to (224, 224).

        Args:
            img: BGR image from OpenCV.
            conf: Minimum confidence threshold for Caffe SSD.
            max_faces: Maximum number of faces to extract (ranked by confidence).

        Returns:
            List of tuples: (PIL_image_crop, (x1, y1, x2, y2), detection_confidence)
        """
        if img is None or img.size == 0:
            return []

        h, w = img.shape[:2]
        # For high-resolution frames (e.g. 4K), compute blob on downscaled preview to bound latency
        blob_w, blob_h = (300, 300)
        blob = cv2.dnn.blobFromImage(
            cv2.resize(img, (blob_w, blob_h)),
            1.0,
            (blob_w, blob_h),
            (104.0, 177.0, 123.0),
        )
        self.face_net.setInput(blob)
        detections = self.face_net.forward()

        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        candidates = []

        for i in range(detections.shape[2]):
            c = float(detections[0, 0, i, 2])
            if c > conf:
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                x1, y1, x2, y2 = box.astype("int")
                box_w = x2 - x1
                box_h = y2 - y1
                if box_w > 10 and box_h > 10:
                    candidates.append((c, x1, y1, x2, y2))

        if not candidates:
            return []

        # Sort candidate faces descending by detection confidence
        candidates.sort(key=lambda item: item[0], reverse=True)
        results = []

        for c, x1, y1, x2, y2 in candidates[:max_faces]:
            # Centered square expansion (1.2x scale margin)
            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2
            side = int(max(x2 - x1, y2 - y1) * 1.2)
            half = max(side // 2, 1)

            sx1 = max(0, cx - half)
            sy1 = max(0, cy - half)
            sx2 = min(w, cx + half)
            sy2 = min(h, cy + half)

            crop = rgb[sy1:sy2, sx1:sx2]
            if crop.size == 0 or crop.shape[0] < 5 or crop.shape[1] < 5:
                continue

            results.append((Image.fromarray(crop), (sx1, sy1, sx2, sy2), c))

        return results

    # -------------------------------------------------------------------------
    # Batched Model Inference
    # -------------------------------------------------------------------------

    def _predict_batch_spatial(self, face_tensors: torch.Tensor) -> np.ndarray:
        """
        Runs batched spatial inference through EfficientNet-B0.

        Args:
            face_tensors: Tensor of shape (B, 3, 224, 224).

        Returns:
            Numpy array of calibrated fake probabilities of shape (B,).
        """
        with torch.inference_mode():
            logits = self.spatial(face_tensors.to(self.device))
            scaled_logits = logits / self.temperature
            probs = torch.softmax(scaled_logits, dim=1)[:, 1].cpu().numpy()
            return probs.astype(float)

    def _predict_batch_david(
        self, clip_tensors: torch.Tensor
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Runs batched multi-modal inference through DAViD (ViFi-CLIP).

        Args:
            clip_tensors: Tensor of shape (B, 3, 224, 224).

        Returns:
            Tuple of (ai_gen_probs, deepfake_probs) arrays of shape (B,).
        """
        if self.david_encoder is None or self.david_classifier is None:
            b = clip_tensors.shape[0]
            return np.zeros(b, dtype=float), np.zeros(b, dtype=float)

        with torch.inference_mode():
            feats = self.david_encoder.image_encoder(clip_tensors.to(self.device))
            logits = self.david_classifier(feats)
            probs = torch.softmax(logits, dim=1).cpu().numpy()
            deepfake_probs = probs[:, 1].astype(float)
            ai_gen_probs = probs[:, 2].astype(float)
            return ai_gen_probs, deepfake_probs

    def _fuse_scores(
        self, spatial_fake: float, ai_gen: float, deepfake: float
    ) -> float:
        """Calibrated heuristic fusion between spatial and multi-modal signals."""
        if ai_gen > 0.35:
            fused = ai_gen * 0.75 + spatial_fake * 0.25
        elif ai_gen > 0.25:
            fused = ai_gen * 0.5 + spatial_fake * 0.3 + deepfake * 0.2
        else:
            fused = spatial_fake
        return float(min(max(fused, 0.0), 1.0))

    # -------------------------------------------------------------------------
    # Frame & Image Analysis
    # -------------------------------------------------------------------------

    def _predict_frame_multi(
        self, cv2_img: np.ndarray
    ) -> Optional[Dict[str, Any]]:
        """
        Extracts all faces in a frame and executes batched evaluation.
        Selects the most suspicious face (worst-case) as the primary subject.
        """
        faces = self.crop_faces(cv2_img, conf=0.5, max_faces=5)
        if not faces:
            return None

        # Build tensor batch
        tensors = torch.stack([self.transform(f[0]) for f in faces])
        spatial_scores = self._predict_batch_spatial(tensors)

        if self.david_encoder is not None:
            clip_tensors = torch.stack([self.clip_transform(f[0]) for f in faces])
            ai_gen_scores, deepfake_scores = self._predict_batch_david(clip_tensors)
        else:
            ai_gen_scores = np.zeros(len(faces))
            deepfake_scores = np.zeros(len(faces))

        evaluated_faces = []
        for idx, (face_pil, bbox, det_conf) in enumerate(faces):
            s_fake = float(spatial_scores[idx])
            ai_g = float(ai_gen_scores[idx])
            df = float(deepfake_scores[idx])
            fused = self._fuse_scores(s_fake, ai_g, df)
            evaluated_faces.append({
                "fake_score": fused,
                "spatial": s_fake,
                "ai_gen": ai_g,
                "deepfake": df,
                "face": face_pil,
                "bbox": bbox,
                "det_conf": det_conf,
            })

        # Primary selection: worst-case fake face (if any face is fake),
        # otherwise face with highest detector confidence
        fake_faces = [f for f in evaluated_faces if f["fake_score"] >= 0.5]
        if fake_faces:
            primary = max(fake_faces, key=lambda f: f["fake_score"])
        else:
            primary = max(evaluated_faces, key=lambda f: f["det_conf"])

        return {
            "primary": primary,
            "all_faces": evaluated_faces,
            "faces_detected": len(evaluated_faces),
            "frame": cv2_img,
        }

    @staticmethod
    def _image_data_url(image: Any, quality: int = 88) -> Optional[str]:
        """Encodes an image to a base64 JPEG data URL."""
        if isinstance(image, Image.Image):
            image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        ok, encoded = cv2.imencode(".jpg", image, [cv2.IMWRITE_JPEG_QUALITY, quality])
        if not ok:
            return None
        payload = base64.b64encode(encoded.tobytes()).decode("ascii")
        return f"data:image/jpeg;base64,{payload}"

    def _preview_payload(self, frame_res: Dict[str, Any]) -> Dict[str, Any]:
        """Constructs base64 preview payloads and face bounding box coordinates."""
        frame = frame_res["frame"].copy()
        primary = frame_res["primary"]
        x1, y1, x2, y2 = primary["bbox"]

        # Green bounding box for authentic primary, red for synthetic primary
        box_color = (42, 60, 235) if primary["fake_score"] > 0.5 else (42, 190, 126)
        cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 3)

        # Draw secondary face boxes in amber
        for f in frame_res["all_faces"]:
            if f is not primary:
                bx1, by1, bx2, by2 = f["bbox"]
                cv2.rectangle(frame, (bx1, by1), (bx2, by2), (36, 191, 251), 2)

        return {
            "face_crop": self._image_data_url(primary["face"]),
            "annotated_preview": self._image_data_url(frame),
            "face_box": {
                "x": int(x1),
                "y": int(y1),
                "width": int(x2 - x1),
                "height": int(y2 - y1),
            },
            "image_width": int(frame.shape[1]),
            "image_height": int(frame.shape[0]),
            "faces_detected": frame_res["faces_detected"],
        }

    # -------------------------------------------------------------------------
    # Public API: Image Analysis
    # -------------------------------------------------------------------------

    def predict_image(self, image_path: str) -> Dict[str, Any]:
        """
        Executes end-to-end deepfake analysis on a single image file.

        Args:
            image_path: Absolute or relative path to image.

        Returns:
            Dictionary matching the API contract schema with verdict and confidence.
        """
        t0 = time.time()
        log_event(PipelineStage.INGESTION, f"Processing image: {os.path.basename(image_path)}")

        if not os.path.exists(image_path) or os.path.getsize(image_path) == 0:
            return {
                "prediction": "UNDETERMINED",
                "error": "Image file is missing or empty.",
                "fake_confidence": 0.0,
                "ai_gen_score": 0.0,
                "deepfake_score": 0.0,
            }

        img = cv2.imread(image_path)
        if img is None:
            return {
                "prediction": "UNDETERMINED",
                "error": "Image file could not be decoded. Ensure it is a valid JPG/PNG.",
                "fake_confidence": 0.0,
                "ai_gen_score": 0.0,
                "deepfake_score": 0.0,
            }

        # Guard against decompression memory bloat: clamp massive image dimensions to 4K max
        max_dim = max(img.shape[:2])
        if max_dim > 3840:
            scale = 3840.0 / max_dim
            img = cv2.resize(
                img,
                (int(img.shape[1] * scale), int(img.shape[0] * scale)),
                interpolation=cv2.INTER_AREA,
            )

        frame_res = self._predict_frame_multi(img)
        if frame_res is None:
            log_event(
                PipelineStage.FACE_DETECTION,
                "No face detected in image.",
                level="WARNING",
            )
            return {
                "prediction": "UNDETERMINED",
                "error": "No face detected in image. Ensure face is visible and well-lit.",
                "fake_confidence": 0.0,
                "ai_gen_score": 0.0,
                "deepfake_score": 0.0,
            }

        primary = frame_res["primary"]
        is_fake = primary["fake_score"] > 0.5
        verdict = "FAKE" if is_fake else "REAL"

        preview = self._preview_payload(frame_res)
        elapsed = (time.time() - t0) * 1000

        log_event(
            PipelineStage.INFERENCE,
            f"Image analysis complete: verdict={verdict}, score={primary['fake_score']:.3f}, faces={frame_res['faces_detected']}",
            elapsed_ms=elapsed,
        )

        return {
            "prediction": verdict,
            "fake_confidence": round(primary["fake_score"] * 100, 2),
            "ai_gen_score": round(primary["ai_gen"] * 100, 2),
            "deepfake_score": round(primary["deepfake"] * 100, 2),
            **preview,
        }

    # -------------------------------------------------------------------------
    # Public API: Video Analysis (Decord Batch Extraction + Batched Inference)
    # -------------------------------------------------------------------------

    def _extract_video_frames(
        self, video_path: str, fps_extract: float = 2.0
    ) -> Tuple[List[np.ndarray], int, float]:
        """
        Extracts sampled video frames using decord if available,
        falling back gracefully to OpenCV VideoCapture.
        """
        frames: List[np.ndarray] = []
        frame_count: int = 0
        fps: float = 30.0

        # Attempt extraction via decord (fastest C++ video reader)
        try:
            from decord import VideoReader, cpu

            vr = VideoReader(video_path, ctx=cpu(0))
            frame_count = len(vr)
            fps = float(vr.get_avg_fps()) if vr.get_avg_fps() > 0 else 30.0
            duration = frame_count / fps if fps > 0 else 0
            n = max(15, min(90, int(duration * fps_extract)))
            indices = np.linspace(0, max(0, frame_count - 1), n, dtype=int)

            batch = vr.get_batch(indices).asnumpy()
            for i in range(len(batch)):
                # Decord returns RGB; convert to BGR for OpenCV consistency
                frames.append(cv2.cvtColor(batch[i], cv2.COLOR_RGB2BGR))

            log_event(
                PipelineStage.INGESTION,
                f"Decord decoded {len(frames)} frames across {duration:.1f}s ({fps:.1f} fps).",
            )
            return frames, frame_count, fps

        except Exception as decord_err:
            log_event(
                PipelineStage.INGESTION,
                f"Decord unavailable or failed on codec: {decord_err}. Falling back to OpenCV.",
                level="DEBUG",
            )

        # Fallback to OpenCV VideoCapture
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return [], 0, 0.0

        try:
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = float(cap.get(cv2.CAP_PROP_FPS) or 30.0)
            duration = frame_count / fps if fps > 0 else 0
            n = max(15, min(90, int(duration * fps_extract)))
            indices = np.linspace(0, max(0, frame_count - 1), n, dtype=int)

            for idx in indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if ret and frame is not None:
                    frames.append(frame)
        finally:
            cap.release()

        return frames, frame_count, fps

    def predict_video(
        self, video_path: str, fps_extract: float = 2.0, threshold: float = 0.5
    ) -> Dict[str, Any]:
        """
        Executes batched temporal deepfake analysis on a video file.

        Args:
            video_path: Path to video file.
            fps_extract: Sample rate in frames per second.
            threshold: Decision boundary threshold (0.5).

        Returns:
            Dictionary matching the API contract schema with temporal voting breakdown.
        """
        t0 = time.time()
        log_event(PipelineStage.INGESTION, f"Starting video analysis: {os.path.basename(video_path)}")

        if not os.path.exists(video_path) or os.path.getsize(video_path) == 0:
            return {
                "prediction": "UNDETERMINED",
                "error": "Video file is missing or empty.",
                "message": "Video file is missing or empty.",
                "fake_frame_ratio": 0.0,
                "average_fake_confidence": 0.0,
                "top5_mean_fake": 0.0,
                "max_fake_confidence": 0.0,
                "frames_processed": 0,
                "total_frames": 0,
                "average_ai_gen_score": 0.0,
            }

        frames, frame_count, fps = self._extract_video_frames(
            video_path, fps_extract=fps_extract
        )

        if not frames:
            return {
                "prediction": "UNDETERMINED",
                "error": "Could not read or decode video stream.",
                "message": "Could not decode video file.",
                "fake_frame_ratio": 0.0,
                "average_fake_confidence": 0.0,
                "top5_mean_fake": 0.0,
                "max_fake_confidence": 0.0,
                "frames_processed": 0,
                "total_frames": frame_count,
                "average_ai_gen_score": 0.0,
            }

        # Collect detected faces across all frames
        frame_face_records = []
        all_face_pil_crops = []

        for frame in frames:
            face_candidates = self.crop_faces(frame, conf=0.5, max_faces=3)
            if face_candidates:
                frame_face_records.append({
                    "frame": frame,
                    "faces": face_candidates,
                    "start_idx": len(all_face_pil_crops),
                    "count": len(face_candidates),
                })
                for face_pil, bbox, c in face_candidates:
                    all_face_pil_crops.append(face_pil)

        if not all_face_pil_crops:
            log_event(
                PipelineStage.FACE_DETECTION,
                "No faces detected in any sampled video frames.",
                level="WARNING",
            )
            return {
                "prediction": "UNDETERMINED",
                "error": "No faces detected across video frames. Ensure subjects are visible.",
                "message": "No faces detected in video frames.",
                "fake_frame_ratio": 0.0,
                "average_fake_confidence": 0.0,
                "top5_mean_fake": 0.0,
                "max_fake_confidence": 0.0,
                "frames_processed": 0,
                "total_frames": frame_count,
                "average_ai_gen_score": 0.0,
            }

        # Batched inference over all face crops
        log_event(
            PipelineStage.INFERENCE,
            f"Executing batched inference on {len(all_face_pil_crops)} face crops across {len(frame_face_records)} frames.",
        )

        all_spatial_scores: List[float] = []
        all_ai_gen_scores: List[float] = []
        all_deepfake_scores: List[float] = []

        # Process face crops in mini-batches
        for b_start in range(0, len(all_face_pil_crops), self.batch_size):
            b_pils = all_face_pil_crops[b_start : b_start + self.batch_size]
            b_tensors = torch.stack([self.transform(p) for p in b_pils])
            b_spatial = self._predict_batch_spatial(b_tensors)
            all_spatial_scores.extend(b_spatial.tolist())

            if self.david_encoder is not None:
                b_clip_tensors = torch.stack([self.clip_transform(p) for p in b_pils])
                b_ai_gen, b_deepfake = self._predict_batch_david(b_clip_tensors)
                all_ai_gen_scores.extend(b_ai_gen.tolist())
                all_deepfake_scores.extend(b_deepfake.tolist())
            else:
                all_ai_gen_scores.extend([0.0] * len(b_pils))
                all_deepfake_scores.extend([0.0] * len(b_pils))

        # Re-aggregate back into frame-level results
        fake_scores: List[float] = []
        ai_gen_scores: List[float] = []
        best_frame_payload: Optional[Dict[str, Any]] = None
        highest_frame_fake_score = -1.0
        fake_votes = 0
        real_votes = 0

        for record in frame_face_records:
            s_idx = record["start_idx"]
            cnt = record["count"]

            evaluated_frame_faces = []
            for f_i in range(cnt):
                global_i = s_idx + f_i
                s_fake = all_spatial_scores[global_i]
                ai_g = all_ai_gen_scores[global_i]
                df = all_deepfake_scores[global_i]
                fused = self._fuse_scores(s_fake, ai_g, df)

                face_pil, bbox, det_c = record["faces"][f_i]
                evaluated_frame_faces.append({
                    "fake_score": fused,
                    "spatial": s_fake,
                    "ai_gen": ai_g,
                    "deepfake": df,
                    "face": face_pil,
                    "bbox": bbox,
                    "det_conf": det_c,
                })

            # Worst-case selection for the frame
            frame_primary = max(evaluated_frame_faces, key=lambda f: f["fake_score"])
            frame_fake = frame_primary["fake_score"]
            frame_ai_gen = frame_primary["ai_gen"]

            fake_scores.append(frame_fake)
            ai_gen_scores.append(frame_ai_gen)

            if frame_fake >= threshold:
                fake_votes += 1
            else:
                real_votes += 1

            if frame_fake > highest_frame_fake_score:
                highest_frame_fake_score = frame_fake
                best_frame_payload = {
                    "primary": frame_primary,
                    "all_faces": evaluated_frame_faces,
                    "faces_detected": cnt,
                    "frame": record["frame"],
                }

        # Clear PyTorch CUDA cache
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        avg_fake = float(np.mean(fake_scores))
        total_votes = fake_votes + real_votes
        fake_ratio = fake_votes / total_votes if total_votes else 0.0
        vote_pred = "FAKE" if fake_ratio >= 0.5 else "REAL"

        sorted_scores = sorted(fake_scores, reverse=True)
        top_k = min(5, len(sorted_scores))
        top5_mean = float(np.mean(sorted_scores[:top_k]))
        max_score = float(sorted_scores[0])

        # Robust decision logic
        if vote_pred == "FAKE" or top5_mean >= 0.60 or (max_score >= 0.90 and top5_mean >= 0.50):
            final_pred = "FAKE"
        elif top5_mean >= 0.45 or max_score >= 0.75:
            final_pred = "LIKELY FAKE"
        else:
            final_pred = "REAL"

        preview = self._preview_payload(best_frame_payload) if best_frame_payload else {}
        elapsed = (time.time() - t0) * 1000

        log_event(
            PipelineStage.INFERENCE,
            f"Video analysis complete: verdict={final_pred}, avg_score={avg_fake:.3f}, frames={len(fake_scores)}",
            elapsed_ms=elapsed,
        )

        return {
            "prediction": final_pred,
            "vote_prediction": vote_pred,
            "fake_frame_ratio": round(fake_ratio * 100, 2),
            "average_fake_confidence": round(avg_fake * 100, 2),
            "top5_mean_fake": round(top5_mean * 100, 2),
            "max_fake_confidence": round(max_score * 100, 2),
            "frames_processed": len(fake_scores),
            "total_frames": frame_count,
            "average_ai_gen_score": round(float(np.mean(ai_gen_scores)) * 100, 2),
            **preview,
        }