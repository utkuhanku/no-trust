'use client';

import { Navbar } from '@/components/Navbar';
import { RewardWidget } from '@/components/RewardWidget';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#030303] overflow-hidden relative text-[#EBEBEB] font-sans">
      <Navbar />

      <main className="flex-grow flex flex-col items-center w-full relative z-10 px-4">

        {/* Hero Text */}
        <div className="text-center mt-8 md:mt-12 z-20 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-gray-300 uppercase">No-Trust Campaigns</span>
          </div>

          <h1 className="text-4xl md:text-6xl tracking-tight leading-[1.1] font-medium mb-4 text-white max-w-2xl mx-auto">
            Verify actions. <br className="hidden md:block" />
            <span className="text-gray-500">Distribute rewards instantly.</span>
          </h1>
        </div>

        {/* The Core Widget */}
        <RewardWidget />

      </main>

      {/* Extreme ambient lighting for "Void" aesthetics */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none opacity-50 z-0 mix-blend-screen" />
    </div>
  );
}
