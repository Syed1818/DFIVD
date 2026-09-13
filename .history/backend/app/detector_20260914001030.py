# backend/app/detector.py
import base64
import os, cv2, torch, torch.nn as nn
import numpy as np
from PIL import Image
from torchvision import models, transforms

# --- Configuration ---
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BACKEND_DIR, "models")
DAVID_DIR = os.path.join(BACKEND_DIR, "david")
WEIGHTS_PATH = os.path.join(MODELS_DIR, "efficientnet_b0_ffpp_c23.pth")
PROTO_PATH = os.path.join(MODELS_DIR, "deploy.prototxt")
CAFFE_PATH = os.path.join(MODELS_DIR, "res10_300x300_ssd_iter_140000.caffemodel")
DAVID_CHECKPOINT = os.path.join(MODELS_DIR, "david_encoder_clean.pth")
DAVID_CLASSIFIER = os.path.join(MODELS_DIR, "best_detector_model.pt")

class DeepfakeDetector:
    """Loads all models once. Reused across requests."""

    def __init__(self):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"Loading models on {self.device}...")

        required_files = [WEIGHTS_PATH, PROTO_PATH, CAFFE_PATH]
        missing_files = [path for path in required_files if not os.path.exists(path)]
        if missing_files:
            missing_names = ", ".join(os.path.basename(path) for path in missing_files)
            raise FileNotFoundError(
                f"Missing model assets in {MODELS_DIR}: {missing_names}. "
                "Download the model files before starting FastAPI."
            )

        # --- Spatial model ---
        self.spatial = models.efficientnet_b0(weights=None)
        self.spatial.classifier[1] = nn.Linear(
            self.spatial.classifier[1].in_features, 2
        )
        ckpt = torch.load(WEIGHTS_PATH, map_location=self.device)
        state = ckpt.get('state_dict', ckpt.get('model', ckpt))
        state = {k.replace("backbone.", "").replace("module.", ""): v
                 for k, v in state.items()}
        self.spatial.load_state_dict(state, strict=False)
        self.spatial.to(self.device).eval()

        # --- Face detector ---
        self.face_net = cv2.dnn.readNetFromCaffe(PROTO_PATH, CAFFE_PATH)

        # --- DAViD ---
        self.david_encoder = None
        self.david_classifier = None
        if os.path.exists(DAVID_CHECKPOINT) and os.path.exists(DAVID_CLASSIFIER):
            self._load_david()
        else:
            print("DAViD checkpoints not found; using spatial detector fallback.")

        # --- Transforms ---
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225])
        ])
        print("All models loaded.")

    def _load_david(self):
        """Load DAViD encoder + classifier."""
        import sys
        sys.path.insert(0, DAVID_DIR)
        from encoder import load_feature_extractor
        from model import ClassificationHead

        self.david_encoder = load_feature_extractor(
            arch="ViT-B/16",
            class_names=("real", "deepfake", "ai_gen"),
            checkpoint_path=DAVID_CHECKPOINT,
        ).eval().to(self.device)

        self.david_classifier = ClassificationHead(input_dim=512, num_classes=3)
        cls_state = torch.load(DAVID_CLASSIFIER, map_location="cpu",
                               weights_only=False)
        if isinstance(cls_state, dict) and 'model' in cls_state:
            cls_state = cls_state['model']
        cls_state = {k.replace("module.", ""): v for k, v in cls_state.items()}
        self.david_classifier.load_state_dict(cls_state, strict=False)
        self.david_classifier.eval().to(self.device)

    # ---- Face crop (same as your Colab code) ----
    def crop_face(self, img, conf=0.5):
        h, w = img.shape[:2]
        blob = cv2.dnn.blobFromImage(cv2.resize(img, (300, 300)), 1.0,
                                     (300, 300), (104.0, 177.0, 123.0))
        self.face_net.setInput(blob)
        detections = self.face_net.forward()
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        best_conf, best_box = 0, None
        for i in range(detections.shape[2]):
            c = detections[0, 0, i, 2]
            if c > conf and c > best_conf:
                best_conf = c
                best_box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
        if best_box is None:
            return None
        x1, y1, x2, y2 = best_box.astype("int")
        mx, my = int((x2-x1)*0.1), int((y2-y1)*0.1)
        x1, y1 = max(0, x1-mx), max(0, y1-my)
        x2, y2 = min(w, x2+mx), min(h, y2+my)
        crop = rgb[y1:y2, x1:x2]
        if crop.size == 0:
            return None
        return Image.fromarray(crop), (x1, y1, x2, y2)

    # ---- Per-frame prediction (your fusion logic) ----
    def _predict_frame(self, cv2_img):
        result = self.crop_face(cv2_img)
        if result is None:
            return None
        face, bbox = result
        tensor = self.transform(face).unsqueeze(0).to(self.device)

        with torch.no_grad():
            spatial_fake = torch.softmax(
                self.spatial(tensor), dim=1
            )[0][1].item()

            if self.david_encoder is not None:
                feats = self.david_encoder.image_encoder(tensor)
                logits = self.david_classifier(feats.mean(dim=0, keepdim=True))
                probs = torch.softmax(logits, dim=1)[0].cpu().numpy()
                ai_gen = float(probs[2])
                deepfake = float(probs[1])
            else:
                ai_gen = 0.0
                deepfake = 0.0

        if ai_gen > 0.35:
            fused = ai_gen * 0.75 + spatial_fake * 0.25
        elif ai_gen > 0.25:
            fused = ai_gen * 0.5 + spatial_fake * 0.3 + deepfake * 0.2
        else:
            fused = spatial_fake

        return {
            "fake_score": min(max(fused, 0.0), 1.0),
            "ai_gen": ai_gen,
            "deepfake": deepfake,
            "spatial": spatial_fake,
            "face": face,
            "bbox": bbox,
            "frame": cv2_img,
        }

    @staticmethod
    def _image_data_url(image, quality=88):
        if isinstance(image, Image.Image):
            image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        ok, encoded = cv2.imencode(".jpg", image, [cv2.IMWRITE_JPEG_QUALITY, quality])
        if not ok:
            return None
        payload = base64.b64encode(encoded.tobytes()).decode("ascii")
        return f"data:image/jpeg;base64,{payload}"

    def _preview_payload(self, frame_result):
        frame = frame_result["frame"].copy()
        x1, y1, x2, y2 = frame_result["bbox"]
        cv2.rectangle(frame, (x1, y1), (x2, y2), (42, 190, 126), 3)
        return {
            "face_crop": self._image_data_url(frame_result["face"]),
            "annotated_preview": self._image_data_url(frame),
            "face_box": {
                "x": x1,
                "y": y1,
                "width": x2 - x1,
                "height": y2 - y1,
            },
            "image_width": int(frame.shape[1]),
            "image_height": int(frame.shape[0]),
        }

    # ---- Image prediction ----
    def predict_image(self, image_path):
        img = cv2.imread(image_path)
        if img is None:
            return {"error": "Could not read image"}
        r = self._predict_frame(img)
        if r is None:
            return {"error": "No face detected"}
        return {
            "prediction": "FAKE" if r["fake_score"] > 0.5 else "REAL",
            "fake_confidence": round(r["fake_score"] * 100, 2),
            "ai_gen_score": round(r["ai_gen"] * 100, 2),
            "deepfake_score": round(r["deepfake"] * 100, 2),
            **self._preview_payload(r),
        }

    # ---- Video prediction (top-k + voting) ----
    def predict_video(self, video_path, fps_extract=2, threshold=0.5):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {"error": "Could not open video"}

        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        duration = frame_count / fps
        n = max(15, int(duration * fps_extract))
        indices = np.linspace(0, frame_count - 1, n, dtype=int)

        fake_scores, ai_gen_scores = [], []
        best_frame = None
        fake_votes = real_votes = 0

        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if not ret:
                continue
            r = self._predict_frame(frame)
            if r is None:
                continue
            fake_scores.append(r["fake_score"])
            ai_gen_scores.append(r["ai_gen"])
            if best_frame is None or r["fake_score"] > best_frame["fake_score"]:
                best_frame = r
            if r["fake_score"] >= threshold:
                fake_votes += 1
            else:
                real_votes += 1
        cap.release()

        if not fake_scores:
            return {"prediction": "UNDETERMINED",
                    "message": "No faces detected"}

        avg_fake = float(np.mean(fake_scores))
        total = fake_votes + real_votes
        fake_ratio = fake_votes / total if total else 0
        vote_pred = "FAKE" if fake_ratio >= 0.5 else "REAL"

        sorted_scores = sorted(fake_scores, reverse=True)
        top_k = min(5, len(sorted_scores))
        top5_mean = float(np.mean(sorted_scores[:top_k]))
        max_score = float(sorted_scores[0])

        if vote_pred == "FAKE" or top5_mean >= 0.55 or max_score >= 0.85:
            final = "FAKE"
        elif top5_mean >= 0.45 or max_score >= 0.70:
            final = "LIKELY FAKE"
        else:
            final = "REAL"

        return {
            "prediction": final,
            "vote_prediction": vote_pred,
            "fake_frame_ratio": round(fake_ratio * 100, 2),
            "average_fake_confidence": round(avg_fake * 100, 2),
            "top5_mean_fake": round(top5_mean * 100, 2),
            "max_fake_confidence": round(max_score * 100, 2),
            "frames_processed": len(fake_scores),
            "total_frames": frame_count,
            "average_ai_gen_score": round(float(np.mean(ai_gen_scores)) * 100, 2),
            **self._preview_payload(best_frame),
        }