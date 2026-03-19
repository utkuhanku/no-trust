'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    History, 
    Trophy, 
    Rocket, 
    Clock, 
    CheckCircle2, 
    ExternalLink, 
    TrendingUp, 
    User,
    ArrowUpRight,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { supabase } from '@/lib/supabase';

export function MyActivityView() {
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState<'claimed' | 'created' | 'eligible'>('claimed');
    const [data, setData] = useState({
        claimed: [],
        created: [],
        eligible: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isConnected || !address) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch claimed rewards
                const { data: claims } = await supabase
                    .from('claims')
                    .select('*, campaigns(*)')
                    .eq('user_address', address.toLowerCase());

                // Fetch created campaigns (assuming creator address is in partner_name or we might need a creator field)
                // For now, let's mock or filter by a specific field if it exists
                const { data: created } = await supabase
                    .from('campaigns')
                    .select('*')
                    .order('created_at', { ascending: false });

                setData({
                    claimed: (claims || []).map((c: any) => ({
                        id: c.id,
                        title: c.campaigns.title,
                        amount: c.amount, // Wei
                        currency: c.campaigns.currency,
                        date: new Date(c.created_at).toLocaleDateString(),
                        status: c.status
                    })),
                    created: (created || []).slice(0, 2).map((c: any) => ({
                        id: c.id,
                        title: c.title,
                        claims: '12/50',
                        pool: '250 USDC',
                        status: 'Active'
                    })),
                    eligible: (created || []).slice(2, 4).map((c: any) => ({
                        id: c.id,
                        title: c.title,
                        amount: c.reward_amount,
                        currency: c.currency,
                        reason: 'Hold ≥ 1,000 USDC'
                    }))
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isConnected, address]);

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6">
                    <User className="w-10 h-10 text-gray-600" />
                </div>
                <h2 className="text-2xl font-medium text-white mb-2 italic">Connect Wallet</h2>
                <p className="text-gray-500 mb-8 max-w-xs text-center">
                    Please connect your wallet to view your rewards, campaigns, and eligibility.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-medium tracking-tight text-white italic">My Activity</h1>
                    <p className="text-gray-500">Track your participation and manage your reward distributions.</p>
                </div>

                <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-full p-1">
                    <TabButton active={activeTab === 'claimed'} onClick={() => setActiveTab('claimed')} label="Claimed" count={data.claimed.length} />
                    <TabButton active={activeTab === 'created'} onClick={() => setActiveTab('created')} label="Created" count={data.created.length} />
                    <TabButton active={activeTab === 'eligible'} onClick={() => setActiveTab('eligible')} label="Eligible" count={data.eligible.length} />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard label="Total Claimed" value="$120.50" icon={<TrendingUp className="w-4 h-4 text-green-400" />} />
                <SummaryCard label="Active Campaigns" value="2" icon={<Rocket className="w-4 h-4 text-indigo-400" />} />
                <SummaryCard label="Success Rate" value="100%" icon={<CheckCircle2 className="w-4 h-4 text-blue-400" />} />
            </div>

            {/* Content List */}
            <div className="bg-[#0A0A0B] border border-white/5 rounded-3xl overflow-hidden min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="p-1 px-4"
                    >
                        {loading ? (
                            <div className="py-20 text-center text-gray-600 italic">Synchronizing with Base...</div>
                        ) : data[activeTab].length === 0 ? (
                            <EmptyState tab={activeTab} />
                        ) : (
                            <div className="divide-y divide-white/5">
                                {data[activeTab].map((item: any, i: number) => (
                                    <ActivityItem key={item.id} type={activeTab} item={item} index={i} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label, count }: { active: boolean, onClick: () => void, label: string, count: number }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-5 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-2",
                active ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
            )}
        >
            {label}
            <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                active ? "bg-black/10 text-black" : "bg-white/5 text-gray-500"
            )}>
                {count}
            </span>
        </button>
    );
}

function SummaryCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-indigo-500/10 transition-colors" />
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                {icon}
                {label}
            </div>
            <div className="text-3xl font-medium text-white tracking-tight">{value}</div>
        </div>
    );
}

function ActivityItem({ type, item, index }: { type: string, item: any, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex items-center justify-between py-6 hover:bg-white/[0.02] -mx-4 px-8 transition-colors cursor-pointer"
        >
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500 transition-all group-hover:rotate-6">
                    {type === 'claimed' ? <History className="w-5 h-5" /> : type === 'created' ? <Rocket className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                </div>
                <div>
                    <h3 className="text-lg font-medium text-white leading-none mb-1.5">{item.title}</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.date || item.status}
                        </span>
                        {type === 'eligible' && (
                            <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-widest">
                                {item.reason}
                            </span>
                        )}
                        {type === 'created' && (
                            <span className="text-xs text-gray-500">
                                Claims: <span className="text-white font-bold">{item.claims}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <div className="text-xl font-medium text-white">{item.amount || item.pool} <span className="text-sm text-gray-600">{item.currency || ''}</span></div>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-600 group-hover:border-indigo-500 group-hover:text-white transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                </div>
            </div>
        </motion.div>
    );
}

function EmptyState({ tab }: { tab: string }) {
    const content = {
        claimed: { title: "No rewards claimed yet", desc: "Start exploring campaigns and complete your first objective.", button: "Browse Campaigns" },
        created: { title: "No campaigns created", desc: "Be the first to distribute rewards to your community.", button: "Distribute Reward" },
        eligible: { title: "No pending eligibility", desc: "You've claimed all rewards you qualify for. Check back later!", button: "Discover More" }
    };
    
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-700" />
            </div>
            <h3 className="text-xl font-medium text-white mb-1">{content[tab].title}</h3>
            <p className="text-gray-500 mb-8 max-w-xs">{content[tab].desc}</p>
            <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-bold text-white hover:bg-white/10 transition-all">
                {content[tab].button}
            </button>
        </div>
    );
}
