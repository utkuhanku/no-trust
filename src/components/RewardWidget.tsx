'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MerchantDashboard } from './MerchantDashboard';
import { HunterDashboard } from './HunterDashboard';
import { Sparkles, Briefcase } from 'lucide-react';

type Tab = 'hunter' | 'merchant';

export function RewardWidget() {
    const [activeTab, setActiveTab] = useState<Tab>('hunter');

    return (
        <div className="w-full max-w-[440px] mx-auto mt-6 md:mt-10 relative z-20">

            {/* Sleek Segmented Control */}
            <div className="flex bg-[#0A0A0B] border border-white/5 p-1 rounded-[20px] mb-4 relative shadow-inner">
                <div className="flex w-full relative z-10">
                    <button
                        onClick={() => setActiveTab('hunter')}
                        className={cn("flex-1 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2",
                            activeTab === 'hunter' ? 'bg-[#18181B] text-white shadow-sm border border-white/10' : 'text-[#888888] hover:text-[#CCCCCC]'
                        )}
                    >
                        <Sparkles className={cn("w-4 h-4", activeTab === 'hunter' ? 'text-indigo-400' : '')} />
                        Discover Rewards
                    </button>
                    <button
                        onClick={() => setActiveTab('merchant')}
                        className={cn("flex-1 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2",
                            activeTab === 'merchant' ? 'bg-[#18181B] text-white shadow-sm border border-white/10' : 'text-[#888888] hover:text-[#CCCCCC]'
                        )}
                    >
                        <Briefcase className={cn("w-4 h-4", activeTab === 'merchant' ? 'text-indigo-400' : '')} />
                        Distribute
                    </button>
                </div>
            </div>

            {/* Main Glass Widget */}
            <div className="glass-panel rounded-[32px] p-6 relative overflow-hidden min-h-[520px] shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col">
                <div key={activeTab} className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both flex-grow">
                    {activeTab === 'hunter' ? <HunterDashboard /> : <MerchantDashboard />}
                </div>
            </div>

        </div>
    );
}
