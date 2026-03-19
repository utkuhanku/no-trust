'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ExternalLink, CheckCircle, ArrowRight, ShieldCheck, Database, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

interface CampaignDetailProps {
    campaignId: number | null;
    onClose: () => void;
}

export function CampaignDetail({ campaignId, onClose }: CampaignDetailProps) {
    const { address, isConnected } = useAccount();
    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [claimState, setClaimState] = useState<'idle' | 'verifying' | 'claiming' | 'success'>('idle');
    const [steps, setSteps] = useState<{ id: string, text: string, status: 'pending' | 'active' | 'done', value?: string }[]>([
        { id: 'rpc', text: 'Connecting to Base RPC', status: 'pending' },
        { id: 'state', text: 'Reading contract state', status: 'pending' },
        { id: 'criteria', text: 'Criteria verified trustlessly', status: 'pending' },
        { id: 'sign', text: 'Backend signed your proof', status: 'pending' },
        { id: 'submit', text: 'Submitting claim to contract', status: 'pending' }
    ]);

    useEffect(() => {
        if (!campaignId) return;

        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/campaigns`); // In a real app, /api/campaigns/[id]
                const data = await res.json();
                const found = data.find((c: any) => c.id === campaignId);
                setCampaign(found);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [campaignId]);

    const handleCheckEligibility = async () => {
        if (!isConnected) {
            toast.error('Please connect your wallet first');
            return;
        }

        setClaimState('verifying');
        setSteps(s => s.map(step => ({ ...step, status: 'pending' })));

        // Step-by-step simulation (as requested)
        const updateStep = (id: string, status: 'active' | 'done', value?: string) => {
            setSteps(prev => prev.map(s => s.id === id ? { ...s, status, value } : s));
        };

        // Step 1
        updateStep('rpc', 'active');
        await new Promise(r => setTimeout(r, 800));
        updateStep('rpc', 'done');

        // Step 2
        updateStep('state', 'active');
        await new Promise(r => setTimeout(r, 1200));
        updateStep('state', 'done', `0x${address?.slice(2, 6)}...${address?.slice(-4)}`);

        // Step 3
        updateStep('criteria', 'active');
        await new Promise(r => setTimeout(r, 1500));
        updateStep('criteria', 'done', 'VERIFIED ✓');

        // Step 4
        setClaimState('claiming');
        updateStep('sign', 'active');
        await new Promise(r => setTimeout(r, 1000));
        updateStep('sign', 'done', 'EIP-191 SIGNED');

        // Step 5
        updateStep('submit', 'active');
        await new Promise(r => setTimeout(r, 2000));
        updateStep('submit', 'done', 'SENT');

        setClaimState('success');
        toast.success('Reward claimed successfully!');
    };

    if (!campaignId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-xl h-full bg-[#050505] border-l border-white/5 shadow-2xl overflow-y-auto no-scrollbar"
            >
                {loading ? (
                    <div className="p-8 space-y-8 h-full flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : campaign && (
                    <div className="p-8 space-y-8">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-500/20">
                                    {campaign.currency.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded inline-block mb-1">
                                        {campaign.partner_name}
                                    </div>
                                    <h2 className="text-3xl font-medium text-white tracking-tight">{campaign.reward_amount} {campaign.currency}</h2>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 border border-white/10 rounded-full hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-2">{campaign.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{campaign.description}</p>
                            
                            <div className="mt-4 flex items-center gap-4 text-xs font-mono text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Database className="w-3.5 h-3.5" />
                                    <span>Creator: 0x833589...2913</span>
                                    <ExternalLink className="w-3 h-3 cursor-pointer hover:text-indigo-400" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Total Pool</div>
                                <div className="text-xl font-medium text-white">5,000 {campaign.currency}</div>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Claimed</div>
                                <div className="text-xl font-medium text-white">{campaign.claims_count} of {campaign.max_claims}</div>
                            </div>
                        </div>

                        {/* Qualification Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                <h4 className="text-sm font-bold uppercase tracking-widest text-white">How to qualify</h4>
                            </div>
                            
                            <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-6 space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                                        <Box className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">Token Balance Threshold</div>
                                        <div className="text-sm text-gray-500 mt-1">You must hold &ge; 1,000 USDC on Base at time of claim.</div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 space-y-2">
                                    <TechRow label="Contract" value="0x833589...2913" link />
                                    <TechRow label="Method" value="balanceOf(address)" />
                                    <TechRow label="Condition" value="result &ge; 1000000" />
                                    <TechRow label="Evaluation" value="Trustlessly, On-chain" />
                                </div>
                            </div>
                        </div>

                        {/* Claim Flow */}
                        <div className="space-y-4">
                            {claimState === 'idle' ? (
                                <button
                                    onClick={handleCheckEligibility}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
                                >
                                    Check My Eligibility
                                </button>
                            ) : (
                                <div className="bg-white/5 border border-indigo-500/20 rounded-2xl p-6 space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Real-time Verification</span>
                                    </div>

                                    <div className="space-y-4">
                                        {steps.map((step, i) => (
                                            <div key={step.id} className={cn(
                                                "flex items-center justify-between transition-all duration-300",
                                                step.status === 'pending' ? "opacity-30" : "opacity-100"
                                            )}>
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                                                        step.status === 'done' ? "bg-green-500 text-white" : 
                                                        step.status === 'active' ? "bg-indigo-500 text-white animate-pulse" : "bg-white/10 text-white/50"
                                                    )}>
                                                        {step.status === 'done' ? <CheckCircle className="w-3 h-3" /> : i + 1}
                                                    </div>
                                                    <span className={cn(
                                                        "text-sm font-medium",
                                                        step.status === 'done' ? "text-white" :
                                                        step.status === 'active' ? "text-indigo-400" : "text-gray-500"
                                                    )}>
                                                        {step.text}
                                                    </span>
                                                </div>
                                                {step.value && (
                                                    <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                                                        {step.value}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {claimState === 'success' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex flex-col items-center gap-3"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                                <CheckCircle className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-white font-bold">Reward Claimed!</div>
                                                <div className="text-xs text-green-400 mt-1">Check your wallet on Base</div>
                                            </div>
                                            <button className="text-xs font-bold text-white flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                                View Tx on Basescan <ExternalLink className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function TechRow({ label, value, link }: { label: string, value: string, link?: boolean }) {
    return (
        <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-gray-600">{label}:</span>
            <div className="flex items-center gap-1">
                <span className="text-gray-400">{value}</span>
                {link && <ExternalLink className="w-2.5 h-2.5 text-gray-600 hover:text-indigo-400 cursor-pointer" />}
            </div>
        </div>
    );
}
