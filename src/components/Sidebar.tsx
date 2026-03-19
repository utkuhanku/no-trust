'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BarChart3, Users, Zap, CheckCircle2 } from 'lucide-react';

interface Stats {
    activeCampaigns: number;
    totalLocked: number;
    claimsToday: number;
    successRate: number;
}

interface ActivityEvent {
    id: string;
    address: string;
    amount: string;
    token: string;
    time: string;
    timestamp: number;
}

export function Sidebar() {
    const [stats, setStats] = useState<Stats>({
        activeCampaigns: 12,
        totalLocked: 24500,
        claimsToday: 142,
        successRate: 99.8
    });

    const [activities, setActivities] = useState<ActivityEvent[]>([
        { id: '1', address: '0x1234...abcd', amount: '50', token: 'USDC', time: '2m ago', timestamp: Date.now() - 120000 },
        { id: '2', address: '0xabcd...5678', amount: '500', token: 'DEGEN', time: '5m ago', timestamp: Date.now() - 300000 },
        { id: '3', address: '0x7890...efgh', amount: '0.05', token: 'ETH', time: '8m ago', timestamp: Date.now() - 480000 },
    ]);

    useEffect(() => {
        // Fetch real stats from Supabase
        const fetchStats = async () => {
            const { data: campaigns } = await supabase.from('campaigns').select('id').eq('status', 'active');
            const { data: claimsToday } = await supabase.from('claims')
                .select('id')
                .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString());

            if (campaigns) {
                setStats(prev => ({ ...prev, activeCampaigns: campaigns.length }));
            }
            if (claimsToday) {
                setStats(prev => ({ ...prev, claimsToday: claimsToday.length }));
            }
        };

        fetchStats();

        // Simulate live activity refreshing (in a real app, this would be a Supabase subscription)
        const interval = setInterval(() => {
            // Optional: fetch real latest claims
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <aside className="hidden md:flex flex-col w-60 h-[calc(100vh-4rem)] fixed left-0 top-16 border-r border-white/5 bg-black/20 backdrop-blur-sm p-6 overflow-y-auto no-scrollbar">
            {/* Stats Section */}
            <div className="space-y-6 mb-10">
                <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Platform Stats</span>
                </div>

                <div className="grid gap-4">
                    <StatItem label="Active Campaigns" value={stats.activeCampaigns} icon={<Zap className="w-3 h-3" />} />
                    <StatItem label="Total Locked" value={`$${stats.totalLocked.toLocaleString()}`} icon={<Users className="w-3 h-3" />} />
                    <StatItem label="Claims Today" value={stats.claimsToday} icon={<CheckCircle2 className="w-3 h-3" />} />
                    <StatItem label="Success Rate" value={`${stats.successRate}%`} icon={<Activity className="w-3 h-3" />} />
                </div>
            </div>

            {/* Live Activity Feed */}
            <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Live Activity</span>
                </div>

                <div className="space-y-3">
                    <AnimatePresence initial={false}>
                        {activities.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 group-hover:bg-green-500 transition-colors" />
                                    <span className="text-xs font-mono text-gray-300">{event.address}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[13px] font-bold text-white">
                                        {event.amount} <span className="text-gray-500 font-medium">{event.token}</span>
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-medium">{event.time}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </aside>
    );
}

function StatItem({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
    return (
        <div className="group">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                {icon}
                {label}
            </div>
            <div className="text-xl font-medium text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                {value}
            </div>
        </div>
    );
}
