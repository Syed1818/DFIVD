import BrainBackground from '../components/backgrounds/BrainBackground';
import { ArrowRight, Shield, Zap, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import NeuronButton from '../components/NeuronButton';
import GlitchRevealHero from '../components/GlitchRevealHero';

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
        className="relative z-10 w-full min-h-screen flex flex-col items-center pt-20 md:pt-40 pb-28 md:pb-32 px-4 md:px-6 lg:px-12 text-white font-sans"
      >
        
        {/* Hero Section */}
        <div className="w-full max-w-[1400px] mb-20 md:mb-40 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 md:gap-12">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            <motion.h1 variants={textRevealVariants} className="text-[3.5rem] leading-[0.9] md:text-8xl lg:text-[10rem] font-black tracking-tighter uppercase font-display mix-blend-difference mb-6 md:mb-8 origin-left">
              ATHEIA
            </motion.h1>
            <motion.p variants={textRevealVariants} className="text-lg md:text-2xl font-light text-slate-300 max-w-2xl leading-snug mix-blend-difference">
              Expose the synthetic. Verify the authentic. The definitive neural shield against digital manipulation.
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto"
          >
            <NeuronButton to="/image-detection" className="group flex items-center justify-between gap-8 bg-white text-black px-6 md:px-8 py-4 md:py-5 hover:bg-slate-200 active:bg-slate-300 transition-colors uppercase tracking-[0.2em] text-xs font-bold min-w-[180px] md:min-w-[200px]">
              <span>Image Scan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </NeuronButton>
            <NeuronButton to="/video-detection" className="group flex items-center justify-between gap-8 bg-black border-[0.5px] border-white/30 text-white px-6 md:px-8 py-4 md:py-5 hover:bg-white/10 active:bg-white/20 transition-colors uppercase tracking-[0.2em] text-xs font-bold min-w-[180px] md:min-w-[200px]">
              <span>Video Scan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </NeuronButton>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[1400px] grid grid-cols-3 gap-0 border-[0.5px] border-white/10 bg-black/60 backdrop-blur-md mb-16 md:mb-40"
        >
          {[
            { label: 'Detection Accuracy', value: '98.2%' },
            { label: 'Inference Speed', value: '<2s' },
            { label: 'Models in Ensemble', value: '3+' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className={`p-6 md:p-10 text-center ${i < 2 ? 'border-r-[0.5px] border-white/10' : ''}`}
            >
              <div className="text-2xl md:text-4xl font-display tracking-tighter mb-2 text-white">{stat.value}</div>
              <div className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Neural Forensics Glitch Reveal Hero */}
        <div className="w-screen -mx-4 md:-mx-6 lg:-mx-12 mb-20 md:mb-40">
          <GlitchRevealHero />
        </div>

        {/* Skip Navigation Anchor for Keyboard Accessibility */}
        <div id="skip-forensics-hero" tabIndex={-1} className="outline-none" />

        {/* Bento Features Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="w-full max-w-[1400px] grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 mb-20 md:mb-40"
        >
          <motion.div variants={textRevealVariants} className="col-span-1 md:col-span-12 mb-2 md:mb-4">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500">Core Architecture</h2>
          </motion.div>
          
          <motion.div variants={bentoVariants} whileHover={{ y: -5 }} className="col-span-1 md:col-span-4 bg-black/80 backdrop-blur-md border-[0.5px] border-white/10 p-8 md:p-10 flex flex-col justify-between min-h-[280px] md:h-[400px] hover:border-white/30 transition-colors group">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Shield className="w-8 h-8 text-white mb-6 md:mb-8 group-hover:text-sky-400 transition-colors" strokeWidth={1} />
            </motion.div>
            <div>
              <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tighter mb-3 md:mb-4">Real-Time</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">Optimized FastAPI backend processing frames in milliseconds to deliver instantaneous forensic results.</p>
            </div>
          </motion.div>
          
          <motion.div variants={bentoVariants} whileHover={{ y: -5 }} className="col-span-1 md:col-span-4 bg-black/80 backdrop-blur-md border-[0.5px] border-white/10 p-8 md:p-10 flex flex-col justify-between min-h-[280px] md:h-[400px] hover:border-white/30 transition-colors group">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap className="w-8 h-8 text-white mb-6 md:mb-8 group-hover:text-amber-400 transition-colors" strokeWidth={1} />
            </motion.div>
            <div>
              <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tighter mb-3 md:mb-4">Deep Arch</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">Leveraging ensemble models including XceptionNet and specialized spatial CNNs to detect blending artifacts.</p>
            </div>
          </motion.div>
          
          <motion.div variants={bentoVariants} whileHover={{ y: -5 }} className="col-span-1 md:col-span-4 bg-black/80 backdrop-blur-md border-[0.5px] border-white/10 p-8 md:p-10 flex flex-col justify-between min-h-[280px] md:h-[400px] hover:border-white/30 transition-colors group">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Lock className="w-8 h-8 text-white mb-6 md:mb-8 group-hover:text-emerald-400 transition-colors" strokeWidth={1} />
            </motion.div>
            <div>
              <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tighter mb-3 md:mb-4">Zero Trust</h3>
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
          <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-20 border-b md:border-b-0 md:border-r-[0.5px] border-white/10 flex flex-col justify-center">
            <h2 className="text-3xl md:text-5xl font-display tracking-tighter uppercase mb-6">Mechanism</h2>
            <Link to="/how-to-use" className="group text-[10px] uppercase tracking-[0.2em] text-white flex items-center gap-2 w-max cursor-pointer">
              <span className="border-b border-white pb-0.5">Read Documentation</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-20 flex flex-col justify-center">
            <p className="text-slate-400 font-light leading-relaxed text-base md:text-xl">
              By isolating facial features and analyzing frequency domains impossible for generative models to perfectly replicate, ATHEIA evaluates biological inconsistencies and spatial boundaries to output a deterministic probability score for synthetic manipulation.
            </p>
          </div>
        </motion.div>

      </motion.div>
    </>
  );
}
