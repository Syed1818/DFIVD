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
      <div className="relative z-10 w-full min-h-screen text-slate-100 font-sans tracking-wide pt-32 px-4 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="backdrop-blur-xl bg-slate-900/50 p-8 rounded-[2rem] border border-white/10 shadow-2xl">
              <h2 className="text-3xl font-black mb-6 text-white">Get in Touch</h2>
              <p className="text-slate-400 font-light mb-8">
                Interested in enterprise API access, research collaboration, or media inquiries? Reach out to our team.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="text-sky-400 text-xl mt-1">📍</div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest">Headquarters</h3>
                    <p className="text-slate-400 font-light text-sm mt-1">Neural Labs Inc.<br/>101 Cognitive Way<br/>San Francisco, CA 94105</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="text-sky-400 text-xl mt-1">✉️</div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest">Email</h3>
                    <p className="text-slate-400 font-light text-sm mt-1">contact@atheia-ai.com<br/>research@atheia-ai.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3 backdrop-blur-xl bg-slate-900/50 p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-2xl">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-8 rounded-xl text-center animate-in fade-in duration-300">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-2">Transmission Successful</h3>
                <p className="text-sm font-light">Our team will review your inquiry and respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Full Name</label>
                    <input required type="text" className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="Jane Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Email Address</label>
                    <input required type="email" className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="jane@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Inquiry Type</label>
                  <select className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors appearance-none">
                    <option>General Support</option>
                    <option>Enterprise API Access</option>
                    <option>Research Collaboration</option>
                    <option>Media Inquiry</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Message</label>
                  <textarea required rows="5" className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500 transition-colors resize-none" placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold tracking-widest uppercase text-sm py-4 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all cursor-pointer">
                  Send Secure Message
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
