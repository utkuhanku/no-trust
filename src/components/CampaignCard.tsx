'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Campaign } from '@/app/api/campaigns/route';

interface CampaignCardProps {
    campaign: Campaign;
    onClick: () => void;
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
    const borderColor = 
        campaign.criteria_type === 'token_balance' ? 'border-l-blue-500' :
        campaign.criteria_type === 'nft_hold' ? 'border-l-purple-500' :
        'border-l-teal-500';

    const bgColor = 
        campaign.criteria_type === 'token_balance' ? 'bg-blue-500/10' :
        campaign.criteria_type === 'nft_hold' ? 'bg-purple-500/10' :
        'bg-teal-500/10';

    const progress = campaign.max_claims > 0 
        ? Math.min((campaign.current_claims / campaign.max_claims) * 100, 100) 
        : 0;

    return (
        <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            transition={{ duration: 0.15 }}
            onClick={onClick}
            className={cn(
                "group relative bg-[#13141A] hover:bg-[#1A1B23] border border-white/5 rounded-2xl p-5 cursor-pointer overflow-hidden transition-all",
                "border-l-[3px]",
                borderColor,
                "hover:border-indigo-500/50 hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.2)]"
            )}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg">
                    {campaign.token_symbol.charAt(0)}
                </div>
                <div className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded text-white",
                    bgColor
                )}>
                    {campaign.criteria_type.replace('_', ' ')}
                </div>
            </div>

            <div className="space-y-1 mb-6">
                <div className="text-2xl font-medium text-white tracking-tight flex items-baseline gap-1.5">
                    {campaign.reward_per_user} <span className="text-sm text-gray-400">{campaign.token_symbol}</span>
                </div>
                <h3 className="text-lg font-semibold text-white leading-tight line-clamp-1">{campaign.title}</h3>
            </div>

            <div className="space-y-2 mb-6">
                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>{campaign.current_claims} claimed</span>
                    <span>{campaign.max_claims} total</span>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="flex justify-between items-end border-t border-white/5 pt-4">
                <div className="space-y-1">
                    <div className="flex gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">
                            Verified
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">
                            Trustless
                        </span>
                    </div>
                    <TimeRemaining endsAt={campaign.ends_at} />
                </div>
                
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-500 group-hover:text-white transition-all text-gray-500">
                    <ArrowUpRight className="w-4 h-4" />
                </div>
            </div>
        </motion.div>
    );
}

function TimeRemaining({ endsAt }: { endsAt: string }) {
    if (!endsAt) return null;
    
    // Quick calculation for display
    const diff = new Date(endsAt).getTime() - new Date().getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    let color = 'text-gray-500';
    let text = `${Math.floor(hours / 24)} days left`;
    
    if (hours < 24) {
        color = 'text-red-400';
        text = `${hours} hours left`;
    } else if (hours < 72) {
        color = 'text-amber-400';
    }
    
    return (
        <div className={cn("text-xs font-medium", color)}>
            {diff > 0 ? text : 'Ended'}
        </div>
    );
}
