'use client';

import { useEffect, useState } from 'react';
import { CampaignCard } from './CampaignCard';
import { Search, Filter, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DiscoverView({ onCampaignSelect }: { onCampaignSelect: (id: number) => void }) {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await fetch('/api/campaigns');
                const data = await res.json();
                if (!data.error) {
                    setCampaigns(data);
                }
            } catch (err) {
                console.error('Failed to fetch campaigns:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    const filteredCampaigns = campaigns.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.partner_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Live Rewards</span>
                    </div>
                    <h1 className="text-4xl font-medium tracking-tight text-white italic">Discover Opportunities</h1>
                    <p className="text-gray-500 max-w-xl">
                        Browse active reward distributions on Base. Meet the criteria, verify trustlessly, and claim your tokens instantly.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-full md:w-64 transition-all"
                        />
                    </div>
                    <button className="p-2 border border-white/10 rounded-full hover:bg-white/5 transition-colors text-gray-400">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Grid Section */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-64 bg-white/5 rounded-xl animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/5 rounded-2xl border-dashed">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">No campaigns found</h3>
                    <p className="text-gray-500">Try adjusting your search or check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-20">
                    <AnimatePresence mode="popLayout">
                        {filteredCampaigns.map((campaign, index) => (
                            <motion.div
                                key={campaign.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <CampaignCard 
                                    campaign={campaign} 
                                    onClick={onCampaignSelect} 
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
