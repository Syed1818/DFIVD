import React from 'react';
import SpaceBackground from '../components/backgrounds/SpaceBackground';

export default function TermsPrivacyPage() {
  return (
    <>
      <SpaceBackground />
      <div className="relative z-10 w-full min-h-screen text-slate-200 font-sans tracking-wide pt-32 px-4 pb-20">
        <div className="max-w-4xl mx-auto backdrop-blur-md bg-slate-900/60 p-10 md:p-16 rounded-[2rem] border border-white/10 shadow-2xl">
          <h1 className="text-4xl font-black mb-4 text-white">Terms of Service & Privacy Policy</h1>
          <p className="text-sm font-light text-slate-400 mb-12">Last Updated: September 2026</p>
          
          <div className="space-y-10 font-light leading-relaxed">
            <section className="bg-slate-800/30 p-8 rounded-2xl border border-white/5">
              <h2 className="text-2xl font-bold mb-4 text-sky-400">1. Data Processing and Privacy (Zero Retention)</h2>
              <p className="mb-4">
                At ATHEIA, we take data privacy seriously. Any media uploaded to our servers for forensic analysis is strictly processed in memory. <strong className="text-white">We do not persist, store, or distribute your images or videos.</strong> Once the neural analysis is complete and the inference results are returned to your client, all associated files are immediately flushed from our volatile memory.
              </p>
              <p>
                We collect anonymous telemetry regarding inference times, bandwidth utilization, and high-level model confidence scores strictly to improve our systems. This telemetry cannot be tied to any uploaded media or specific IP addresses.
              </p>
            </section>

            <section className="bg-slate-800/30 p-8 rounded-2xl border border-white/5">
              <h2 className="text-2xl font-bold mb-4 text-sky-400">2. Acceptable Use Policy</h2>
              <p className="mb-4">
                The ATHEIA platform is intended for educational, forensic, and research purposes. You agree not to use the service to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-300 ml-2">
                <li>Analyze illicit, illegal, or non-consensual media.</li>
                <li>Attempt to reverse-engineer, decompile, or extract the neural network weights.</li>
                <li>Launch Denial of Service (DoS) attacks against our inference endpoints.</li>
                <li>Embed our API in commercial products without prior authorization.</li>
              </ul>
              <p className="mt-4">
                We reserve the right to immediately rate-limit or permanently ban IP addresses that violate these terms.
              </p>
            </section>

            <section className="bg-slate-800/30 p-8 rounded-2xl border border-white/5">
              <h2 className="text-2xl font-bold mb-4 text-sky-400">3. Disclaimer of Liability</h2>
              <p className="mb-4">
                While our neural networks represent the state-of-the-art in synthetic media detection, <strong className="text-white">no AI detection tool is 100% infallible</strong>. Adversarial attacks and novel generative models can occasionally bypass detection (false negatives), and unusual compression artifacts can cause authentic media to be flagged (false positives).
              </p>
              <p className="italic text-slate-400 text-sm border-l-4 border-sky-500/50 pl-4 py-2">
                "The probability scores and forensic heatmaps provided by ATHEIA should not be used as the sole basis for definitive legal, professional, journalistic, or personal claims. We provide this tool 'as is' without any warranties of absolute accuracy."
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
