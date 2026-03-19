'use client';

import { motion } from 'framer-motion';
import { Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignCardProps {
    campaign: {
        id: number;
        title: string;
        partner_name: string;
        reward_amount: string;
        currency: string;
        description: string;
        token_address?: string;
        max_claims: number;
        claims_count: number;
        expiry_date?: string;
        criteria_type?: 'token_balance' | 'nft_hold' | 'contract_call';
    };
    onClick: (id: number) => void;
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
    const progress = (campaign.claims_count / campaign.max_claims) * 100;
    
    // Default criteria type if not provided
    const criteria = campaign.criteria_type || 'token_balance';

    const borderColors = {
        token_balance: 'border-l-blue-500',
        nft_hold: 'border-l-purple-500',
        contract_call: 'border-l-teal-500',
    };

    return (
        <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            onClick={() => onClick(campaign.id)}
            className={cn(
                "group relative bg-[#0A0A0B] border border-white/5 border-l-4 rounded-xl p-5 cursor-pointer transition-all duration-300",
                "hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]",
                borderColors[criteria]
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {/* If we had a real logo URL, we'd use it here */}
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20" />
                        <span className="absolute text-xs font-bold text-white/50">{campaign.currency.charAt(0)}</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{campaign.partner_name}</span>
                        </div>
                        <div className="text-2xl font-medium text-white tracking-tight">
                            {campaign.reward_amount} <span className="text-gray-500 text-sm font-normal">{campaign.currency}</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/5 p-1.5 rounded-lg text-gray-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-indigo-100 transition-colors">
                {campaign.title}
            </h3>
            
            <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed">
                {campaign.description}
            </p>

            {/* Progress Bar */}
            <div className="space-y-2 mb-6">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-gray-500">Claim Progress</span>
                    <span className="text-white">{campaign.claims_count} / {campaign.max_claims} <span className="text-gray-500">Claimed</span></span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {criteria.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 5 days left
                    </span>
                </div>
                
                <div className="text-xs font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Claim Reward <ExternalLink className="w-3 h-3" />
                </div>
            </div>
        </motion.div>
    );
}
