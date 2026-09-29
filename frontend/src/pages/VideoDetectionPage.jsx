import React, { useRef, useState, useCallback } from 'react';
import ParticleBackground from '../components/backgrounds/ParticleBackground';
import { UploadCloud, Film, CheckCircle, AlertTriangle, Play, RefreshCw, Activity, Terminal, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDetection } from '../context/DetectionContext';

const formatLabel = (value) => value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

// Animated confidence ring component
function ConfidenceRing({ value, isFake, size = 160 }) {
  const numericValue = parseFloat(value) || 0;
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (numericValue / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={isFake ? '#f87171' : '#34d399'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${isFake ? 'rgba(248,113,113,0.5)' : 'rgba(52,211,153,0.5)'})` }}
        />
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        className={`absolute text-4xl md:text-5xl font-display tracking-tighter font-bold ${
          isFake ? 'text-red-400' : 'text-emerald-400'
        }`}
      >
        {value}
      </motion.div>
    </div>
  );
}

export default function VideoDetectionPage() {
  const { videoState, setVideoFile, analyzeVideo, resetVideo } = useDetection();
  const { file, previewUrl, loading, progress, result, error, logs, apiOnline } = videoState;
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith('video')) {
      setVideoFile(dropped);
    }
  }, [setVideoFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const isFake = result?.prediction?.includes('FAKE');
  const confidenceValue = (result?.fake_confidence ?? result?.average_fake_confidence ?? result?.max_fake_confidence) || '0%';

  return (
    <>
      <ParticleBackground />
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
        className="relative z-10 w-full min-h-screen text-white font-sans pt-24 md:pt-40 px-4 md:px-6 lg:px-12 pb-28 md:pb-32"
      >
        <div className="max-w-[1400px] mx-auto flex flex-col gap-8 md:gap-12">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-[0.5px] border-white/20 pb-6 md:pb-8 gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-5xl font-display uppercase tracking-tighter mb-2">Video Scanner</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500">Temporal Sequence Analysis</p>
            </div>
            <motion.div 
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-3 border-[0.5px] border-white/10 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-[9px] uppercase tracking-widest font-bold">{apiOnline ? 'API Connected' : 'API Disconnected'}</span>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
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
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`h-[350px] md:h-[500px] border-[0.5px] border-dashed bg-black/40 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group rounded-sm relative overflow-hidden ${
                      isDragOver 
                        ? 'border-sky-400 bg-sky-500/10 scale-[1.02]' 
                        : 'border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <motion.div
                      animate={isDragOver ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                      transition={{ duration: 0.6, repeat: isDragOver ? Infinity : 0 }}
                    >
                      <UploadCloud className={`w-12 md:w-16 h-12 md:h-16 mb-6 md:mb-8 transition-colors duration-500 ${
                        isDragOver ? 'text-sky-400' : 'text-slate-600 group-hover:text-indigo-400'
                      }`} strokeWidth={1} />
                    </motion.div>
                    
                    <p className="text-lg md:text-xl font-display uppercase tracking-widest mb-3">
                      {isDragOver ? 'Drop to Analyze' : 'Upload Temporal Media'}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">MP4, AVI, MOV, MKV (Max 20MB)</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600 mt-3 md:hidden">Tap to select file</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-4 md:gap-6"
                  >
                    <div className="border-[0.5px] border-white/20 bg-black/50 p-1.5 md:p-2 relative overflow-hidden group rounded-sm">
                      <video src={previewUrl} controls={!loading} className={`w-full h-auto max-h-[350px] md:max-h-[500px] object-contain transition-all duration-700 ${loading ? 'opacity-30 blur-sm scale-105' : 'opacity-90 group-hover:scale-[1.02]'}`} />
                      
                      {/* Live Terminal Overlay during processing */}
                      <AnimatePresence>
                        {loading && (
                          <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 flex flex-col p-4 md:p-6 border-[0.5px] border-sky-500/50 backdrop-blur-md"
                          >
                            <div className="flex items-center gap-3 mb-4 md:mb-6 border-b-[0.5px] border-white/10 pb-3 md:pb-4">
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                                <Activity className="w-4 md:w-5 h-4 md:h-5 text-sky-400" strokeWidth={1.5} />
                              </motion.div>
                              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-sky-400">Live Telemetry</div>
                              <div className="ml-auto text-[10px] text-slate-500 font-mono">{progress}%</div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto font-mono text-[10px] md:text-[11px] leading-relaxed text-emerald-400 flex flex-col justify-end gap-1.5 md:gap-2 pb-4 md:pb-6">
                              {logs.map((log, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2 md:gap-3">
                                  <span className="text-slate-600 shrink-0">[{new Date().toISOString().split('T')[1].substring(0, 8)}]</span>
                                  <span className={log.includes('ERROR') ? 'text-red-500' : 'text-emerald-400'}>{log}</span>
                                </motion.div>
                              ))}
                              <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-3 bg-emerald-400 mt-1"></motion.div>
                            </div>

                            <div className="w-full h-[2px] bg-white/10 relative overflow-hidden mt-auto rounded-full">
                              <motion.div className="absolute top-0 left-0 h-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] rounded-full" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {!result && (
                      <div className="flex gap-3 md:gap-4">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={resetVideo} disabled={loading} className="px-4 md:px-6 py-3 md:py-4 border-[0.5px] border-white/20 bg-black hover:bg-white/10 transition-colors text-[10px] uppercase tracking-widest font-bold disabled:opacity-50 flex items-center justify-center gap-2 active:bg-white/20">
                          <RefreshCw className="w-3 h-3" /> Reselect
                        </motion.button>
                        <motion.button whileHover={!loading && apiOnline ? { scale: 1.02 } : {}} whileTap={!loading && apiOnline ? { scale: 0.98 } : {}} onClick={analyzeVideo} disabled={loading || !apiOnline} className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-white text-black hover:bg-slate-200 transition-colors text-[10px] uppercase tracking-[0.2em] font-bold disabled:opacity-50 flex items-center justify-center gap-3 active:bg-slate-300">
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                <Zap className="w-3 h-3" />
                              </motion.div>
                              Processing {progress}%
                            </span>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-black" /> Run Diagnostics
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}
                    
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-red-400 text-xs uppercase tracking-widest border border-red-500/50 bg-red-500/10 p-4 rounded-sm">
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
                  <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[300px] md:min-h-[500px] border-[0.5px] border-white/10 bg-black/40 flex flex-col items-center justify-center p-8 md:p-12 text-center text-slate-500 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Film className="w-10 md:w-12 h-10 md:h-12 mb-6 opacity-30 group-hover:opacity-60 transition-opacity duration-500" strokeWidth={0.5} />
                    </motion.div>
                    <p className="text-[10px] uppercase tracking-[0.3em]">Awaiting temporal sequence</p>
                  </motion.div>
                )}
                
                {result && (
                  <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className={`h-full border-[0.5px] p-6 md:p-8 bg-black/80 flex flex-col justify-between ${isFake ? 'border-red-500/50 shadow-[inset_0_0_80px_rgba(239,68,68,0.08)]' : 'border-emerald-500/50 shadow-[inset_0_0_80px_rgba(16,185,129,0.08)]'}`}>
                    <div>
                      <div className="flex justify-between items-center mb-8 md:mb-10 border-b-[0.5px] border-white/10 pb-4 md:pb-6">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Deterministic Output</h3>
                        {isFake ? (
                          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1.5 border-[0.5px] border-red-500/30 rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Synthetic</span>
                          </motion.div>
                        ) : (
                          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 border-[0.5px] border-emerald-500/30 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Authentic</span>
                          </motion.div>
                        )}
                      </div>
                      
                      {/* Confidence Ring */}
                      <div className="mb-8 md:mb-10 flex flex-col items-center">
                        <div className="text-[9px] uppercase tracking-[0.3em] text-slate-500 mb-5">Final Confidence Score</div>
                        <ConfidenceRing value={confidenceValue} isFake={isFake} size={typeof window !== 'undefined' && window.innerWidth < 768 ? 140 : 160} />
                      </div>
                      
                      {/* Metrics Dump */}
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="bg-black/90 border-[0.5px] border-white/10 p-4 md:p-5 mb-6 md:mb-8 font-mono text-xs overflow-x-auto shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] rounded-sm">
                        <div className="text-slate-500 mb-3 md:mb-4 uppercase tracking-widest text-[9px] border-b border-white/5 pb-2 md:pb-3 flex items-center gap-2">
                          <Terminal className="w-3 h-3" /> Advanced Metrics Dump
                        </div>
                        <div className="flex flex-col gap-1.5 md:gap-2">
                          {Object.entries(result)
                            .filter(([k]) => !['face_crop', 'annotated_preview'].includes(k))
                            .map(([k, v]) => (
                              <div key={k} className="flex justify-between items-center hover:bg-white/5 p-1 md:p-1.5 rounded transition-colors group">
                                <span className="text-slate-500 text-[9px] md:text-[10px] uppercase tracking-wider truncate group-hover:text-slate-300 transition-colors">{formatLabel(k)}</span>
                                <span className="text-sky-400 font-bold ml-4 text-[10px] md:text-xs shrink-0">
                                  {typeof v === 'number' && v.toFixed ? v.toFixed(3) : (typeof v === 'object' ? JSON.stringify(v) : String(v))}
                                </span>
                              </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* System Assessment */}
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-white/5 backdrop-blur-md border-[0.5px] border-white/10 p-5 md:p-6 relative overflow-hidden group rounded-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2.5s_infinite]"></div>
                        <h4 className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 font-bold flex items-center gap-2">
                          <Activity className="w-3 h-3" /> System Assessment
                        </h4>
                        <p className="text-[12px] md:text-[13px] text-slate-300 font-light leading-relaxed">
                          {isFake 
                            ? "High probability of synthetic manipulation detected in the temporal sequence. The neural network identified significant inter-frame inconsistencies and frequency domain anomalies consistent with generative AI tools or deepfake architectures."
                            : "No significant synthetic manipulation detected across the temporal sequence. Inter-frame stability, frequency distribution, and noise patterns are highly consistent with authentic optical capture."}
                        </p>
                      </motion.div>
                    </div>

                    <motion.button 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={resetVideo} 
                      className="mt-6 md:mt-8 w-full py-3 md:py-4 bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors text-[10px] uppercase tracking-widest font-bold border-[0.5px] border-white/20 flex items-center justify-center gap-2 rounded-sm"
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
