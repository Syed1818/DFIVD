# Atheia — Deepfake & AI-Generated Media Detector

Atheia is a privacy-first deepfake detection platform that runs entirely on your local machine. Upload an image or video, and the system isolates facial regions, runs inference through a pre-trained EfficientNet classifier, and returns a deterministic verdict with confidence metrics.

## Features

- **Local-First**: All inference runs on your machine (GPU or CPU). No cloud calls, no data leaves your device.
- **Image & Video Support**: Synchronous analysis for images (up to 50MB); serialized background-threaded processing for videos (up to 500MB) with HTTP status polling.
- **Tri-State Forensic Output**: Deterministic 3-state verdict system: Authentic (`REAL`, green), Synthetic (`FAKE`, red), and Inconclusive (`UNDETERMINED`, amber) when faces are absent or obscured.
- **Live Telemetry Terminal**: A real-time terminal overlay shows processing logs, stage latency, and pipeline progress during analysis.
- **Animated Confidence Ring**: Results are visualized with an animated SVG ring and color-coded verdict badges.
- **Multi-Face Analysis**: Detects all visible subjects in a scene with centered square expansion, bounding box localization, and worst-case aggregation.
- **Drag & Drop Upload**: Drag files directly onto the upload zone with animated visual feedback.
- **Mobile-First UI**: Responsive bottom-sheet navigation, touch-optimized controls, safe-area padding, and adaptive typography across all breakpoints.
- **Advanced Metrics Dump**: Raw model output scores rendered in a monospace terminal-style panel.
- **Face Crop Preview**: When a face is detected, the isolated crop and annotated frame are displayed alongside the verdict.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Framer Motion (`motion/react`), Lucide Icons, React Router |
| **Backend** | FastAPI, PyTorch, OpenCV (Caffe SSD face detection) |
| **State** | React Context (`DetectionContext`) for global image/video analysis state |
| **Styling** | Dark glassmorphism design system with custom CSS tokens (`Space Grotesk`, `Syne`, `DM Mono`) |

## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.9+
- Model weights in `backend/models/` (download via `python backend/download_models.py`)

### Backend

```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Health check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

## Project Structure

```
deepfake-detector/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI endpoints, job lifecycle, CORS
│   │   └── detector.py      # Model loading, face detection, prediction
│   ├── models/               # .pth, .caffemodel weights (git-ignored)
│   ├── download_models.py    # Script to fetch model weights
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Route shell (React Router)
│   │   ├── main.jsx          # Entry point with DetectionProvider
│   │   ├── index.css         # Global tokens, Tailwind imports, resets
│   │   ├── context/
│   │   │   └── DetectionContext.jsx  # Global state for image/video analysis
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── ImageDetectionPage.jsx
│   │   │   ├── VideoDetectionPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── HowToUsePage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   └── TermsPrivacyPage.jsx
│   │   └── components/
│   │       ├── Navbar.jsx         # Desktop dock + mobile drawer
│   │       ├── Footer.jsx
│   │       ├── MouseFollower.jsx  # Custom cursor (desktop only)
│   │       ├── NeuronButton.jsx   # Particle-burst navigation button
│   │       ├── ContextMenu.jsx
│   │       └── backgrounds/       # Canvas/CSS animated backgrounds
│   └── package.json
├── AI_CONTEXT.md    # Agent handoff document
├── AGENTS.md        # Agent entry point
└── README.md
```

## API Contract

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Returns telemetry: `{ status, device, active_jobs, uptime_seconds }` |
| `/api/analyze` | POST | Accepts multipart `file` (up to 50MB img / 500MB vid). Images return completed result immediately. Videos return `{ job_id, status: "processing" }`. Returns HTTP 429 if queue is saturated (>10 active jobs). |
| `/api/status/{job_id}` | GET | Poll for video job status. Returns `{ job_id, status: "processing"|"done"|"error", result?, error? }`. |

## Developer Notes

For coding agents (Gemini, Claude, Copilot, etc.), read [AI_CONTEXT.md](AI_CONTEXT.md) and [AGENTS.md](AGENTS.md) before making changes.

## License

This project is for educational and research purposes.
