import React from 'react';
import GridBackground from '../components/backgrounds/GridBackground';
import { Link } from 'react-router-dom';

export default function HowToUsePage() {
  return (
    <>
      <GridBackground />
      <div className="relative z-10 w-full min-h-screen text-slate-100 font-sans tracking-wide pt-32 px-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="backdrop-blur-md bg-slate-900/60 p-10 rounded-[2rem] border border-white/10 shadow-2xl text-center">
            <h1 className="text-4xl font-black mb-4 text-white">System Documentation</h1>
            <p className="text-slate-400 font-light text-lg">
              A comprehensive guide to utilizing the ATHEIA neural forensic platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/40 backdrop-blur-sm p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-sky-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-bl-xl">Step 1</div>
              <div className="text-4xl mb-4 text-sky-400">📤</div>
              <h2 className="text-2xl font-bold mb-3">Upload Media</h2>
              <p className="text-slate-300 font-light text-sm leading-relaxed">
                Navigate to either the Image Scanner or Video Scanner. Select a clear, well-lit media file. Ensure the subject's face is clearly visible, as our models rely heavily on facial artifacting.
              </p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-bl-xl">Step 2</div>
              <div className="text-4xl mb-4 text-indigo-400">⚙️</div>
              <h2 className="text-2xl font-bold mb-3">Neural Processing</h2>
              <p className="text-slate-300 font-light text-sm leading-relaxed">
                Once uploaded, our backend API begins inference. For images, this takes seconds. For videos, frames are extracted and processed sequentially, which may take a few minutes depending on length.
              </p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden md:col-span-2">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-bl-xl">Step 3</div>
              <div className="text-4xl mb-4 text-emerald-400">📊</div>
              <h2 className="text-2xl font-bold mb-3">Analyze Output</h2>
              <p className="text-slate-300 font-light text-sm leading-relaxed mb-4">
                Review the deterministic probability score. The dashboard will output detailed confidence metrics across several sub-models, indicating the likelihood of synthetic manipulation.
              </p>
              <div className="flex gap-4 mt-6">
                <Link to="/image-detection" className="px-6 py-2 bg-slate-700/50 hover:bg-sky-600/50 border border-white/10 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors">Try Image</Link>
                <Link to="/video-detection" className="px-6 py-2 bg-slate-700/50 hover:bg-indigo-600/50 border border-white/10 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors">Try Video</Link>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-slate-900/60 p-10 rounded-[2rem] border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-black mb-6 text-white">Supported Formats & Limits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-800/30 p-6 rounded-xl border border-white/5">
                <h3 className="text-sky-400 font-bold mb-2 uppercase tracking-widest text-sm">Images</h3>
                <ul className="text-slate-300 font-light text-sm space-y-2 list-disc list-inside">
                  <li>Formats: JPEG, PNG, WEBP</li>
                  <li>Max Size: 10 MB</li>
                  <li>Resolution: Recommended &gt; 500x500</li>
                </ul>
              </div>
              <div className="bg-slate-800/30 p-6 rounded-xl border border-white/5">
                <h3 className="text-indigo-400 font-bold mb-2 uppercase tracking-widest text-sm">Videos</h3>
                <ul className="text-slate-300 font-light text-sm space-y-2 list-disc list-inside">
                  <li>Formats: MP4, MOV, AVI</li>
                  <li>Max Size: 100 MB</li>
                  <li>Length: Under 60 seconds</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
