# Agent Entry Point

Use [AI_CONTEXT.md](AI_CONTEXT.md) as the shared handoff for Gemini, Claude, ChatGPT, GitHub Copilot, and other coding agents working on Atheia.

Before editing, read the product map, local run commands, API contract, UI rules, and validation requirements there.

**Current State:**
- The backend uses the original `origin/main` detector (`detector.py`) with EfficientNet + Caffe SSD face detection.
- Video analysis uses background threads with HTTP polling (`/api/status/{job_id}`). There are no WebSockets.
- The frontend uses React Context (`DetectionContext.jsx`) for global state — not a `useAnalyze` hook.
- The Navbar is a desktop dock + mobile bottom-sheet drawer (not a traditional top bar).
- Detection pages include drag-and-drop upload, animated SVG confidence rings, and face crop previews.
- `cursor: none` is scoped to `@media (hover: hover)` so mobile devices retain their native cursor.
- Experimental files (`ensemble.py`, `calibration.py`, `eval/`, `tests/`) have been removed from the working tree.
- Run `npm run build` after any frontend change to validate.
