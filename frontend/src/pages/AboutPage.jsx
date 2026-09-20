import React from 'react';
import GeometryBackground from '../components/backgrounds/GeometryBackground';

export default function AboutPage() {
  return (
    <>
      <GeometryBackground />
      <div className="relative z-10 w-full min-h-screen text-slate-100 font-sans tracking-wide pt-32 px-4 pb-20">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="backdrop-blur-md bg-slate-900/60 p-10 rounded-[2rem] border border-white/10 shadow-2xl text-center">
            <h1 className="text-5xl font-black mb-6 text-white">The ATHEIA Initiative</h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
              We are a dedicated team of researchers and engineers building next-generation digital forensics tools to combat the rise of synthetic media and deepfakes.
            </p>
          </div>

          <div className="backdrop-blur-md bg-slate-900/60 p-10 rounded-[2rem] border border-white/10 shadow-2xl">
            <h2 className="text-3xl font-black mb-10 text-center text-emerald-400">Meet the Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Team Member 1 */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5 text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 mb-4 flex items-center justify-center text-3xl">🔬</div>
                <h3 className="text-lg font-bold">GD Pranu poojitha</h3>
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Lead Researcher</p>
                <p className="text-slate-400 text-sm font-light">Architecting the neural detection strategies and evaluating model architectures for maximum precision.</p>
              </div>

              {/* Team Member 2 */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5 text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-sky-500/20 mb-4 flex items-center justify-center text-3xl">📝</div>
                <h3 className="text-lg font-bold">Gayathri</h3>
                <p className="text-sky-400 text-xs font-bold uppercase tracking-widest mb-3">Documentator</p>
                <p className="text-slate-400 text-sm font-light">Translating complex AI research into comprehensive, accessible documentation and usage guides.</p>
              </div>

              {/* Team Member 3 */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5 text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-purple-500/20 mb-4 flex items-center justify-center text-3xl">🎨</div>
                <h3 className="text-lg font-bold">Shreya</h3>
                <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-3">Frontend Developer</p>
                <p className="text-slate-400 text-sm font-light">Crafting the immersive, interactive 3D user interfaces using React and Three.js.</p>
              </div>

              {/* Team Member 4 */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5 text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-amber-500/20 mb-4 flex items-center justify-center text-3xl">⚙️</div>
                <h3 className="text-lg font-bold">Syed Shahid</h3>
                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Backend Developer</p>
                <p className="text-slate-400 text-sm font-light">Building robust, high-performance FastAPI endpoints for real-time model inference.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="backdrop-blur-md bg-slate-900/60 p-10 rounded-[2rem] border border-white/10 shadow-2xl">
              <h2 className="text-3xl font-black mb-6 text-sky-400">The Technology Stack</h2>
              <ul className="space-y-4 text-slate-300 font-light leading-relaxed list-disc list-inside">
                <li><strong className="text-white">Frontend:</strong> Built with React, Tailwind CSS for rapid styling, and `@react-three/fiber` for stunning 3D canvas backgrounds.</li>
                <li><strong className="text-white">Routing:</strong> Modular, client-side routing via `react-router-dom`.</li>
                <li><strong className="text-white">Backend:</strong> Python-based FastAPI server ensuring blazing fast, asynchronous request handling.</li>
                <li><strong className="text-white">Inference:</strong> PyTorch serving as the core engine for our deep learning models.</li>
              </ul>
            </div>

            <div className="backdrop-blur-md bg-slate-900/60 p-10 rounded-[2rem] border border-white/10 shadow-2xl">
              <h2 className="text-3xl font-black mb-6 text-purple-400">Our Models</h2>
              <p className="text-slate-300 font-light mb-4 leading-relaxed">
                ATHEIA utilizes an ensemble approach. For frame-by-frame analysis, we rely on architectures derived from <strong className="text-white">XceptionNet</strong>, pre-trained on massive datasets of synthetic faces.
              </p>
              <p className="text-slate-300 font-light leading-relaxed">
                We also utilize <strong className="text-white">Mesonet-style CNNs</strong> specifically trained to detect mesoscopic properties of images—artifacts generated during the synthesis and blending processes that are invisible to the human eye.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
