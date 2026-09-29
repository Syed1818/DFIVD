# Atheia: Local-First Deepfake & AI Media Detector

Atheia is a powerful, privacy-first deepfake and AI-generated media detection tool. It runs entirely on your local machine, ensuring that sensitive media never leaves your device. 

The system leverages a hybrid model architecture, combining a lightweight spatial EfficientNet and the advanced DAViD Vision Transformer to accurately detect manipulations in both images and videos.

## Features

*   **Local-First Architecture**: No cloud APIs. All inference runs on your local GPU or CPU.
*   **Dual-Model Fusion**: Combines spatial anomaly detection with advanced temporal/vision-transformer features (DAViD) for high accuracy.
*   **Background Processing**: Upload a video, start the scan, and navigate around the application. The global state manager ensures the job continues in the background.
*   **Live Telemetry Terminal**: Watch the model work in real-time. Video processing streams live progress and log data via WebSockets to a sleek terminal UI.
*   **Premium Cyber-Security UI**: A futuristic, glassmorphic dashboard built with React 19, Vite 8, Tailwind CSS v4, and framer-motion.
*   **Advanced Metrics Dump**: View the raw deterministic output scores, bounding boxes, and AI-generated natural language summaries explaining the result.

## Architecture & Technology Stack

**Frontend**:
*   React 19 + Vite 8
*   Tailwind CSS v4 (Surrealist Design System)
*   Framer Motion (Animations)
*   Lucide React (Icons)
*   Global State via React Context

**Backend**:
*   FastAPI (Python)
*   PyTorch (Model Inference)
*   MTCNN + Caffe SSD (Robust Multi-Face Extraction & Alignment)
*   WebSockets (Live Telemetry Streaming)
*   Automated Eval Harness (EER, AUC, ECE)

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   Model Weights (Must be downloaded before starting)

### 1. Backend Setup

Navigate to the backend directory and install dependencies:
```powershell
cd backend
pip install -r requirements.txt
```

Start the FastAPI server:
```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Health check: `http://127.0.0.1:8000/api/health`*

### 2. Frontend Setup

In a new terminal, navigate to the frontend directory:
```powershell
cd frontend
npm install
```

Start the Vite development server:
```powershell
npm run dev -- --host 127.0.0.1
```

Open your browser to the local URL provided by Vite.

## Project Structure

*   `frontend/`: The React application UI and global context management.
*   `backend/app/main.py`: FastAPI endpoints and WebSocket lifecycle manager.
*   `backend/app/detector.py`: Core inference logic, face cropping, prediction fusion, and telemetry logging.
*   `backend/models/`: Directory for storing downloaded `.pth`, `.pt`, and `.caffemodel` files.

## Developer Notes

For a complete guide on how coding agents should interact with this repository, please read the [AI_CONTEXT.md](AI_CONTEXT.md) and [AGENTS.md](AGENTS.md) files.

## Evaluation & Testing

Run the adversarial evaluation harness to compute performance metrics (AUC, EER, ECE, F1) against compression artifacts:
```powershell
cd backend
python eval/run_eval.py
```

Run the API and Security test suite:
```powershell
cd backend
python -m pytest tests/test_main.py -v
```
