'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DBCampaign {
    id: number;
    title: string;
    description: string;
    partner_name: string;
    reward_amount: string;
    currency: string;
    status: string;
}

export function ExploreBoard() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<DBCampaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setCampaigns(data);
            }
            setLoading(false);
        };
        fetchCampaigns();
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10 font-sans">

            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-3xl font-light tracking-tight text-white mb-2">Active Objectives</h2>
                    <p className="text-[#888888] text-sm">Select an objective below to view requirements and execute the on-chain verification.</p>
                </div>
                <div className="flex bg-white/5 rounded-full p-1 mt-6 md:mt-0">
                    <button className="px-5 py-2 text-xs font-semibold bg-white text-black rounded-full transition-all">All</button>
                    <button className="px-5 py-2 text-xs font-semibold text-[#888888] hover:text-white transition-colors">Yield</button>
                    <button className="px-5 py-2 text-xs font-semibold text-[#888888] hover:text-white transition-colors">Social</button>
                </div>
            </div>

            {/* Elegant Table/List Container */}
            <div className="flex flex-col w-full border-t border-white/5">
                {/* Headers */}
                <div className="hidden md:grid grid-cols-12 gap-4 py-4 border-b border-white/5 text-xs font-medium uppercase tracking-widest text-[#666666]">
                    <div className="col-span-5">Objective</div>
                    <div className="col-span-3">Protocol</div>
                    <div className="col-span-3">Reward</div>
                    <div className="col-span-1 text-right">Action</div>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-[#888888] italic text-sm font-serif">Loading network data...</div>
                ) : campaigns.length === 0 ? (
                    <div className="py-12 text-center text-[#888888] italic text-sm font-serif">No active deployments found.</div>
                ) : (
                    campaigns.map((campaign, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.5 }}
                            key={campaign.id}
                            onClick={() => router.push(`/quest/${campaign.id}`)}
                            className="group grid grid-cols-1 md:grid-cols-12 gap-4 py-6 md:py-8 border-b border-white/10 hover:border-white/30 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer items-center"
                        >
                            {/* Objective Column */}
                            <div className="col-span-1 md:col-span-5 flex flex-col pr-8">
                                <h3 className="text-xl text-white font-medium mb-2 group-hover:text-[#DDDDDD] transition-colors font-serif italic text-balance">
                                    {campaign.title}
                                </h3>
                                <p className="text-[#888888] text-sm leading-relaxed line-clamp-2 md:line-clamp-1 font-light">
                                    {campaign.description}
                                </p>
                            </div>

                            {/* Protocol Column */}
                            <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center text-xs text-[#888888] uppercase">
                                    {campaign.partner_name.charAt(0)}
                                </div>
                                <span className="text-[#CCCCCC] text-sm font-medium">{campaign.partner_name}</span>
                            </div>

                            {/* Reward Column */}
                            <div className="col-span-1 md:col-span-3 mt-4 md:mt-0 flex items-center gap-2">
                                <span className="text-2xl font-light tracking-tight text-white">{campaign.reward_amount}</span>
                                <span className="text-[#888888] text-sm font-medium">{campaign.currency}</span>
                            </div>

                            {/* Action Column */}
                            <div className="col-span-1 text-right mt-4 md:mt-0 flex justify-end">
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#888888] group-hover:border-white/30 group-hover:text-white transition-all duration-300 group-hover:bg-white/5">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="mt-12 text-center">
                <p className="text-[#666666] text-xs uppercase tracking-widest font-serif italic">End of Directory</p>
            </div>
        </div>
    );
}
