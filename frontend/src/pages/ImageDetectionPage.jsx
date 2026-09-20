import React, { useState, useRef, useEffect } from 'react';
import ParticleBackground from '../components/backgrounds/ParticleBackground';

const API = "http://localhost:8000/api";
const formatLabel = (value) => value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

async function readApiResponse(response) {
  const body = await response.text();
  let data;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    throw new Error("Detector API returned invalid JSON.");
  }
  if (!response.ok) throw new Error(data?.detail || "API unavailable.");
  return data;
}

export default function ImageDetectionPage() {
  const [apiOnline, setApiOnline] = useState(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const previewUrl = file ? URL.createObjectURL(file) : "";
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  useEffect(() => {
    fetch(`${API}/health`).then(res => setApiOnline(res.ok)).catch(() => setApiOnline(false));
  }, []);

  const handleFileSelect = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      if (!selected.type.startsWith('image')) {
        setError("Please upload an image file (JPG, PNG, etc.)");
        return;
      }
      setFile(selected);
      setResult(null);
      setError("");
    }
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setProgress(10); setResult(null); setError("");
    const formData = new FormData(); formData.append("file", file);
    try {
      const data = await readApiResponse(await fetch(`${API}/analyze`, { method: "POST", body: formData }));
      if (data.status === "done") {
        setProgress(100); setResult(data.result);
      } else {
        let status = data;
        while (status.status === "processing") {
          await new Promise(r => setTimeout(r, 1800));
          setProgress(c => Math.min(c + 15, 95));
          status = await readApiResponse(await fetch(`${API}/status/${data.job_id}`));
        }
        if (status.status === "error") throw new Error(status.error || "Analysis failed.");
        setProgress(100); setResult(status.result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFake = result?.prediction?.includes('FAKE');

  return (
    <>
      <ParticleBackground />
      <div className="relative z-10 w-full min-h-screen text-slate-100 font-sans tracking-wide pt-28 px-4 pb-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          
          <div className="flex justify-between items-center bg-slate-900/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5">
            <h1 className="text-2xl font-bold tracking-widest text-sky-400 m-0">IMAGE SCANNER</h1>
            <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/5">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className="text-xs uppercase tracking-widest font-semibold">{apiOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
            {!file ? (
              <div onClick={() => inputRef.current?.click()} className="group border border-dashed border-slate-600/50 bg-slate-800/20 rounded-2xl p-20 cursor-pointer text-center hover:bg-sky-900/20 hover:border-sky-500/50 transition-all">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📸</div>
                <p className="text-xl font-light">Select Image for Forensic Analysis</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                  <div className="bg-black/50 rounded-xl overflow-hidden ring-1 ring-white/10 p-2">
                    <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[40vh] object-contain rounded-lg" />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setFile(null)} className="flex-1 bg-slate-800/50 text-slate-300 py-3 rounded-lg text-sm uppercase tracking-widest font-bold hover:bg-slate-700 transition-colors border border-white/5">Reselect</button>
                    <button onClick={analyze} disabled={loading || !apiOnline} className="flex-1 relative overflow-hidden bg-sky-600 hover:bg-sky-500 text-white py-3 rounded-lg text-sm uppercase tracking-widest font-bold transition-colors shadow-[0_0_15px_rgba(14,165,233,0.4)] disabled:opacity-50">
                      <span className="relative z-10">{loading ? 'Scanning...' : 'Analyze Image'}</span>
                      {loading && <div className="absolute bottom-0 left-0 h-1 bg-sky-300" style={{ width: `${progress}%` }}></div>}
                    </button>
                  </div>
                  {error && <div className="text-red-300 bg-red-900/30 p-3 rounded-lg text-sm border border-red-500/30 text-center">{error}</div>}
                </div>
                
                <div className="w-full md:w-1/2">
                  {!result && !loading && (
                    <div className="h-full flex items-center justify-center min-h-[300px] border border-dashed border-slate-700 rounded-xl bg-slate-800/10 text-slate-500 font-light text-center p-6">
                      Awaiting analysis initiation...
                    </div>
                  )}
                  {loading && (
                    <div className="h-full flex flex-col items-center justify-center min-h-[300px] bg-slate-800/30 rounded-xl border border-sky-500/30 animate-pulse">
                      <div className="text-4xl mb-4 animate-spin">⚙️</div>
                      <div className="text-sky-400 uppercase tracking-widest text-sm font-bold">Processing Neural Layers</div>
                      <div className="text-slate-400 text-xs mt-2">{progress}% Complete</div>
                    </div>
                  )}
                  {result && (
                    <div className={`p-6 rounded-xl border bg-slate-900/80 ${isFake ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]'}`}>
                      <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-4 flex justify-between">
                        Detection Output
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isFake ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {isFake ? 'SYNTHETIC' : 'AUTHENTIC'}
                        </span>
                      </h3>
                      
                      <div className="text-5xl font-black mb-6">
                        {((result.fake_confidence ?? result.average_fake_confidence ?? result.max_fake_confidence) || '0%')}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {Object.entries(result).filter(([k, v]) => typeof v === 'number').map(([k, v]) => (
                          <div key={k} className="bg-white/5 p-3 rounded-lg">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 truncate">{formatLabel(k)}</div>
                            <div className="font-mono text-sm">{v.toFixed ? v.toFixed(3) : v}</div>
                          </div>
                        ))}
                      </div>

                      {result.annotated_preview && (
                        <div>
                          <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Forensic Heatmap</div>
                          <img src={result.annotated_preview} alt="Heatmap" className="w-full rounded-lg border border-slate-700" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>

          {/* New Informational Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-10">
            <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold mb-4 text-sky-400">Forensic Analysis Protocol</h3>
              <p className="text-slate-300 font-light text-sm leading-relaxed mb-4">
                The ATHEIA Image Scanner processes standard formats (JPEG, PNG, WEBP) through a pipeline of neural networks specifically trained to identify mesoscopic artifacts left by GANs and diffusion models.
              </p>
              <ul className="text-slate-400 font-light text-xs space-y-2 list-disc list-inside">
                <li>Analyzes pixel-level blending inconsistencies.</li>
                <li>Evaluates frequency domain anomalies.</li>
                <li>Highlights regions of high synthetic probability via heatmaps.</li>
              </ul>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold mb-4 text-sky-400">Privacy Guarantee</h3>
              <p className="text-slate-300 font-light text-sm leading-relaxed mb-4">
                We employ a strict zero-retention policy for all uploaded media.
              </p>
              <ul className="text-slate-400 font-light text-xs space-y-2 list-disc list-inside">
                <li>Images are processed entirely in volatile memory.</li>
                <li>No files are saved to disk or persistent storage.</li>
                <li>Once the probability matrix is returned, data is purged.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
