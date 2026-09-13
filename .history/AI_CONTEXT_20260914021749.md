# Atheia AI Handoff

This document is the shared project brief for Gemini, Claude, ChatGPT, GitHub Copilot, and other coding agents. Read it before exploring the repository.

## Product

Atheia is a local-first deepfake and AI-generated media detector. Users upload an image or video, the FastAPI service detects a face, runs the available model ensemble, and returns a verdict plus visual evidence.

## Repository Map

- `frontend/`: React 19 + Vite 8 application.
- `frontend/src/App.jsx`: route shell, upload workflow, API polling, result rendering, and shared page composition.
- `frontend/src/App.css`: visual system and page-level styles.
- `frontend/src/index.css`: global tokens, Tailwind 4/shadcn base imports, and global resets.
- `frontend/src/components/`: React Bits and Skiper UI components adapted for Vite.
- `backend/app/main.py`: FastAPI endpoints and job lifecycle.
- `backend/app/detector.py`: model loading, face crop, prediction, and preview serialization.
- `backend/download_models.py`: downloads optional/local model assets.
- `backend/models/`: downloaded model assets; do not commit large weights.

## Run Locally

Frontend:

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

Backend:

```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Health check: `http://127.0.0.1:8000/api/health`

The Vite proxy defaults to `http://127.0.0.1:8000`. Override it with `frontend/.env.local` and `VITE_API_URL` only when intentionally using another backend.

## API Contract

- `GET /api/health` returns `{ status, device }`.
- `POST /api/analyze` accepts multipart field `file`.
- Images return a completed job immediately.
- Videos return a job ID and require polling at `GET /api/status/{job_id}`.
- Results may include `prediction`, confidence metrics, `annotated_preview`, `face_crop`, and `face_box`.
- Frontend must handle non-JSON and unavailable API responses gracefully.

## UI Architecture

Routes are hash-based and currently include `home`, `about`, `contact`, `image-detection`, and `video-detection`.

The visual direction is dark, cinematic glassmorphism:

- Base interface: near-black and electric blue.
- REAL verdict: mint/green.
- FAKE or LIKELY FAKE verdict: coral/red.
- Do not recolor verdict states when changing the system theme.
- Detection pages own robot/judge visuals; landing and About own neural/neuron visuals.
- Use animation for hierarchy and feedback, not for decoration that harms readability.

## Agent Rules

- Preserve the local FastAPI contract and image/video behavior.
- Prefer existing React Bits, Skiper, Tailwind, and local CSS patterns before adding dependencies.
- Keep public components readable and split large surfaces when a change spans multiple responsibilities.
- Use `npm run lint` and `npm run build` after frontend changes.
- Check the browser for route transitions, mobile overflow, and result visibility.
- Do not commit model weights, cache directories, or generated `dist/` output.
- Do not replace user changes without inspecting the current file first.

## Known Runtime Notes

- DAViD checkpoints are optional locally; the backend can fall back to the spatial detector.
- Browser-extension warnings about patching `window.location` are external to Atheia.
- If Vite reports stale HMR or Motion hook errors, stop the old dev server, remove `frontend/node_modules/.vite`, and restart once.
