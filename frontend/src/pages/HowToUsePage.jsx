import React from 'react';
import GridBackground from '../components/backgrounds/GridBackground';
import { Link } from 'react-router-dom';

export default function HowToUsePage() {
  return (
    <>
      <GridBackground />
      <div className="relative z-10 w-full min-h-screen text-slate-100 font-sans tracking-wide pt-32 px-4 pb-20">
        <div className="max-w-4xl mx-auto backdrop-blur-xl bg-slate-900/40 p-10 md:p-16 rounded-[2rem] border border-white/10 shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-black mb-10 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
            How to Use ATHEIA
          </h1>
          
          <div className="space-y-12">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sky-500/20 border border-sky-500/50 flex items-center justify-center text-xl font-bold text-sky-400">1</div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Select the Media Type</h3>
                <p className="text-slate-300 font-light leading-relaxed">
                  Navigate to the <Link to="/image-detection" className="text-sky-400 underline">Image Scan</Link> or <Link to="/video-detection" className="text-sky-400 underline">Video Scan</Link> pages depending on your target media.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-xl font-bold text-indigo-400">2</div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Upload your File</h3>
                <p className="text-slate-300 font-light leading-relaxed">
                  Drag and drop your file into the designated secure zone, or click to browse your file system. We support common formats including JPG, PNG, MP4, and MOV.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-xl font-bold text-purple-400">3</div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Initiate Analysis</h3>
                <p className="text-slate-300 font-light leading-relaxed">
                  Click the "Initialize" button. Our backend models will process the media. Image scans are typically instantaneous, while video scans stream progress as they chunk and analyze frames.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xl font-bold text-emerald-400">4</div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Review Forensic Data</h3>
                <p className="text-slate-300 font-light leading-relaxed">
                  Once complete, the UI will display a probability score alongside detailed metrics (e.g., spectral inconsistencies, spatial blending). A forensic heatmap or subject crop will highlight areas of interest where synthetic manipulation was detected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
