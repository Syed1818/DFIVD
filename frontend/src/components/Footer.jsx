import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative z-10 w-full mt-auto bg-slate-900/80 backdrop-blur-xl border-t border-white/10 text-slate-400 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Info */}
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="text-2xl font-black tracking-widest text-white mb-4 block">ATHEIA</Link>
          <p className="text-sm font-light leading-relaxed mb-4">
            Advanced neural networks for deepfake detection. Securing digital truth through state-of-the-art forensic analysis.
          </p>
          <div className="text-xs font-mono text-sky-400">Status: ALL SYSTEMS NOMINAL</div>
        </div>

        {/* Scanners */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Detectors</h3>
          <ul className="space-y-3 font-light text-sm">
            <li><Link to="/image-detection" className="hover:text-sky-400 transition-colors">Image Scanner</Link></li>
            <li><Link to="/video-detection" className="hover:text-sky-400 transition-colors">Video Scanner</Link></li>
            <li><Link to="/how-to-use" className="hover:text-sky-400 transition-colors">Documentation</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Company</h3>
          <ul className="space-y-3 font-light text-sm">
            <li><Link to="/about" className="hover:text-sky-400 transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-sky-400 transition-colors">Contact / Support</Link></li>
            <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors">Open Source Repo</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Legal</h3>
          <ul className="space-y-3 font-light text-sm">
            <li><Link to="/terms-privacy" className="hover:text-sky-400 transition-colors">Terms of Service</Link></li>
            <li><Link to="/terms-privacy" className="hover:text-sky-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-privacy" className="hover:text-sky-400 transition-colors">Data Ethics</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs font-light text-slate-500">
        <p>&copy; {new Date().getFullYear()} ATHEIA Deepfake Detection. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Powered by Neural Analytics</p>
      </div>
    </footer>
  );
}
