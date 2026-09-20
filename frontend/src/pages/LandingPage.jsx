import React from 'react';
import { Link } from 'react-router-dom';
import BrainBackground from '../components/backgrounds/BrainBackground';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import NeuronButton from '../components/NeuronButton';

// Custom High-Tech Icons
const CoreEngineIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white mb-8">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
    <circle cx="12" cy="12" r="3" fill="currentColor" className="opacity-20 animate-pulse" />
  </svg>
);

const NeuralArchIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white mb-8">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    <circle cx="12" cy="12" r="8" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite]" />
  </svg>
);

const ZeroTrustIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white mb-8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M8 11h8" />
    <path d="M12 7v8" />
  </svg>
);

export default function LandingPage() {
  const textRevealVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const bentoVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <>
      <BrainBackground />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full min-h-screen flex flex-col items-center pt-24 md:pt-40 pb-32 px-6 lg:px-12 text-white font-sans"
      >
        
        {/* Hero Section */}
        <div className="w-full max-w-[1400px] mb-40 flex flex-col md:flex-row items-end justify-between gap-12">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            <motion.h1 variants={textRevealVariants} className="text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.85] tracking-tighter uppercase font-display mix-blend-difference mb-8 origin-left">
              ATHEIA
            </motion.h1>
            <motion.p variants={textRevealVariants} className="text-xl md:text-2xl font-light text-slate-300 max-w-2xl leading-tight mix-blend-difference">
              Expose the synthetic. Verify the authentic. The definitive neural shield against digital manipulation.
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 w-full md:w-auto"
          >
            <NeuronButton to="/image-detection" className="group flex items-center justify-between gap-8 bg-white text-black px-8 py-5 hover:bg-slate-200 transition-colors uppercase tracking-[0.2em] text-xs font-bold min-w-[200px]">
              <span>Image Scan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </NeuronButton>
            <NeuronButton to="/video-detection" className="group flex items-center justify-between gap-8 bg-black border-[0.5px] border-white/30 text-white px-8 py-5 hover:bg-white/10 transition-colors uppercase tracking-[0.2em] text-xs font-bold min-w-[200px]">
              <span>Video Scan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </NeuronButton>
          </motion.div>
        </div>

        {/* Bento Features Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="w-full max-w-[1400px] grid grid-cols-1 md:grid-cols-12 gap-4 mb-40"
        >
          <motion.div variants={textRevealVariants} className="col-span-1 md:col-span-12 mb-4">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500">Core Architecture</h2>
          </motion.div>
          
          <motion.div variants={bentoVariants} whileHover={{ y: -5 }} className="col-span-1 md:col-span-4 bg-black/80 backdrop-blur-md border-[0.5px] border-white/10 p-10 flex flex-col justify-between aspect-square md:aspect-auto md:h-[400px] hover:border-white/30 transition-colors">
            <CoreEngineIcon />
            <div>
              <h3 className="text-3xl font-display uppercase tracking-tighter mb-4">Real-Time</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">Optimized FastAPI backend processing frames in milliseconds to deliver instantaneous forensic results.</p>
            </div>
          </motion.div>
          
          <motion.div variants={bentoVariants} whileHover={{ y: -5 }} className="col-span-1 md:col-span-4 bg-black/80 backdrop-blur-md border-[0.5px] border-white/10 p-10 flex flex-col justify-between aspect-square md:aspect-auto md:h-[400px] hover:border-white/30 transition-colors">
            <NeuralArchIcon />
            <div>
              <h3 className="text-3xl font-display uppercase tracking-tighter mb-4">Deep Arch</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">Leveraging ensemble models including XceptionNet and specialized spatial CNNs to detect blending artifacts.</p>
            </div>
          </motion.div>
          
          <motion.div variants={bentoVariants} whileHover={{ y: -5 }} className="col-span-1 md:col-span-4 bg-black/80 backdrop-blur-md border-[0.5px] border-white/10 p-10 flex flex-col justify-between aspect-square md:aspect-auto md:h-[400px] hover:border-white/30 transition-colors">
            <ZeroTrustIcon />
            <div>
              <h3 className="text-3xl font-display uppercase tracking-tighter mb-4">Zero Trust</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">Zero-retention policy. Uploaded media is analyzed strictly in-memory and immediately discarded.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* How It Works Minimalist */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="w-full max-w-[1400px] bg-black/90 backdrop-blur-xl border-[0.5px] border-white/10 flex flex-col md:flex-row"
        >
          <div className="w-full md:w-1/2 p-12 lg:p-20 border-b md:border-b-0 md:border-r-[0.5px] border-white/10 flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-display tracking-tighter uppercase mb-6">Mechanism</h2>
            <Link to="/how-to-use" className="group text-[10px] uppercase tracking-[0.2em] text-white flex items-center gap-2 w-max cursor-pointer">
              <span className="border-b border-white pb-0.5">Read Documentation</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="w-full md:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
            <p className="text-slate-400 font-light leading-relaxed text-lg lg:text-xl">
              By isolating facial features and analyzing frequency domains impossible for generative models to perfectly replicate, ATHEIA evaluates biological inconsistencies and spatial boundaries to output a deterministic probability score for synthetic manipulation.
            </p>
          </div>
        </motion.div>

      </motion.div>
    </>
  );
}
