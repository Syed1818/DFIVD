import React from 'react';
import { Link } from 'react-router-dom';
import { Code, MessageSquare, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <footer className="relative z-10 w-full mt-auto bg-black border-t-[0.5px] border-white/20 text-slate-400 py-16 px-6 lg:px-12 overflow-hidden">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="w-full grid grid-cols-1 md:grid-cols-4 gap-12"
      >
        
        {/* Brand Info */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-1">
          <Link to="/" className="text-2xl font-bold tracking-widest text-white mb-6 block font-display uppercase">ATHEIA</Link>
          <p className="text-[13px] font-light leading-relaxed mb-6 max-w-sm text-slate-500">
            Advanced neural networks for deepfake detection. Securing digital truth through state-of-the-art forensic analysis.
          </p>
          <div className="flex gap-4">
            <motion.a whileHover={{ y: -5, color: '#fff' }} href="#" className="text-slate-500 transition-colors"><Code className="w-5 h-5" strokeWidth={1.5} /></motion.a>
            <motion.a whileHover={{ y: -5, color: '#fff' }} href="#" className="text-slate-500 transition-colors"><MessageSquare className="w-5 h-5" strokeWidth={1.5} /></motion.a>
            <motion.a whileHover={{ y: -5, color: '#fff' }} href="#" className="text-slate-500 transition-colors"><Mail className="w-5 h-5" strokeWidth={1.5} /></motion.a>
          </div>
        </motion.div>

        {/* Scanners */}
        <motion.div variants={itemVariants}>
          <h3 className="text-white font-medium tracking-[0.2em] text-[10px] uppercase mb-6">Detectors</h3>
          <ul className="space-y-4 text-[13px] font-light">
            <motion.li whileHover={{ x: 5 }}><Link to="/image-detection" className="hover:text-white transition-colors">Image Scanner</Link></motion.li>
            <motion.li whileHover={{ x: 5 }}><Link to="/video-detection" className="hover:text-white transition-colors">Video Scanner</Link></motion.li>
            <motion.li whileHover={{ x: 5 }}><Link to="/how-to-use" className="hover:text-white transition-colors">Documentation</Link></motion.li>
          </ul>
        </motion.div>

        {/* Company */}
        <motion.div variants={itemVariants}>
          <h3 className="text-white font-medium tracking-[0.2em] text-[10px] uppercase mb-6">Company</h3>
          <ul className="space-y-4 text-[13px] font-light">
            <motion.li whileHover={{ x: 5 }}><Link to="/about" className="hover:text-white transition-colors">About Us</Link></motion.li>
            <motion.li whileHover={{ x: 5 }}><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></motion.li>
            <motion.li whileHover={{ x: 5 }}><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Open Source</a></motion.li>
          </ul>
        </motion.div>

        {/* Legal */}
        <motion.div variants={itemVariants}>
          <h3 className="text-white font-medium tracking-[0.2em] text-[10px] uppercase mb-6">Legal</h3>
          <ul className="space-y-4 text-[13px] font-light">
            <motion.li whileHover={{ x: 5 }}><Link to="/terms-privacy" className="hover:text-white transition-colors">Terms of Service</Link></motion.li>
            <motion.li whileHover={{ x: 5 }}><Link to="/terms-privacy" className="hover:text-white transition-colors">Privacy Policy</Link></motion.li>
            <motion.li whileHover={{ x: 5 }}><Link to="/terms-privacy" className="hover:text-white transition-colors">Data Ethics</Link></motion.li>
          </ul>
        </motion.div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 1 }}
        className="w-full mt-16 pt-8 border-t-[0.5px] border-white/10 flex flex-col md:flex-row justify-between items-center text-[11px] font-light text-slate-600 tracking-wider uppercase"
      >
        <p>&copy; {new Date().getFullYear()} ATHEIA Deepfake Detection.</p>
        <p className="mt-2 md:mt-0 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
          All Systems Nominal
        </p>
      </motion.div>
    </footer>
  );
}
