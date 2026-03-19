'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { DiscoverView } from '@/components/DiscoverView';
import { DistributeWizard } from '@/components/DistributeWizard';
import { ActivityView } from '@/components/ActivityView';
import { CampaignDetail } from '@/components/CampaignDetail';
import { Campaign } from '@/app/api/campaigns/route';
import { Compass, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';

function AppContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeView = searchParams.get('view') || 'discover';

    const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
    const [selectedCampaignData, setSelectedCampaignData] = useState<Campaign | null>(null);

    const handleNavigate = (view: string) => {
        router.push(`/?view=${view}`);
        setSelectedCampaignId(null);
    };

    useEffect(() => {
        if (selectedCampaignId) {
            // Fetch the entire campaign object if selected
            fetch('/api/campaigns')
                .then(res => res.json())
                .then((data: Campaign[]) => {
                    const found = data.find(c => c.on_chain_id === selectedCampaignId);
                    if (found) setSelectedCampaignData(found);
                })
                .catch(console.error);
        } else {
            setSelectedCampaignData(null);
        }
    }, [selectedCampaignId]);

    const renderView = () => {
        switch (activeView) {
            case 'distribute': return <DistributeWizard />;
            case 'activity': return <ActivityView />;
            case 'discover':
            default: return <DiscoverView onCampaignSelect={setSelectedCampaignId} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#030303] text-gray-300 font-sans selection:bg-indigo-500/30 selection:text-white">
            <Navbar activeView={activeView} onViewChange={handleNavigate} />

            <main className="flex-1 flex pt-16">
                <Sidebar activeView={activeView} onNavigate={handleNavigate} />
                
                <section className="flex-1 overflow-y-auto no-scrollbar relative">
                    <div className="p-6 md:p-12 pb-32 md:pb-12 min-h-full">
                        {renderView()}
                    </div>

                    <AnimatePresence>
                        {selectedCampaignData && (
                            <CampaignDetail
                                campaign={selectedCampaignData}
                                onBack={() => setSelectedCampaignId(null)}
                            />
                        )}
                    </AnimatePresence>
                </section>
            </main>

            {/* Mobile Bottom Tab Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-2 py-3 pb-safe">
                <button
                    onClick={() => handleNavigate('discover')}
                    className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors",
                        activeView === 'discover' ? "text-indigo-400" : "text-gray-500 hover:text-white"
                    )}
                >
                    <Compass className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Discover</span>
                </button>
                <button
                    onClick={() => handleNavigate('distribute')}
                    className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors",
                        activeView === 'distribute' ? "text-indigo-400" : "text-gray-500 hover:text-white"
                    )}
                >
                    <Zap className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Distribute</span>
                </button>
                <button
                    onClick={() => handleNavigate('activity')}
                    className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors",
                        activeView === 'activity' ? "text-indigo-400" : "text-gray-500 hover:text-white"
                    )}
                >
                    <Activity className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Activity</span>
                </button>
            </nav>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#030303]" />}>
            <AppContent />
        </Suspense>
    );
}
