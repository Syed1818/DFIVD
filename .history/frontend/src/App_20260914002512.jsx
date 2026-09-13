import { useEffect, useRef, useState } from "react";
import "./App.css";

const API = "/api";
const formatLabel = (value) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

async function readApiResponse(response) {
  const body = await response.text();
  let data;
  try { data = body ? JSON.parse(body) : null; } catch { throw new Error("Detector API returned invalid JSON."); }
  if (!response.ok) throw new Error(data?.detail || "Detector API is unavailable. Start FastAPI on port 8000.");
  return data;
}

function useRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || "home");
  useEffect(() => {
    const onHashChange = () => { setRoute(window.location.hash.slice(1) || "home"); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return route;
}

function useReveal(route) {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [route]);
}

function Header({ apiOnline }) {
  const route = useRoute();
  const navigate = (path) => { window.location.hash = path; };
  return (
    <header className="site-header">
      <button className="brand" onClick={() => navigate("home")}><span className="brand-mark">VT</span><span>Vanta<span className="brand-slash">//</span>Trace</span></button>
      <nav className="main-nav" aria-label="Main navigation">
        {["home", "about", "contact", "image-detection", "video-detection"].map((item) => <button key={item} className={route === item ? "active" : ""} onClick={() => navigate(item)}>{item.replace("-", " ")}</button>)}
      </nav>
      <span className="status-dot"><i className={apiOnline ? "" : "offline"} /> {apiOnline ? "system online" : "api offline"}</span>
    </header>
  );
}

function Eyebrow({ children }) { return <p className="eyebrow"><span />{children}</p>; }
function SignalLine() { return <div className="signal-line"><span /><span /><span /><span /><span /><b /></div>; }

function Home({ navigate }) {
  return <>
    <section className="hero-page reveal">
      <div className="hero-copy"><Eyebrow>Independent media intelligence / 01</Eyebrow><h1>Know what<br /><em>you&apos;re</em> looking at.</h1><p>Signal is a forensic workspace for detecting synthetic faces, manipulated imagery, and AI-generated video before they become someone else&apos;s evidence.</p><div className="hero-actions"><button className="primary-button" onClick={() => navigate("image-detection")}>Start an analysis <span>↗</span></button><button className="text-button" onClick={() => navigate("about")}>How it works <span>→</span></button></div></div>
      <div className="hero-visual"><div className="reticle reticle-top">SCAN / 0001</div><div className="scan-frame"><div className="scan-core"><span className="core-cross">+</span><div className="core-wave" /></div><div className="scan-corner corner-a" /><div className="scan-corner corner-b" /><span className="scan-label label-a">VISUAL / SIGNAL</span><span className="scan-label label-b">LAT 51.5072 / ONLINE</span></div><div className="reticle reticle-bottom"><SignalLine /><span>confidence is earned, not assumed</span></div></div>
    </section>
    <section className="home-band reveal"><div><Eyebrow>Choose your input</Eyebrow><h2>Two ways in.<br /><em>One clear read.</em></h2></div><div className="mode-cards"><button className="mode-card" onClick={() => navigate("image-detection")}><span className="card-index">01</span><strong>Image detection</strong><p>Find face-level artifacts in a single frame.</p><span className="card-arrow">↗</span></button><button className="mode-card" onClick={() => navigate("video-detection")}><span className="card-index">02</span><strong>Video detection</strong><p>Sample motion over time and expose unstable signals.</p><span className="card-arrow">↗</span></button></div></section>
    <section className="system-strip"><span>SPATIAL MODEL / EFFICIENTNET-B0</span><span>FACE LOCALIZATION / RESNET-10</span><span>LOCAL-FIRST / NO CLOUD STORAGE</span></section>
  </>;
}

const team = [{ name: "Ari Okafor", role: "ML systems", code: "AO" }, { name: "Mina Chen", role: "Forensic research", code: "MC" }, { name: "Jon Bell", role: "Product + interface", code: "JB" }];

function About() {
  return <section className="content-page about-page"><div className="page-heading reveal"><Eyebrow>About VantaTrace / 02</Eyebrow><h1>Clarity in<br /><em>the noise.</em></h1><p>We build tools for the moment after instinct and before certainty. VantaTrace turns complex visual models into evidence that people can actually inspect.</p></div><div className="principles reveal"><article><span>01</span><h3>Evidence first</h3><p>Every read begins with the face, the frame, and the visible region that informed the model.</p></article><article><span>02</span><h3>Private by default</h3><p>Analysis runs locally in your workspace. Your media does not become our training set.</p></article><article><span>03</span><h3>Honest uncertainty</h3><p>Confidence is a signal, not a verdict. We show the ingredients behind the call.</p></article></div><div className="team-section reveal"><div className="section-heading"><div><Eyebrow>The people behind the trace / 03</Eyebrow><h2>A small, sharp team.</h2></div><span className="section-count">03 members</span></div><div className="team-grid">{team.map((person) => <article className="team-card" key={person.code}><div className="avatar-grid"><span>{person.code}</span><i /></div><h3>{person.name}</h3><p>{person.role}</p></article>)}</div></div></section>;
}

function Contact() {
  const [sent, setSent] = useState(false);
  return <section className="content-page contact-page"><div className="page-heading reveal"><Eyebrow>Contact / 04</Eyebrow><h1>Let&apos;s make<br /><em>the unseen</em><br />legible.</h1><p>Questions about an analysis, a research partnership, or building responsible media tooling? Send a signal.</p></div><div className="contact-layout reveal"><div className="contact-aside"><span>DIRECT CHANNEL</span><a href="mailto:hello@vantatrace.local">hello@vantatrace.local</a><span>RESPONSE WINDOW</span><p>Usually within<br />one working day.</p></div><form className="contact-form" onSubmit={(event) => { event.preventDefault(); setSent(true); }}><label>Name<input required placeholder="Your name" /></label><label>Email<input required type="email" placeholder="you@company.com" /></label><label>What can we help with?<textarea required rows="5" placeholder="Tell us what you are investigating..." /></label><button className="primary-button" type="submit">{sent ? "Message queued" : "Send message"} <span>↗</span></button></form></div></section>;
}

function Stat({ label, value, accent = false }) { return <div className={`stat ${accent ? "stat-accent" : ""}`}><span>{label}</span><strong>{value}</strong></div>; }

function DetectionPage({ mode, apiOnline }) {
  const isVideoMode = mode === "video";
  const [file, setFile] = useState(null); const [result, setResult] = useState(null); const [loading, setLoading] = useState(false); const [dragging, setDragging] = useState(false); const [error, setError] = useState(""); const [progress, setProgress] = useState(0);
  const inputRef = useRef(null); const previewUrl = file ? URL.createObjectURL(file) : "";
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);
  const chooseFile = (nextFile) => { const valid = nextFile && (isVideoMode ? nextFile.type.startsWith("video/") : nextFile.type.startsWith("image/")); if (!valid) { setError(`Choose a ${isVideoMode ? "video" : "image"} file.`); return; } setFile(nextFile); setResult(null); setError(""); };
  const estimatedSeconds = file ? (isVideoMode ? Math.max(20, Math.round((file.size / 1024 / 1024) * 18)) : 12) : 0;
  const analyze = async () => { if (!file) return; setLoading(true); setProgress(8); setResult(null); setError(""); const formData = new FormData(); formData.append("file", file); try { const data = await readApiResponse(await fetch(`${API}/analyze`, { method: "POST", body: formData })); if (data.status === "done") { setProgress(100); setResult(data.result); } else { let status = data; while (status.status === "processing") { await new Promise((resolve) => setTimeout(resolve, 1800)); setProgress((current) => Math.min(current + 14, 92)); status = await readApiResponse(await fetch(`${API}/status/${data.job_id}`)); } if (status.status === "error") throw new Error(status.error || "Analysis failed."); setProgress(100); setResult(status.result); } } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } };
  const prediction = result?.prediction || ""; const isFake = prediction.includes("FAKE"); const confidence = result?.fake_confidence ?? result?.average_fake_confidence ?? result?.max_fake_confidence; const confidenceValue = confidence == null ? null : Number.parseFloat(String(confidence).replace("%", "")); const metrics = result ? Object.entries(result).filter(([key, value]) => typeof value === "number" && !key.includes("frame")) : [];
  return <section className="content-page detection-page"><div className="page-heading detection-heading reveal"><Eyebrow>Forensic instrument / {isVideoMode ? "video" : "image"}</Eyebrow><h1>{isVideoMode ? <>Read the<br /><em>moving image.</em></> : <>Inspect the<br /><em>single frame.</em></>}</h1><p>{isVideoMode ? "Sample motion over time and find the moments where synthetic signals break continuity." : "Localize a face, inspect its crop, and compare the pixels against our visual signal models."}</p><span className={`api-badge ${apiOnline ? "" : "offline"}`}><i />{apiOnline ? "local api ready" : "local api offline"}</span></div><div className="detection-workspace reveal"><div className="upload-column"><div className={`dropzone ${dragging ? "is-dragging" : ""} ${file ? "has-file" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}><input ref={inputRef} type="file" accept={isVideoMode ? "video/*" : "image/*"} onChange={(event) => chooseFile(event.target.files[0])} />{file ? <><span className="file-kicker">selected {isVideoMode ? "video" : "image"}</span><strong>{file.name}</strong><span>{(file.size / 1024 / 1024).toFixed(2)} MB</span></> : <><span className="upload-glyph">+</span><strong>Drop {isVideoMode ? "video" : "image"} here</strong><span>or click to browse your local files</span></>}</div><button className="analyze-button" onClick={analyze} disabled={!file || loading || !apiOnline}><span>{loading ? "Reading the evidence" : apiOnline ? "Run detection" : "API unavailable"}</span><span className="arrow">↗</span></button>{error && <p className="error-message">{error}</p>}</div><div className="preview-panel"><div className="panel-heading"><span>Input preview</span><span>{file ? "ready" : "waiting"}</span></div><div className="preview-stage">{file ? (isVideoMode ? <video src={previewUrl} controls /> : <img src={previewUrl} alt="Selected media preview" />) : <div className="empty-preview"><span>INPUT / 00</span><p>Source media<br />appears here.</p></div>}</div></div></div>{loading && <div className="processing-console reveal"><div className="processing-top"><div><Eyebrow>Live processing</Eyebrow><h3>{isVideoMode ? "Sampling temporal signals" : "Reading facial structure"}</h3></div><strong>{progress}%</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><div className="processing-meta"><span>Estimated time / ~{estimatedSeconds}s</span><span>{isVideoMode ? "Frame sampling active" : "Face localization active"}</span></div><div className="processing-peek"><span className="peek-square" /><span className="peek-square" /><span className="peek-square active" /><span className="peek-square" /><p>building evidence map...</p></div></div>}{result && !result.error && <ResultPanel result={result} prediction={prediction} isFake={isFake} confidenceValue={confidenceValue} metrics={metrics} />}{result?.error && <p className="error-message result-error">{result.error}</p>}</section>;
}

function ResultPanel({ result, prediction, isFake, confidenceValue, metrics }) { return <section className="results-section reveal"><div className="section-heading"><div><Eyebrow>Analysis / complete</Eyebrow><h2>Evidence report</h2></div><span className={`verdict-chip ${isFake ? "fake" : "real"}`}>{prediction}</span></div><div className="result-grid"><div className="visual-card annotated-card"><div className="card-label"><span>Detected face / source frame</span><span className="live-indicator" /></div>{result.annotated_preview ? <img src={result.annotated_preview} alt="Source frame with detected face" /> : <div className="missing-media">No preview returned</div>}<small>{result.face_box ? `Box ${result.face_box.width} × ${result.face_box.height}px at (${result.face_box.x}, ${result.face_box.y})` : "Detection region"}</small></div><div className="visual-card crop-card"><div className="card-label"><span>Face crop / model input</span><span>224 × 224</span></div>{result.face_crop ? <img src={result.face_crop} alt="Cropped detected face" /> : <div className="missing-media">No face crop returned</div>}<small>Expanded crop supplied to the ensemble</small></div><div className="score-card"><div className="card-label"><span>Confidence readout</span><span>01</span></div><div className="score-ring" style={{ "--score": `${confidenceValue || 0}%` }}><strong>{confidenceValue == null ? "--" : confidenceValue}<small>%</small></strong></div><p>{isFake ? "Synthetic signal detected" : "No strong synthetic signal"}</p><span className="score-note">Combined model confidence</span></div></div><div className="metrics-row">{metrics.map(([key, value]) => <Stat key={key} label={formatLabel(key)} value={`${value}%`} accent={key.includes("fake") || key.includes("confidence")} />)}{result.frames_processed && <Stat label="Frames processed" value={`${result.frames_processed} / ${result.total_frames}`} />}</div></section>; }

export default function App() {
  const route = useRoute(); useReveal(route); const [apiOnline, setApiOnline] = useState(false);
  useEffect(() => { fetch(`${API}/health`).then((response) => setApiOnline(response.ok)).catch(() => setApiOnline(false)); }, []);
  const navigate = (path) => { window.location.hash = path; };
  let page = <Home navigate={navigate} />;
  if (route === "about") page = <About />; if (route === "contact") page = <Contact />; if (route === "image-detection") page = <DetectionPage mode="image" apiOnline={apiOnline} />; if (route === "video-detection") page = <DetectionPage mode="video" apiOnline={apiOnline} />;
  return <main className="app-shell"><div className="ambient-3d" aria-hidden="true"><div className="depth-plane" /><i /><i /><i /></div><Header apiOnline={apiOnline} />{page}<footer><span>VantaTrace</span><span>Local analysis workspace / 2026</span></footer></main>;
}
