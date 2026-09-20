import React from 'react';
import { Link } from 'react-router-dom';
import BrainBackground from '../components/backgrounds/BrainBackground';

export default function LandingPage() {
  return (
    <>
      <BrainBackground />
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center pt-32 pb-20 px-4 text-slate-100 font-sans tracking-wide">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl backdrop-blur-sm bg-black/20 p-10 rounded-3xl border border-white/5 mb-24 mt-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            ATHEIA
          </h1>
          <p className="text-xl md:text-2xl font-light text-slate-300 mb-10">
            Uncover the truth in digital media. State-of-the-art neural architectures designed for high-precision deepfake detection.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/image-detection" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 px-8 rounded-full transition-all uppercase tracking-widest text-sm backdrop-blur-md flex items-center justify-center gap-3">
              <span>Scan Image</span>
              <span className="text-lg">📸</span>
            </Link>
            <Link to="/video-detection" className="bg-sky-600/80 hover:bg-sky-500/80 border border-sky-400/30 text-white font-bold py-4 px-8 rounded-full transition-all uppercase tracking-widest text-sm backdrop-blur-md shadow-[0_0_20px_rgba(14,165,233,0.3)] flex items-center justify-center gap-3">
              <span>Scan Video</span>
              <span className="text-lg">🎥</span>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 px-4 mb-24">
          <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="text-4xl mb-4 text-sky-400">⚡</div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-widest">Real-Time Inference</h3>
            <p className="text-slate-400 font-light text-sm">Optimized FastAPI backend processing frames in milliseconds to deliver instantaneous forensic results.</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="text-4xl mb-4 text-emerald-400">🧠</div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-widest">Deep Architecture</h3>
            <p className="text-slate-400 font-light text-sm">Leveraging ensemble models including XceptionNet and specialized spatial CNNs to detect minute blending artifacts.</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="text-4xl mb-4 text-purple-400">🔒</div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-widest">Privacy First</h3>
            <p className="text-slate-400 font-light text-sm">Zero-retention policy. Uploaded media is analyzed strictly in-memory and immediately discarded after inference.</p>
          </div>
        </div>

        {/* How It Works Teaser */}
        <div className="w-full max-w-4xl bg-slate-800/40 backdrop-blur-lg p-10 rounded-[2rem] border border-white/10 text-center mb-10">
          <h2 className="text-3xl font-black mb-6">How ATHEIA Works</h2>
          <p className="text-slate-300 font-light mb-8 leading-relaxed text-lg">
            Our platform operates by isolating facial features and analyzing frequency domains that are impossible for generative models to perfectly replicate. By evaluating biological inconsistencies and spatial boundaries, ATHEIA outputs a deterministic probability score for synthetic manipulation.
          </p>
          <Link to="/how-to-use" className="text-sky-400 hover:text-sky-300 uppercase tracking-widest font-bold text-sm border-b border-sky-400/30 pb-1">Read the Documentation</Link>
        </div>

      </div>
    </>
  );
}
