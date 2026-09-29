import React from 'react';
import GeometryBackground from '../components/backgrounds/GeometryBackground';
import { motion } from 'motion/react';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <>
      <GeometryBackground />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full min-h-screen text-white font-sans pt-24 md:pt-40 px-4 md:px-6 lg:px-12 pb-28 md:pb-32"
      >
        <div className="max-w-[1400px] mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 md:mb-32"
          >
            <h1 className="text-4xl md:text-8xl font-display uppercase tracking-tighter mb-6 md:mb-8 max-w-4xl">The ATHEIA Initiative</h1>
            <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed max-w-3xl">
              We are a dedicated team of researchers and engineers building next-generation digital forensics tools to combat the rise of synthetic media.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mb-16 md:mb-32 border-t-[0.5px] border-white/10 pt-10 md:pt-16"
          >
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500 mb-12">Core Team</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-[0.5px] border-white/10 bg-black/50 backdrop-blur-md">
              {/* Team Member 1 */}
              <motion.div variants={itemVariants} className="p-10 border-b lg:border-b-0 lg:border-r-[0.5px] border-white/10 group hover:bg-white/5 transition-colors">
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-6">Lead Researcher</p>
                <h3 className="text-2xl font-display uppercase tracking-tighter mb-4 group-hover:text-sky-400 transition-colors">GD Pranu poojitha</h3>
                <p className="text-slate-400 text-sm font-light leading-relaxed">Architecting the neural detection strategies and evaluating model architectures for maximum precision.</p>
              </motion.div>

              {/* Team Member 2 */}
              <motion.div variants={itemVariants} className="p-10 border-b lg:border-b-0 lg:border-r-[0.5px] border-white/10 group hover:bg-white/5 transition-colors">
                <p className="text-sky-400 text-[10px] font-bold uppercase tracking-widest mb-6">Documentator</p>
                <h3 className="text-2xl font-display uppercase tracking-tighter mb-4 group-hover:text-sky-400 transition-colors">Gayathri</h3>
                <p className="text-slate-400 text-sm font-light leading-relaxed">Translating complex AI research into comprehensive, accessible documentation and usage guides.</p>
              </motion.div>

              {/* Team Member 3 */}
              <motion.div variants={itemVariants} className="p-10 border-b lg:border-b-0 lg:border-r-[0.5px] border-white/10 group hover:bg-white/5 transition-colors">
                <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-6">Frontend Developer</p>
                <h3 className="text-2xl font-display uppercase tracking-tighter mb-4 group-hover:text-sky-400 transition-colors">Shreya</h3>
                <p className="text-slate-400 text-sm font-light leading-relaxed">Crafting the immersive, interactive 3D user interfaces using React and Three.js.</p>
              </motion.div>

              {/* Team Member 4 */}
              <motion.div variants={itemVariants} className="p-10 group hover:bg-white/5 transition-colors">
                <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-6">Backend Developer</p>
                <h3 className="text-2xl font-display uppercase tracking-tighter mb-4 group-hover:text-sky-400 transition-colors">Syed Shahid</h3>
                <p className="text-slate-400 text-sm font-light leading-relaxed">Building robust, high-performance FastAPI endpoints for real-time model inference.</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12"
          >
            <motion.div variants={itemVariants} className="bg-black/80 backdrop-blur-sm border-[0.5px] border-white/10 p-12 lg:p-16">
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500 mb-8">The Technology Stack</h2>
              <ul className="space-y-6 text-slate-300 font-light text-sm leading-relaxed">
                <li className="flex gap-4">
                  <span className="text-white font-bold w-24 shrink-0 uppercase tracking-wider text-xs pt-0.5">Frontend</span>
                  <span>Built with React, Tailwind CSS for stark styling, and `@react-three/fiber` for custom 3D webgl contexts.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-white font-bold w-24 shrink-0 uppercase tracking-wider text-xs pt-0.5">Routing</span>
                  <span>Modular, client-side routing via `react-router-dom`.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-white font-bold w-24 shrink-0 uppercase tracking-wider text-xs pt-0.5">Backend</span>
                  <span>Python-based FastAPI server ensuring blazing fast, asynchronous request handling.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-white font-bold w-24 shrink-0 uppercase tracking-wider text-xs pt-0.5">Inference</span>
                  <span>PyTorch serving as the core engine for our deep learning models.</span>
                </li>
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-black/80 backdrop-blur-sm border-[0.5px] border-white/10 p-12 lg:p-16">
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500 mb-8">Our Models</h2>
              <div className="space-y-8 text-slate-300 font-light text-sm leading-relaxed">
                <div>
                  <h3 className="text-white font-bold uppercase tracking-wider text-xs mb-3">XceptionNet Ensemble</h3>
                  <p>ATHEIA utilizes an ensemble approach. For frame-by-frame analysis, we rely on architectures derived from XceptionNet, pre-trained on massive datasets of synthetic faces.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold uppercase tracking-wider text-xs mb-3">Mesoscopic CNNs</h3>
                  <p>We utilize specialized CNNs specifically trained to detect mesoscopic properties of images—artifacts generated during the synthesis and blending processes that are invisible to the human eye.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </motion.div>
    </>
  );
}
