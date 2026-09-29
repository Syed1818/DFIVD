import React from 'react';
import SpaceBackground from '../components/backgrounds/SpaceBackground';
import { Mail, Code, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContactPage() {
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
      <SpaceBackground />
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
            <h1 className="text-4xl md:text-8xl font-display uppercase tracking-tighter mb-6 md:mb-8 max-w-4xl">Establish Contact</h1>
            <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed max-w-3xl">
              For research inquiries, integration requests, or vulnerability disclosures, connect with the ATHEIA engineering and research teams.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-0 border-[0.5px] border-white/10 bg-black/50 backdrop-blur-md mb-20"
          >
            
            <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 p-12 lg:p-16 border-b md:border-b-0 md:border-r-[0.5px] border-white/10 group hover:bg-white/5 transition-colors flex flex-col justify-between">
              <div>
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }} className="w-max">
                  <Mail className="w-8 h-8 text-white mb-12" strokeWidth={1} />
                </motion.div>
                <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500 mb-4">Direct Communication</h2>
                <h3 className="text-2xl font-display uppercase tracking-tighter mb-6 group-hover:text-sky-400 transition-colors">research@atheia.dev</h3>
                <p className="text-slate-400 font-light text-sm leading-relaxed mb-8">
                  For general inquiries regarding model architecture, training sets, or collaboration opportunities.
                </p>
                <button className="text-[10px] uppercase tracking-widest font-bold border-b border-white pb-1 group-hover:border-sky-400 transition-colors flex items-center gap-2">
                  <span>Send Protocol</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 p-12 lg:p-16 border-b md:border-b-0 md:border-r-[0.5px] border-white/10 group hover:bg-white/5 transition-colors flex flex-col justify-between">
              <div>
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }} className="w-max">
                  <Code className="w-8 h-8 text-white mb-12" strokeWidth={1} />
                </motion.div>
                <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500 mb-4">Source Code</h2>
                <h3 className="text-2xl font-display uppercase tracking-tighter mb-6 group-hover:text-sky-400 transition-colors">GitHub Repository</h3>
                <p className="text-slate-400 font-light text-sm leading-relaxed mb-8">
                  Review the frontend interface codebase, issue tracking, and version history.
                </p>
                <button className="text-[10px] uppercase tracking-widest font-bold border-b border-white pb-1 group-hover:border-sky-400 transition-colors flex items-center gap-2">
                  <span>Access Repository</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 p-12 lg:p-16 group hover:bg-white/5 transition-colors flex flex-col justify-between">
              <div>
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }} className="w-max">
                  <Globe className="w-8 h-8 text-white mb-12" strokeWidth={1} />
                </motion.div>
                <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500 mb-4">Professional Network</h2>
                <h3 className="text-2xl font-display uppercase tracking-tighter mb-6 group-hover:text-sky-400 transition-colors">LinkedIn Profiles</h3>
                <p className="text-slate-400 font-light text-sm leading-relaxed mb-8">
                  Connect with the founding engineers and researchers behind the ATHEIA initiative.
                </p>
                <button className="text-[10px] uppercase tracking-widest font-bold border-b border-white pb-1 group-hover:border-sky-400 transition-colors flex items-center gap-2">
                  <span>View Network</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="bg-black/80 backdrop-blur-sm border-[0.5px] border-white/10 p-12 lg:p-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-12"
          >
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-display uppercase tracking-tighter mb-6">Security & Vulnerability Disclosure</h2>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                We take the security of our neural inference engine seriously. If you believe you have discovered a method to bypass detection or a vulnerability in our API, please utilize our encrypted disclosure channel. We request a 90-day embargo before public disclosure of verified bypassing techniques.
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-8 py-5 hover:bg-slate-200 transition-colors uppercase tracking-[0.2em] text-xs font-bold whitespace-nowrap"
            >
              Submit Disclosure
            </motion.button>
          </motion.div>

        </div>
      </motion.div>
    </>
  );
}
