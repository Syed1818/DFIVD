import React from 'react';
import SpaceBackground from '../components/backgrounds/SpaceBackground';
import { motion } from 'motion/react';

export default function TermsPrivacyPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <>
      <SpaceBackground />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full min-h-screen text-white font-sans pt-24 md:pt-40 px-4 md:px-6 lg:px-12 pb-28 md:pb-32"
      >
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 lg:gap-24">
          
          <div className="lg:w-1/3">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="sticky top-40"
            >
              <h1 className="text-5xl font-display uppercase tracking-tighter mb-6">Legal & Privacy</h1>
              <p className="text-slate-400 font-light text-sm leading-relaxed mb-8">
                Strict adherence to zero-retention policies and ethical use guidelines for the ATHEIA neural forensic platform.
              </p>
              <nav className="flex flex-col space-y-4 text-[10px] uppercase tracking-[0.2em] font-bold">
                <motion.a whileHover={{ x: 5 }} href="#privacy" className="text-sky-400 border-l-[0.5px] border-sky-400 pl-4 py-1">Privacy Policy</motion.a>
                <motion.a whileHover={{ x: 5 }} href="#terms" className="text-slate-500 border-l-[0.5px] border-white/10 pl-4 py-1 hover:text-white transition-colors">Terms of Service</motion.a>
                <motion.a whileHover={{ x: 5 }} href="#ethics" className="text-slate-500 border-l-[0.5px] border-white/10 pl-4 py-1 hover:text-white transition-colors">Ethical Guidelines</motion.a>
              </nav>
            </motion.div>
          </div>

          <div className="lg:w-2/3 space-y-24 bg-black/80 backdrop-blur-md border-[0.5px] border-white/10 p-12 lg:p-20">
            
            <motion.section 
              id="privacy"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500 mb-8 border-b-[0.5px] border-white/10 pb-4">01. Privacy Policy</h2>
              <div className="space-y-8 text-slate-300 font-light text-sm leading-relaxed">
                <motion.div variants={itemVariants}>
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Zero Data Retention</h3>
                  <p>ATHEIA operates on a strict zero-retention architecture. Media files uploaded for analysis are processed entirely in volatile memory (RAM) during the inference stage. Absolutely no data is written to persistent storage, databases, or logs.</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Data Processing</h3>
                  <p>Upon completion of the analysis pipeline, the matrix containing the resulting probability score and heatmap generation is returned to the client, and the source media is instantaneously purged from the server memory.</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Analytics & Telemetry</h3>
                  <p>We do not track individual users, nor do we store IP addresses or identifying metadata associated with upload requests. We maintain only aggregated, anonymized metrics regarding system load and inference times for performance optimization.</p>
                </motion.div>
              </div>
            </motion.section>

            <motion.section 
              id="terms"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500 mb-8 border-b-[0.5px] border-white/10 pb-4">02. Terms of Service</h2>
              <div className="space-y-8 text-slate-300 font-light text-sm leading-relaxed">
                <motion.div variants={itemVariants}>
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Platform Usage</h3>
                  <p>ATHEIA is provided as an analytical tool for detecting synthetic media. Users agree to utilize the platform responsibly and not to attempt reverse engineering, denial of service, or exploitation of the underlying neural architectures.</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Accuracy Disclaimer</h3>
                  <p>While our ensemble models achieve high accuracy rates, neural network inference is probabilistic, not absolute. The platform may produce false positives or false negatives. ATHEIA's output should be considered one component of a broader forensic investigation, not a definitive legal conclusion.</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Liability</h3>
                  <p>The developers of ATHEIA assume no liability for decisions made or actions taken based on the system's output. The service is provided "as is" without warranty of any kind.</p>
                </motion.div>
              </div>
            </motion.section>

          </div>

        </div>
      </motion.div>
    </>
  );
}
