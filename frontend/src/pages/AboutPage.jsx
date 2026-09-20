import React from 'react';
import GeometryBackground from '../components/backgrounds/GeometryBackground';

export default function AboutPage() {
  const team = [
    { name: 'GD Pranu poojitha', role: 'Researcher' },
    { name: 'Gayathri', role: 'Documentator' },
    { name: 'Shreya', role: 'Frontend Developer' },
    { name: 'Syed Shahid', role: 'Backend Developer' },
  ];

  return (
    <>
      <GeometryBackground />
      <div className="relative z-10 w-full min-h-screen text-slate-100 font-sans tracking-wide pt-32 px-4 pb-20">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="backdrop-blur-xl bg-slate-900/40 p-10 rounded-[2rem] border border-white/10 shadow-2xl">
            <h2 className="text-4xl font-bold mb-8 text-sky-400">Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {team.map((member) => (
                <div key={member.name} className="bg-slate-800/50 p-6 rounded-xl border border-white/5 text-center hover:bg-slate-800/80 transition-colors">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 mb-4 flex items-center justify-center text-xl font-bold shadow-lg">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-sky-300 mt-2 uppercase tracking-wider">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="backdrop-blur-xl bg-slate-900/40 p-10 rounded-[2rem] border border-white/10 shadow-2xl">
            <h2 className="text-4xl font-bold mb-6 text-indigo-400">Models & Technology</h2>
            <div className="space-y-6 text-slate-300 leading-relaxed font-light">
              <p>
                <strong>ATHEIA</strong> leverages a hybrid ensemble of state-of-the-art neural networks designed to detect microscopic spatial and temporal inconsistencies in digital media.
              </p>
              <ul className="list-disc pl-6 space-y-4">
                <li><strong>Spatial Analysis (Images):</strong> Utilizing advanced Vision Transformers (ViT) and CNNs fine-tuned on the latest synthetic datasets (Midjourney v6, DALL-E 3, Stable Diffusion XL) to identify unnatural frequency artifacts and blending boundaries.</li>
                <li><strong>Temporal Analysis (Video):</strong> Deploying Recurrent Convolutional architectures (R-CNNs) paired with optical flow tracking to detect inter-frame inconsistencies, irregular micro-expressions, and biometrical violations indicative of face-swapping or lip-sync manipulation.</li>
                <li><strong>Web Stack:</strong> Built on a high-performance React + Vite frontend with Tailwind CSS and Three.js (React Three Fiber) for immersive UI. The backend is powered by a robust Python FastAPI server ensuring rapid inference and parallel job processing.</li>
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
