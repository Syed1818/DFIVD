import React from 'react';
import SpaceBackground from '../components/backgrounds/SpaceBackground';

export default function TermsPrivacyPage() {
  return (
    <>
      <SpaceBackground />
      <div className="relative z-10 w-full min-h-screen text-slate-200 font-sans tracking-wide pt-32 px-4 pb-20">
        <div className="max-w-4xl mx-auto backdrop-blur-md bg-slate-900/60 p-10 md:p-16 rounded-[2rem] border border-white/10 shadow-2xl">
          <h1 className="text-4xl font-black mb-8 text-white">Terms of Service & Privacy Policy</h1>
          
          <div className="space-y-8 font-light leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-sky-400">1. Data Processing and Privacy</h2>
              <p className="mb-4">
                At ATHEIA, we take data privacy seriously. Any media uploaded to our servers for forensic analysis is strictly processed in memory. We do not persist, store, or distribute your images or videos. Once the neural analysis is complete and the inference results are returned to your client, all associated files are immediately flushed from our servers.
              </p>
              <p>
                We collect anonymous telemetry regarding inference times and model confidence to improve our systems, but this data cannot be tied to any uploaded media.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-sky-400">2. Acceptable Use</h2>
              <p>
                The ATHEIA platform is intended for educational, forensic, and research purposes. You agree not to use the service to analyze illicit, illegal, or non-consensual media. We reserve the right to rate-limit or ban IP addresses that abuse the API or attempt to reverse-engineer the detection models.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-sky-400">3. Disclaimer of Liability</h2>
              <p>
                While our neural networks are highly accurate, no AI detection tool is infallible. The probability scores and forensic heatmaps provided by ATHEIA should not be used as the sole basis for definitive legal, professional, or personal claims. We provide this tool "as is" without any warranties of absolute accuracy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
