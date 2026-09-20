import React from 'react';
import { Link } from 'react-router-dom';
import BrainBackground from '../components/backgrounds/BrainBackground';

export default function LandingPage() {
  return (
    <>
      <BrainBackground />
      <div className="relative z-10 w-full min-h-screen text-slate-100 font-sans tracking-wide selection:bg-sky-500/30 flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-900/10 via-slate-900/40 to-slate-900/80 -z-10 pointer-events-none"></div>
        
        <div className="backdrop-blur-sm bg-slate-900/20 p-10 md:p-16 rounded-[3rem] border border-white/5 shadow-2xl">
          <h1 className="text-6xl md:text-8xl font-black m-0 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 drop-shadow-lg tracking-tighter mb-6">
            ATHEIA
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light mb-12">
            Advanced neural forensics detecting synthetic manipulation. Zoom in on the truth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/image-detection" className="relative group overflow-hidden px-8 py-4 rounded-full bg-slate-800/50 border border-sky-500/30 text-white font-bold tracking-widest uppercase text-sm hover:border-sky-400 transition-all shadow-[0_0_20px_rgba(14,165,233,0.1)] hover:shadow-[0_0_30px_rgba(14,165,233,0.4)]">
              <span className="relative z-10 flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Image Scan
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-sky-600/20 to-indigo-600/20 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            
            <Link to="/video-detection" className="relative group overflow-hidden px-8 py-4 rounded-full bg-slate-800/50 border border-indigo-500/30 text-white font-bold tracking-widest uppercase text-sm hover:border-indigo-400 transition-all shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              <span className="relative z-10 flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                Video Scan
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
