import React, { useState, useRef, useEffect } from 'react';
import DataStreamBackground from '../components/backgrounds/DataStreamBackground';
import { UploadCloud, Film, CheckCircle, AlertTriangle, Play, RefreshCw, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

export default function VideoDetectionPage() {
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
      if (!selected.type.startsWith('video')) {
        setError("Please upload a video file (MP4, MOV, etc.)");
        return;
      }
      setFile(selected);
      setResult(null);
      setError("");
    }
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setProgress(5); setResult(null); setError("");
    const formData = new FormData(); formData.append("file", file);
    try {
      const data = await readApiResponse(await fetch(`${API}/analyze`, { method: "POST", body: formData }));
      if (data.status === "done") {
        setProgress(100); setResult(data.result);
      } else {
        let status = data;
        while (status.status === "processing") {
          await new Promise(r => setTimeout(r, 1800));
          setProgress(c => Math.min(c + 8, 98));
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
      <DataStreamBackground />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full min-h-screen text-white font-sans pt-40 px-6 lg:px-12 pb-32"
      >
        <div className="max-w-[1400px] mx-auto flex flex-col gap-12">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-[0.5px] border-white/20 pb-8 gap-4"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tighter mb-2">Video Scanner</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500">Temporal Sequence Analysis</p>
            </div>
            <div className="flex items-center gap-3 border-[0.5px] border-white/10 px-4 py-2 bg-black/50">
              <span className={`w-1.5 h-1.5 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-[9px] uppercase tracking-widest font-bold">{apiOnline ? 'API Connected' : 'API Disconnected'}</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Input Section */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7"
            >
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div 
                    key="upload"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => inputRef.current?.click()} 
                    className="h-[400px] border-[0.5px] border-white/20 border-dashed bg-black/40 hover:bg-white/5 transition-colors flex flex-col items-center justify-center cursor-pointer group"
                  >
                    <UploadCloud className="w-12 h-12 text-slate-500 mb-6 group-hover:text-white transition-colors" strokeWidth={1} />
                    <p className="text-lg font-display uppercase tracking-widest mb-2">Select Video Media</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">MP4, MOV, AVI</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="border-[0.5px] border-white/20 bg-black/50 p-2 relative overflow-hidden group">
                      <video src={previewUrl} controls className="w-full h-auto max-h-[500px] object-contain opacity-80 mix-blend-screen transition-transform duration-700 group-hover:scale-105" />
                      <AnimatePresence>
                        {loading && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center border-[0.5px] border-indigo-500/50 backdrop-blur-sm"
                          >
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                              <Activity className="w-8 h-8 text-indigo-400 mb-4" strokeWidth={1.5} />
                            </motion.div>
                            <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-indigo-400 mb-2">Extracting Frames</div>
                            <div className="w-48 h-0.5 bg-white/10 relative overflow-hidden">
                              <motion.div className="absolute top-0 left-0 h-full bg-indigo-400" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="flex gap-4">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFile(null)} disabled={loading} className="px-6 py-4 border-[0.5px] border-white/20 bg-black hover:bg-white/10 transition-colors text-[10px] uppercase tracking-widest font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                        <RefreshCw className="w-3 h-3" /> Reselect
                      </motion.button>
                      <motion.button whileHover={!loading && apiOnline ? { scale: 1.02 } : {}} whileTap={!loading && apiOnline ? { scale: 0.98 } : {}} onClick={analyze} disabled={loading || !apiOnline} className="flex-1 px-6 py-4 bg-white text-black hover:bg-slate-200 transition-colors text-[10px] uppercase tracking-[0.2em] font-bold disabled:opacity-50 flex items-center justify-center gap-3">
                        {loading ? (
                          <span>Processing {progress}%</span>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-black" /> Run Diagnostics
                          </>
                        )}
                      </motion.button>
                    </div>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-red-400 text-xs uppercase tracking-widest border border-red-500/50 bg-red-500/10 p-4">
                        {error}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Output Section */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-5"
            >
              <AnimatePresence mode="wait">
                {!result && !loading && (
                  <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[400px] border-[0.5px] border-white/10 bg-black/40 flex flex-col items-center justify-center p-12 text-center text-slate-500">
                    <Film className="w-8 h-8 mb-6 opacity-50" strokeWidth={1} />
                    <p className="text-[10px] uppercase tracking-[0.2em]">Awaiting input stream</p>
                  </motion.div>
                )}
                
                {result && (
                  <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className={`h-full border-[0.5px] p-8 bg-black/80 flex flex-col justify-between ${isFake ? 'border-red-500/50 shadow-[inset_0_0_50px_rgba(239,68,68,0.05)]' : 'border-emerald-500/50 shadow-[inset_0_0_50px_rgba(16,185,129,0.05)]'}`}>
                    <div>
                      <div className="flex justify-between items-center mb-12 border-b-[0.5px] border-white/10 pb-6">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Temporal Output</h3>
                        {isFake ? (
                          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="w-4 h-4 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Synthetic</span>
                          </motion.div>
                        ) : (
                          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Authentic</span>
                          </motion.div>
                        )}
                      </div>
                      
                      <div className="mb-12">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Confidence Score</div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-6xl md:text-7xl font-display tracking-tighter">
                          {((result.fake_confidence ?? result.average_fake_confidence ?? result.max_fake_confidence) || '0%')}
                        </motion.div>
                      </div>
                      
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 gap-px bg-white/10 border-[0.5px] border-white/10 mb-8">
                        {Object.entries(result).filter(([k, v]) => typeof v === 'number').map(([k, v], i) => (
                          <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + (i * 0.1) }} className="bg-black p-4">
                            <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-2 truncate">{formatLabel(k)}</div>
                            <div className="font-mono text-sm">{v.toFixed ? v.toFixed(3) : v}</div>
                          </motion.div>
                        ))}
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-white/5 backdrop-blur-md border-[0.5px] border-white/10 p-5 mb-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite]"></div>
                        <h4 className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold flex items-center gap-2">
                          <Activity className="w-3 h-3" /> System Assessment
                        </h4>
                        <p className="text-[13px] text-slate-300 font-light leading-relaxed">
                          {isFake 
                            ? "High probability of synthetic manipulation detected across multiple temporal frames. The engine identified significant inter-frame inconsistencies and spatial artifacts consistent with generative AI video models or deepfake face-swapping techniques."
                            : "No significant synthetic manipulation detected temporally. The frame-by-frame progression, lighting consistency, and spatial layout are highly consistent with authentic optical capture. While no AI intervention is mathematically evident, always corroborate with source verification protocols."}
                        </p>
                      </motion.div>
                    </div>

                    {result.face_crop && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 border-t-[0.5px] border-white/10 pt-8">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-4">Flagged Subject Extraction</div>
                        <img src={result.face_crop} alt="Face crop" className="w-full max-h-32 object-contain bg-black border-[0.5px] border-white/20 p-2 opacity-80 mix-blend-screen" />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            <input ref={inputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
          </div>

          {/* Documentation Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-0 border-[0.5px] border-white/10 bg-black/60 backdrop-blur-md mt-12"
          >
            <div className="p-10 border-b md:border-b-0 md:border-r-[0.5px] border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Temporal Analysis Engine</h3>
              <ul className="text-slate-400 font-light text-[13px] space-y-4">
                <li className="flex gap-4"><span className="text-white w-4">01</span> Max file size: 100 MB. Max length: 60 seconds.</li>
                <li className="flex gap-4"><span className="text-white w-4">02</span> Aggregates frame-level confidence into global probability.</li>
                <li className="flex gap-4"><span className="text-white w-4">03</span> Isolates the subject's face where manipulation is most likely.</li>
              </ul>
            </div>
            <div className="p-10">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Privacy Guarantee</h3>
              <ul className="text-slate-400 font-light text-[13px] space-y-4">
                <li className="flex gap-4"><span className="text-white w-4">01</span> Videos are processed entirely in volatile memory.</li>
                <li className="flex gap-4"><span className="text-white w-4">02</span> No files are saved to disk or persistent storage.</li>
                <li className="flex gap-4"><span className="text-white w-4">03</span> Once the temporal probability is returned, data is purged.</li>
              </ul>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </>
  );
}
