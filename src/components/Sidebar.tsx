'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatsResponse } from '@/app/api/stats/route';
import { ActivityResponse, ActivityEvent } from '@/app/api/activity/route';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [activities, setActivities] = useState<ActivityEvent[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats');
                if (res.ok) {
                    setStats(await res.json());
                }
            } catch (err) {}
        };
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await fetch('/api/activity');
                if (res.ok) {
                    const data: ActivityResponse = await res.json();
                    if (data.events) {
                        setActivities(data.events);
                    }
                }
            } catch (err) {}
        };
        fetchActivity();
        const interval = setInterval(fetchActivity, 10000); // 10s
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { id: 'discover', label: 'Discover', icon: <Compass className="w-5 h-5" /> },
        { id: 'distribute', label: 'Distribute', icon: <Zap className="w-5 h-5" /> },
        { id: 'activity', label: 'My Activity', icon: <Activity className="w-5 h-5" /> }
    ];

    return (
        <aside className="hidden md:flex flex-col w-60 h-full border-r border-white/5 bg-black/40 backdrop-blur-3xl sticky top-16 left-0">
            <div className="flex-1 overflow-y-auto no-scrollbar py-8 px-4 space-y-8">
                {/* Navigation */}
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                                activeView === item.id 
                                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]" 
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="h-px bg-white/5" />

                {/* Stats */}
                <div className="space-y-4 px-2">
                    <h3 className="text-[11px] uppercase tracking-[0.15em] text-gray-500 font-bold">Platform Stats</h3>
                    <div className="space-y-4">
                        <StatItem label="Active Campaigns" value={stats?.activeCampaigns.toString() || '0'} />
                        <StatItem label="Total Locked" value={`$${(stats?.totalLocked || 0).toLocaleString()}`} />
                        <StatItem label="Claims Today" value={stats?.claimsToday.toString() || '0'} />
                        <StatItem label="Success Rate" value={`${stats?.successRate || 100}%`} />
                    </div>
                </div>

                <div className="h-px bg-white/5" />

                {/* Live Activity */}
                <div className="space-y-4 px-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <h3 className="text-[11px] uppercase tracking-[0.15em] text-gray-500 font-bold">Live Activity</h3>
                    </div>
                    <div className="space-y-4">
                        <AnimatePresence initial={false}>
                            {activities.map((event, i) => (
                                <motion.div
                                    key={`${event.user_address}-${event.created_at}-${i}`}
                                    initial={{ opacity: 0, x: -20, height: 0 }}
                                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                                    exit={{ opacity: 0, scale: 0.9, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-gray-300 leading-tight">
                                            <span className="font-mono text-xs text-indigo-400">0x{event.user_address.slice(2,6)}...{event.user_address.slice(-4)}</span>
                                            {' '}claimed <span className="text-white font-medium">{event.reward_per_user} {event.token_symbol}</span>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {getTimeAgo(event.created_at)}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {activities.length === 0 && (
                            <div className="text-xs text-gray-600 italic">Listening for events...</div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}

function StatItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center group cursor-default">
            <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{label}</span>
            <span className="text-sm font-mono text-white group-hover:text-indigo-400 transition-colors">{value}</span>
        </div>
    );
}

function getTimeAgo(dateString: string) {
    const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    return `${Math.floor(diff/3600)}h ago`;
}
