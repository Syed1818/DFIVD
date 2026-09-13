import { useEffect, useRef, useState } from "react";
import "./App.css";

const API = "/api";
const formatLabel = (value) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

async function readApiResponse(response) {
  const body = await response.text();
  let data = null;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = null;
  }
  if (!response.ok) {
    throw new Error(data?.detail || "Detector API is unavailable. Start the FastAPI backend on port 8000.");
  }
  return data;
}

function Stat({ label, value, accent = false }) {
  return <div className={`stat ${accent ? "stat-accent" : ""}`}><span>{label}</span><strong>{value}</strong></div>;
}

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [apiOnline, setApiOnline] = useState(false);
  const inputRef = useRef(null);
  const previewUrl = file ? URL.createObjectURL(file) : "";

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);
  useEffect(() => {
    fetch(`${API}/health`).then((response) => setApiOnline(response.ok)).catch(() => setApiOnline(false));
  }, []);

  const chooseFile = (nextFile) => {
    if (!nextFile || (!nextFile.type.startsWith("image/") && !nextFile.type.startsWith("video/"))) {
      setError("Choose an image or video file.");
      return;
    }
    setFile(nextFile);
    setResult(null);
    setError("");
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${API}/analyze`, { method: "POST", body: formData });
      const data = await readApiResponse(response);
      if (!data) throw new Error("Detector API returned an empty response.");
      if (data.status === "done") setResult(data.result);
      else {
        let status = data;
        while (status.status === "processing") {
          await new Promise((resolve) => setTimeout(resolve, 1800));
          status = await readApiResponse(await fetch(`${API}/status/${data.job_id}`));
        }
        if (status.status === "error") throw new Error(status.error || "Analysis failed.");
        setResult(status.result);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const isVideo = file?.type.startsWith("video/");
  const prediction = result?.prediction || "";
  const isFake = prediction.includes("FAKE");
  const confidence = result?.fake_confidence ?? result?.average_fake_confidence ?? result?.max_fake_confidence;
  const confidenceValue = confidence == null ? null : Number.parseFloat(String(confidence).replace("%", ""));
  const metrics = result ? Object.entries(result).filter(([key, value]) => typeof value === "number" && !key.includes("frame")) : [];

  return (
    <main className="app-shell">
      <header className="topbar"><div className="brand"><span className="brand-mark">DF</span><span>Signal / Vision Lab</span></div><span className="status-dot"><i className={apiOnline ? "" : "offline"} /> detector {apiOnline ? "online" : "offline"}</span></header>
      <section className="intro"><p className="eyebrow">Media forensics / 01</p><h1>Look closer.</h1><p className="lede">Inspect a face, frame by frame. Signal separates visual evidence from synthetic artifacts with a focused ensemble of models.</p></section>

      <section className="workspace">
        <div className="upload-column">
          <div className={`dropzone ${dragging ? "is-dragging" : ""} ${file ? "has-file" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}>
            <input ref={inputRef} type="file" accept="image/*,video/*" onChange={(event) => chooseFile(event.target.files[0])} />
            {file ? <><span className="file-kicker">selected media</span><strong>{file.name}</strong><span>{(file.size / 1024 / 1024).toFixed(2)} MB / {isVideo ? "video" : "image"}</span></> : <><span className="upload-glyph">+</span><strong>Drop media here</strong><span>or click to browse images and video</span></>}
          </div>
          <button className="analyze-button" onClick={analyze} disabled={!file || loading}><span>{loading ? "Reading the evidence" : "Analyze media"}</span><span className="arrow">↗</span></button>
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="preview-panel"><div className="panel-heading"><span>Input preview</span><span>{file ? "ready" : "waiting"}</span></div><div className="preview-stage">{file ? (isVideo ? <video src={previewUrl} controls /> : <img src={previewUrl} alt="Selected media preview" />) : <div className="empty-preview"><span>01</span><p>Your source preview<br />will appear here.</p></div>}</div></div>
      </section>

      {loading && <div className="progress-line"><span /><p>Scanning faces and comparing visual signals...</p></div>}
      {result && !result.error && <section className="results-section">
        <div className="section-heading"><div><p className="eyebrow">Analysis / complete</p><h2>Evidence report</h2></div><span className={`verdict-chip ${isFake ? "fake" : "real"}`}>{prediction}</span></div>
        <div className="result-grid">
          <div className="visual-card annotated-card"><div className="card-label"><span>Detected face / source frame</span><span className="live-indicator" /></div>{result.annotated_preview ? <img src={result.annotated_preview} alt="Source frame with detected face" /> : <div className="missing-media">No preview returned</div>}<small>{result.face_box ? `Box ${result.face_box.width} × ${result.face_box.height}px at (${result.face_box.x}, ${result.face_box.y})` : "Detection region"}</small></div>
          <div className="visual-card crop-card"><div className="card-label"><span>Face crop / model input</span><span>224 × 224</span></div>{result.face_crop ? <img src={result.face_crop} alt="Cropped detected face" /> : <div className="missing-media">No face crop returned</div>}<small>Expanded crop supplied to the ensemble</small></div>
          <div className="score-card"><div className="card-label"><span>Confidence readout</span><span>01</span></div><div className="score-ring" style={{ "--score": `${confidenceValue || 0}%` }}><strong>{confidenceValue == null ? "--" : confidenceValue}<small>%</small></strong></div><p>{isFake ? "Synthetic signal detected" : "No strong synthetic signal"}</p><span className="score-note">Combined model confidence</span></div>
        </div>
        <div className="metrics-row">{metrics.map(([key, value]) => <Stat key={key} label={formatLabel(key)} value={`${value}%`} accent={key.includes("fake") || key.includes("confidence")} />)}{result.frames_processed && <Stat label="Frames processed" value={`${result.frames_processed} / ${result.total_frames}`} />}</div>
      </section>}
      {result?.error && <p className="error-message result-error">{result.error}</p>}
      <footer><span>Signal / Vision Lab</span><span>Local analysis workspace</span></footer>
    </main>
  );
}