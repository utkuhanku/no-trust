'use client';

import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { Home, PlusCircle, History, LayoutGrid } from 'lucide-react';
import { useView } from '@/context/ViewContext';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const { activeView, setActiveView } = useView();

    const handleViewChange = (view: any) => {
        setActiveView(view);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#030303] text-[#EBEBEB]">
            <Navbar activeView={activeView} onViewChange={handleViewChange} />

            <div className="flex flex-1 pt-16 h-screen overflow-hidden">
                <Sidebar />

                <main className="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-0 md:ml-60">
                    <div className="max-w-7xl mx-auto p-6 md:p-10">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Tab Bar */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm h-16 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-around px-6 z-50">
                <MobileTabItem
                    icon={<LayoutGrid className="w-5 h-5" />}
                    active={activeView === 'discover'}
                    onClick={() => handleViewChange('discover')}
                />
                <MobileTabItem
                    icon={<PlusCircle className="w-5 h-5" />}
                    active={activeView === 'distribute'}
                    onClick={() => handleViewChange('distribute')}
                />
                <MobileTabItem
                    icon={<History className="w-5 h-5" />}
                    active={activeView === 'activity'}
                    onClick={() => handleViewChange('activity')}
                />
                <MobileTabItem
                    icon={<Home className="w-5 h-5" />}
                    active={activeView === 'home'}
                    onClick={() => handleViewChange('home')}
                />
            </div>
        </div>
    );
}

function MobileTabItem({ icon, active, onClick }: { icon: React.ReactNode; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                active ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-gray-500"
            )}
        >
            {icon}
        </button>
    );
}
