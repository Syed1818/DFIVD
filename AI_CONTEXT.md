# Atheia AI Handoff

This document is the shared project brief for Gemini, Claude, ChatGPT, GitHub Copilot, and other coding agents. Read it before exploring the repository.

## Product

Atheia is a local-first deepfake and AI-generated media detector. Users upload an image or video, the FastAPI service detects a face via Caffe SSD, runs an EfficientNet classifier, and returns a verdict with confidence metrics and a face crop.

## Repository Map

- `frontend/`: React 19 + Vite 8 application.
- `frontend/src/App.jsx`: Route shell using `react-router-dom` with `BrowserRouter`.
- `frontend/src/context/DetectionContext.jsx`: Global state provider for image and video analysis (file selection, API calls, polling, results).
- `frontend/src/index.css`: Global tokens, Tailwind 4 base imports, font imports, and mobile-safe cursor rules.
- `frontend/src/pages/`: Page components — `LandingPage`, `ImageDetectionPage`, `VideoDetectionPage`, `AboutPage`, `HowToUsePage`, `ContactPage`, `TermsPrivacyPage`.
- `frontend/src/components/Navbar.jsx`: Desktop floating dock + mobile FAB with animated bottom-sheet drawer.
- `frontend/src/components/backgrounds/`: Animated background components (Brain, Particle, Grid, Geometry, Space, Ripple, DataStream).
- `backend/app/main.py`: FastAPI endpoints and job lifecycle.
- `backend/app/detector.py`: Model loading, Caffe SSD face detection, EfficientNet prediction, preview serialization.
- `backend/download_models.py`: Downloads model weights to `backend/models/`.
- `backend/models/`: Model weights (`.pth`, `.caffemodel`, `.prototxt`). Do not commit large files.

## Run Locally

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Backend:

```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Health check: `http://127.0.0.1:8000/api/health`

The frontend `DetectionContext` hardcodes `http://localhost:8000/api` as the API base. Override with `frontend/.env` and `VITE_API_URL` only when using another backend.

## API Contract

- `GET /api/health` → `{ status, device }`.
- `POST /api/analyze` accepts multipart field `file`.
  - **Images**: Return a completed `JobStatus` immediately with `status: "done"` and `result`.
  - **Videos**: Return `{ job_id, status: "processing" }`. The frontend polls `GET /api/status/{job_id}` every 2 seconds until `status` becomes `"done"` or `"error"`.
- `GET /api/status/{job_id}` → `{ job_id, status, result?, error? }`.
- Results include: `prediction` (string), `fake_confidence` (string like "87.3%"), `face_crop` (base64 JPEG), `face_box` (coordinates), and additional model-specific fields.
- There are **no WebSockets** in the current backend. Video status is HTTP-polled.

## UI Architecture

Routes use `BrowserRouter` (path-based, not hash-based):

| Path | Page | Background |
|------|------|-----------|
| `/` | LandingPage | BrainBackground |
| `/image-detection` | ImageDetectionPage | ParticleBackground |
| `/video-detection` | VideoDetectionPage | ParticleBackground |
| `/about` | AboutPage | GeometryBackground |
| `/how-to-use` | HowToUsePage | GridBackground |
| `/contact` | ContactPage | SpaceBackground |
| `/terms-privacy` | TermsPrivacyPage | SpaceBackground |

### Design System

- Dark, cinematic glassmorphism. Base: near-black `#05070c`. Accent: electric blue `#55b9ff`.
- REAL verdict: emerald/green (`#34d399`). FAKE verdict: red (`#f87171`).
- Verdict colors are hardcoded and must not change with themes.
- Fonts: `Space Grotesk` (body), `Syne` (display/headings), `DM Mono` (terminal/code).
- Custom cursor (`MouseFollower.jsx`) is desktop-only, gated by `@media (hover: hover) and (pointer: fine)`.

### Detection Page UX

- Upload zone supports both click-to-select and drag-and-drop with animated visual feedback.
- Processing shows a "Live Telemetry Terminal" overlay with streaming logs and a progress bar.
- Results display an animated SVG confidence ring, verdict badge (rounded pill), face crop preview, terminal-style metrics dump, and a natural-language system assessment.
- All elements are responsive: smaller sizes, tighter padding, and touch-friendly (`active:`) states on mobile.

### Navigation

- **Desktop**: Floating dock at `bottom-6` center with icon buttons, hover tooltips, and `layoutId` active indicator.
- **Mobile**: FAB (floating action button) at bottom-right opens a full-width bottom-sheet drawer with 3-column icon grid. Closes on route change or backdrop tap.

## Agent Rules

- Preserve the local FastAPI contract. Images are synchronous; videos use background threads + HTTP polling.
- Do not add WebSockets — the current architecture uses `GET /api/status/{job_id}` polling.
- Prefer existing Tailwind utility classes and local CSS variables over adding new dependencies.
- Keep components focused. Split large files when a change spans multiple responsibilities.
- Run `npm run build` after frontend changes to catch compilation errors.
- Test across breakpoints: mobile (375px), tablet (768px), and desktop (1400px).
- Do not commit model weights, `__pycache__`, `node_modules`, or `dist/`.
- Do not replace user changes without inspecting the current file first.

## Known Runtime Notes

- DAViD checkpoints are optional; the backend falls back to the spatial EfficientNet detector.
- Browser-extension warnings about `window.location` patching are external to Atheia.
- If Vite reports stale HMR or Motion hook errors, stop the dev server, delete `frontend/node_modules/.vite`, and restart.
- The production bundle is ~1.4 MB (gzipped ~380 KB). Consider code-splitting with dynamic `import()` if this grows.
