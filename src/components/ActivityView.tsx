'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trophy, Rocket, Clock, ArrowUpRight, User, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ClaimRecord {
  id: string;
  title: string;
  amount: string;
  currency: string;
  date: string;
  status: string;
  tx_hash?: string;
}

interface CreatedCampaign {
  id: string;
  on_chain_id: number;
  title: string;
  pool_amount: string;
  token_symbol: string;
  token_decimals: number;
  current_claims: number;
  max_claims: number;
  is_active: boolean;
  tx_hash: string | null;
  ends_at: string | null;
}

interface ActivityData {
  claimed: ClaimRecord[];
  created: CreatedCampaign[];
}

export function ActivityView() {
    const { address, isConnected } = useAccount();
    const [data, setData] = useState<ActivityData>({ claimed: [], created: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isConnected || !address) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: claimsData } = await supabase
                    .from('claim_records')
                    .select('*, campaign:campaign_id ( title, token_symbol )')
                    .eq('user_address', address.toLowerCase());

                const claims: ClaimRecord[] = (claimsData || []).map((c: any) => ({
                    id: c.id,
                    title: c.campaign?.title || 'Unknown',
                    amount: c.amount,
                    currency: c.campaign?.token_symbol || 'TOKEN',
                    date: new Date(c.created_at).toLocaleDateString(),
                    status: c.status,
                    tx_hash: c.tx_hash
                }));

                const { data: campaignsData } = await supabase
                    .from('campaigns')
                    .select('*')
                    .eq('creator_address', address.toLowerCase());
                
                const created: CreatedCampaign[] = (campaignsData || []).map((c: any) => c as CreatedCampaign);

                setData({ claimed: claims, created });
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
            <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-700">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6">
                    <User className="w-8 h-8 text-gray-500" />
                </div>
                <h2 className="text-2xl font-medium text-white mb-2 italic">Connect Wallet</h2>
                <p className="text-gray-500 text-center max-w-sm">Connect your wallet to see your activity on No-Trust.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
            <div className="space-y-2">
                <h1 className="text-4xl font-medium tracking-tight text-white italic">My Activity</h1>
                <p className="text-gray-500">Track your participation and manage your reward distributions.</p>
            </div>

            <div className="space-y-6">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 flex items-center gap-2">
                    <History className="w-4 h-4" /> Rewards You Claimed
                </h3>
                
                {loading ? (
                    <div className="p-8 text-center text-gray-600">Loading...</div>
                ) : data.claimed.length === 0 ? (
                    <div className="p-10 border border-white/5 rounded-2xl bg-[#13141A] text-center">
                        <p className="text-gray-500 mb-4">No rewards claimed yet.</p>
                        <a href="/?view=discover" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Discover active campaigns &rarr;</a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.claimed.map(c => (
                            <div key={c.id} className="bg-[#13141A] border border-white/5 rounded-xl p-5 hover:bg-[#1A1B23] transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-white font-semibold">{c.title}</h4>
                                    <span className="text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded text-xs">+{c.amount} {c.currency}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-400">
                                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {c.date}</span>
                                    {c.tx_hash && (
                                        <a href={`https://basescan.org/tx/${c.tx_hash}`} target="_blank" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                            Tx <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 flex items-center gap-2">
                    <Rocket className="w-4 h-4" /> Campaigns You Created
                </h3>

                {loading ? (
                    <div className="p-8 text-center text-gray-600">Loading...</div>
                ) : data.created.length === 0 ? (
                    <div className="p-10 border border-white/5 rounded-2xl bg-[#13141A] text-center">
                        <p className="text-gray-500 mb-4">You haven't created any campaigns.</p>
                        <a href="/?view=distribute" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Distribute Rewards &rarr;</a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.created.map(c => (
                            <div key={c.id} className="bg-[#13141A] border border-white/5 rounded-xl p-5 hover:bg-[#1A1B23] transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-white font-semibold flex-1 pr-4 truncate">{c.title}</h4>
                                    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded", c.is_active ? "bg-green-500/10 text-green-400" : "bg-white/10 text-gray-500")}>
                                        {c.is_active ? 'Active' : 'Ended'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <div className="text-gray-400">
                                        Claims: <span className="text-white font-bold">{c.current_claims}/{c.max_claims}</span>
                                    </div>
                                    <div className="text-gray-400">
                                        Pool: <span className="text-white font-bold">{Number(c.pool_amount) / (10**c.token_decimals)} {c.token_symbol}</span>
                                    </div>
                                </div>
                                {c.is_active && (
                                    <button className="mt-4 w-full py-2 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-colors">
                                        Deactivate
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
