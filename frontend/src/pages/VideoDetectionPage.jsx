import React, { useRef } from 'react';
import ParticleBackground from '../components/backgrounds/ParticleBackground';
import { UploadCloud, Film, CheckCircle, AlertTriangle, Play, RefreshCw, Activity, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDetection } from '../context/DetectionContext';

const formatLabel = (value) => value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

export default function VideoDetectionPage() {
  const { videoState, setVideoFile, analyzeVideo, resetVideo } = useDetection();
  const { file, previewUrl, loading, progress, result, error, logs, apiOnline } = videoState;
  const inputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      if (!selected.type.startsWith('video')) {
        alert("Please upload a video file (MP4, AVI, etc.)");
        return;
      }
      setVideoFile(selected);
    }
  };

  const isFake = result?.prediction?.includes('FAKE');

  return (
    <>
      <ParticleBackground />
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
        className="relative z-10 w-full min-h-screen text-white font-sans pt-40 px-6 lg:px-12 pb-32"
      >
        <div className="max-w-[1400px] mx-auto flex flex-col gap-12">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-[0.5px] border-white/20 pb-8 gap-4"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tighter mb-2">Video Scanner</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500">Temporal Sequence Analysis</p>
            </div>
            <div className="flex items-center gap-3 border-[0.5px] border-white/10 px-4 py-2 bg-black/50 backdrop-blur-md">
              <span className={`w-1.5 h-1.5 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-[9px] uppercase tracking-widest font-bold">{apiOnline ? 'API Connected' : 'API Disconnected'}</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Input Section */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7"
            >
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div 
                    key="upload"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => inputRef.current?.click()} 
                    className="h-[500px] border-[0.5px] border-white/20 border-dashed bg-black/40 hover:bg-white/5 transition-colors flex flex-col items-center justify-center cursor-pointer group rounded-sm relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <UploadCloud className="w-16 h-16 text-slate-600 mb-8 group-hover:text-indigo-400 transition-colors duration-500" strokeWidth={1} />
                    <p className="text-xl font-display uppercase tracking-widest mb-3">Upload Temporal Media</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">MP4, AVI, MOV, MKV (Max 20MB)</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="border-[0.5px] border-white/20 bg-black/50 p-2 relative overflow-hidden group rounded-sm">
                      <video src={previewUrl} controls={!loading} className={`w-full h-auto max-h-[500px] object-contain transition-all duration-700 ${loading ? 'opacity-30 blur-sm scale-105' : 'opacity-90 group-hover:scale-105'}`} />
                      
                      {/* Live Terminal Overlay during processing */}
                      <AnimatePresence>
                        {loading && (
                          <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 flex flex-col p-6 border-[0.5px] border-sky-500/50 backdrop-blur-md"
                          >
                            <div className="flex items-center gap-3 mb-6 border-b-[0.5px] border-white/10 pb-4">
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                                <Activity className="w-5 h-5 text-sky-400" strokeWidth={1.5} />
                              </motion.div>
                              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-sky-400">Live Telemetry</div>
                              <div className="ml-auto text-[10px] text-slate-500 font-mono">{progress}%</div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed text-emerald-400 flex flex-col justify-end gap-2 pb-6">
                              {logs.map((log, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                                  <span className="text-slate-600">[{new Date().toISOString().split('T')[1].substring(0, 8)}]</span>
                                  <span className={log.includes('ERROR') ? 'text-red-500' : 'text-emerald-400'}>{log}</span>
                                </motion.div>
                              ))}
                              {/* Blinking cursor */}
                              <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-3 bg-emerald-400 mt-1"></motion.div>
                            </div>

                            <div className="w-full h-[1px] bg-white/10 relative overflow-hidden mt-auto">
                              <motion.div className="absolute top-0 left-0 h-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {!result && (
                      <div className="flex gap-4">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={resetVideo} disabled={loading} className="px-6 py-4 border-[0.5px] border-white/20 bg-black hover:bg-white/10 transition-colors text-[10px] uppercase tracking-widest font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                          <RefreshCw className="w-3 h-3" /> Reselect
                        </motion.button>
                        <motion.button whileHover={!loading && apiOnline ? { scale: 1.02 } : {}} whileTap={!loading && apiOnline ? { scale: 0.98 } : {}} onClick={analyzeVideo} disabled={loading || !apiOnline} className="flex-1 px-6 py-4 bg-white text-black hover:bg-slate-200 transition-colors text-[10px] uppercase tracking-[0.2em] font-bold disabled:opacity-50 flex items-center justify-center gap-3">
                          {loading ? (
                            <span>Processing {progress}%</span>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-black" /> Run Diagnostics
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}
                    
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
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-5"
            >
              <AnimatePresence mode="wait">
                {!result && !loading && (
                  <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[500px] border-[0.5px] border-white/10 bg-black/40 flex flex-col items-center justify-center p-12 text-center text-slate-500 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <Film className="w-12 h-12 mb-6 opacity-30 group-hover:opacity-60 transition-opacity duration-500" strokeWidth={0.5} />
                    <p className="text-[10px] uppercase tracking-[0.3em]">Awaiting temporal sequence</p>
                  </motion.div>
                )}
                
                {result && (
                  <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className={`h-full border-[0.5px] p-8 bg-black/80 flex flex-col justify-between ${isFake ? 'border-red-500/50 shadow-[inset_0_0_80px_rgba(239,68,68,0.08)]' : 'border-emerald-500/50 shadow-[inset_0_0_80px_rgba(16,185,129,0.08)]'}`}>
                    <div>
                      <div className="flex justify-between items-center mb-10 border-b-[0.5px] border-white/10 pb-6">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Deterministic Output</h3>
                        {isFake ? (
                          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1.5 border-[0.5px] border-red-500/30">
                            <AlertTriangle className="w-4 h-4 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Synthetic</span>
                          </motion.div>
                        ) : (
                          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 border-[0.5px] border-emerald-500/30">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Authentic</span>
                          </motion.div>
                        )}
                      </div>
                      
                      <div className="mb-10 text-center">
                        <div className="text-[9px] uppercase tracking-[0.3em] text-slate-500 mb-4">Final Confidence Score</div>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className={`text-7xl md:text-8xl font-display tracking-tighter ${isFake ? 'text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}>
                          {((result.fake_confidence ?? result.average_fake_confidence ?? result.max_fake_confidence) || '0%')}
                        </motion.div>
                      </div>
                      
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="bg-black/90 border-[0.5px] border-white/10 p-5 mb-8 font-mono text-xs overflow-x-auto shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                        <div className="text-slate-500 mb-4 uppercase tracking-widest text-[9px] border-b border-white/5 pb-3 flex items-center gap-2">
                          <Terminal className="w-3 h-3" /> Advanced Metrics Dump
                        </div>
                        <div className="flex flex-col gap-2">
                          {Object.entries(result)
                            .filter(([k, v]) => !['face_crop', 'annotated_preview'].includes(k))
                            .map(([k, v]) => (
                              <div key={k} className="flex justify-between items-center hover:bg-white/5 p-1.5 rounded transition-colors group">
                                <span className="text-slate-500 text-[10px] uppercase tracking-wider truncate group-hover:text-slate-300 transition-colors">{formatLabel(k)}</span>
                                <span className="text-sky-400 font-bold ml-4">
                                  {typeof v === 'number' && v.toFixed ? v.toFixed(3) : (typeof v === 'object' ? JSON.stringify(v) : String(v))}
                                </span>
                              </div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-white/5 backdrop-blur-md border-[0.5px] border-white/10 p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2.5s_infinite]"></div>
                        <h4 className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 font-bold flex items-center gap-2">
                          <Activity className="w-3 h-3" /> System Assessment
                        </h4>
                        <p className="text-[13px] text-slate-300 font-light leading-relaxed">
                          {isFake 
                            ? "High probability of synthetic manipulation detected in the temporal sequence. The neural network identified significant inter-frame inconsistencies and frequency domain anomalies consistent with generative AI tools or deepfake architectures."
                            : "No significant synthetic manipulation detected across the temporal sequence. Inter-frame stability, frequency distribution, and noise patterns are highly consistent with authentic optical capture."}
                        </p>
                      </motion.div>
                    </div>

                    <motion.button 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                      onClick={resetVideo} 
                      className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 transition-colors text-[10px] uppercase tracking-widest font-bold border-[0.5px] border-white/20 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset Scan
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            <input ref={inputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
          </div>

        </div>
      </motion.div>
    </>
  );
}
