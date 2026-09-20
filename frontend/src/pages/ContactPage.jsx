import React, { useState } from 'react';
import RippleBackground from '../components/backgrounds/RippleBackground';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <>
      <RippleBackground />
      <div className="relative z-10 w-full min-h-screen text-slate-100 font-sans tracking-wide flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-2xl backdrop-blur-xl bg-slate-900/50 p-10 md:p-14 rounded-[2rem] border border-white/10 shadow-2xl">
          <h1 className="text-4xl font-black mb-2 text-center">Get in Touch</h1>
          <p className="text-slate-400 text-center mb-10 font-light">
            Have questions about ATHEIA or interested in enterprise API access?
          </p>

          {sent ? (
            <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 p-6 rounded-xl text-center animate-in fade-in zoom-in duration-300">
              <h3 className="text-xl font-bold mb-2">Transmission Successful</h3>
              <p className="text-sm font-light">Our team will review your inquiry and respond shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Name</label>
                  <input required type="text" className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Email</label>
                  <input required type="email" className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="jane@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Message</label>
                <textarea required rows="4" className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold tracking-widest uppercase text-sm py-4 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all cursor-pointer">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
