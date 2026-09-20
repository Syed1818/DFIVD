import React from 'react';
import GridBackground from '../components/backgrounds/GridBackground';
import { Link } from 'react-router-dom';
import { UploadCloud, Cpu, LineChart, FileImage, FileVideo } from 'lucide-react';
import { motion } from 'motion/react';

export default function HowToUsePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <>
      <GridBackground />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full min-h-screen text-white font-sans pt-40 px-6 lg:px-12 pb-32"
      >
        <div className="max-w-[1400px] mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-32"
          >
            <h1 className="text-5xl md:text-8xl font-display uppercase tracking-tighter mb-8 max-w-4xl">System Documentation</h1>
            <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed max-w-3xl">
              A comprehensive guide to utilizing the ATHEIA neural forensic platform.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-0 border-[0.5px] border-white/10 bg-black/50 backdrop-blur-md mb-32"
          >
            
            <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 p-12 lg:p-16 border-b md:border-b-0 md:border-r-[0.5px] border-white/10 group hover:bg-white/5 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-12">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500">Step 01</span>
                  <UploadCloud className="w-6 h-6 text-white group-hover:scale-125 transition-transform" strokeWidth={1} />
                </div>
                <h2 className="text-3xl font-display uppercase tracking-tighter mb-6">Upload Media</h2>
                <p className="text-slate-400 font-light text-sm leading-relaxed">
                  Navigate to either the Image Scanner or Video Scanner. Select a clear, well-lit media file. Ensure the subject's face is clearly visible, as our models rely heavily on facial artifacting.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 p-12 lg:p-16 border-b md:border-b-0 md:border-r-[0.5px] border-white/10 group hover:bg-white/5 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-12">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500">Step 02</span>
                  <Cpu className="w-6 h-6 text-white group-hover:scale-125 transition-transform" strokeWidth={1} />
                </div>
                <h2 className="text-3xl font-display uppercase tracking-tighter mb-6">Neural Processing</h2>
                <p className="text-slate-400 font-light text-sm leading-relaxed">
                  Once uploaded, our backend API begins inference. For images, this takes seconds. For videos, frames are extracted and processed sequentially, which may take a few minutes depending on length.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 p-12 lg:p-16 group hover:bg-white/5 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-12">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500">Step 03</span>
                  <LineChart className="w-6 h-6 text-white group-hover:scale-125 transition-transform" strokeWidth={1} />
                </div>
                <h2 className="text-3xl font-display uppercase tracking-tighter mb-6">Analyze Output</h2>
                <p className="text-slate-400 font-light text-sm leading-relaxed mb-8">
                  Review the deterministic probability score. The dashboard will output detailed confidence metrics across several sub-models, indicating the likelihood of synthetic manipulation.
                </p>
                <div className="flex gap-4">
                  <motion.div whileHover={{ scale: 1.05 }}><Link to="/image-detection" className="text-[10px] uppercase tracking-widest font-bold border-b border-white pb-1 hover:text-sky-400 transition-colors">Try Image</Link></motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}><Link to="/video-detection" className="text-[10px] uppercase tracking-widest font-bold border-b border-white pb-1 hover:text-sky-400 transition-colors">Try Video</Link></motion.div>
                </div>
              </div>
            </motion.div>

          </motion.div>

          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase tracking-[0.3em] font-medium text-slate-500 mb-8"
          >
            Supported Formats & Limits
          </motion.h2>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
          >
            <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-black/80 backdrop-blur-sm border-[0.5px] border-white/10 p-10 flex gap-8">
              <FileImage className="w-8 h-8 text-slate-500 shrink-0" strokeWidth={1} />
              <div>
                <h3 className="text-xl font-display uppercase tracking-tighter mb-6">Image Requirements</h3>
                <ul className="space-y-4 text-slate-300 font-light text-sm leading-relaxed">
                  <li className="flex justify-between border-b-[0.5px] border-white/10 pb-2">
                    <span className="text-slate-500">Formats</span>
                    <span>JPEG, PNG, WEBP</span>
                  </li>
                  <li className="flex justify-between border-b-[0.5px] border-white/10 pb-2">
                    <span className="text-slate-500">Max Size</span>
                    <span>10 MB</span>
                  </li>
                  <li className="flex justify-between border-b-[0.5px] border-white/10 pb-2">
                    <span className="text-slate-500">Resolution</span>
                    <span>Recommended &gt; 500x500</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-black/80 backdrop-blur-sm border-[0.5px] border-white/10 p-10 flex gap-8">
              <FileVideo className="w-8 h-8 text-slate-500 shrink-0" strokeWidth={1} />
              <div>
                <h3 className="text-xl font-display uppercase tracking-tighter mb-6">Video Requirements</h3>
                <ul className="space-y-4 text-slate-300 font-light text-sm leading-relaxed">
                  <li className="flex justify-between border-b-[0.5px] border-white/10 pb-2">
                    <span className="text-slate-500">Formats</span>
                    <span>MP4, MOV, AVI</span>
                  </li>
                  <li className="flex justify-between border-b-[0.5px] border-white/10 pb-2">
                    <span className="text-slate-500">Max Size</span>
                    <span>100 MB</span>
                  </li>
                  <li className="flex justify-between border-b-[0.5px] border-white/10 pb-2">
                    <span className="text-slate-500">Length</span>
                    <span>Under 60 seconds</span>
                  </li>
                </ul>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </motion.div>
    </>
  );
}
