'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ExternalLink, CheckCircle, Database, Box, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Campaign } from '@/app/api/campaigns/route';
import { VerifyResponse } from '@/app/api/verify/route';
import { NOTRUST_ABI, NOTRUST_ADDRESS } from '@/lib/contract';

interface CampaignDetailProps {
    campaign: Campaign;
    onBack: () => void;
}

interface Step {
    id: string;
    text: string;
    status: 'pending' | 'active' | 'done';
    value?: string;
}

export function CampaignDetail({ campaign, onBack }: CampaignDetailProps) {
    const { address, isConnected } = useAccount();
    const publicClient = usePublicClient();
    const { writeContractAsync } = useWriteContract();

    const [timeLeft, setTimeLeft] = useState('');
    const [eligibilityChecked, setEligibilityChecked] = useState(false);
    const [claimState, setClaimState] = useState<'idle' | 'verifying' | 'claiming' | 'success'>('idle');
    const [claimTx, setClaimTx] = useState('');
    const [alreadyClaimed, setAlreadyClaimed] = useState(false);

    const [steps, setSteps] = useState<Step[]>([
        { id: 'rpc', text: 'Connecting to Base RPC', status: 'pending' },
        { id: 'state', text: `Reading on-chain state for 0x...`, status: 'pending' },
        { id: 'criteria', text: 'Criteria verified', status: 'pending' },
        { id: 'sign', text: 'Proof signed by verifier', status: 'pending' },
        { id: 'submit', text: 'claim() submitted on Base', status: 'pending' }
    ]);

    useEffect(() => {
        if (!campaign.ends_at) return;
        const tick = () => {
            const diff = new Date(campaign.ends_at).getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft('Ended');
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${h}h ${m}m ${s}s`);
            }
        };
        tick();
        const int = setInterval(tick, 1000);
        return () => clearInterval(int);
    }, [campaign.ends_at]);

    useEffect(() => {
        const checkAlreadyClaimed = async () => {
            if (!address || !publicClient || !campaign.on_chain_id) return;
            try {
                const claimed = await publicClient.readContract({
                    address: NOTRUST_ADDRESS,
                    abi: NOTRUST_ABI,
                    functionName: 'hasClaimed',
                    args: [BigInt(campaign.on_chain_id), address as `0x${string}`]
                });
                setAlreadyClaimed(claimed as boolean);
            } catch (err) {}
        };
        checkAlreadyClaimed();
    }, [address, publicClient, campaign.on_chain_id]);

    const updateStep = (id: string, status: 'pending' | 'active' | 'done', value?: string) => {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, status, value: value || s.value } : s));
    };

    const handleCheckEligibility = async () => {
        if (!isConnected || !address) {
            toast.error('Connect wallet to check');
            return;
        }

        updateStep('state', 'pending', `Reading on-chain state for ${address.slice(0,6)}...${address.slice(-4)}`);
        
        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId: campaign.on_chain_id, userAddress: address, checkOnly: true })
            });

            const data = await res.json();
            
            if (res.ok) {
                toast.success('You qualify — ready to claim');
                setEligibilityChecked(true);
            } else {
                toast.error(`You need ${data.diff || 'more'} ${campaign.token_symbol}`);
            }
        } catch (err) {
            toast.error('Failed to check eligibility');
        }
    };

    const handleClaim = async () => {
        if (!isConnected || !address) return;
        setClaimState('verifying');
        setSteps(s => s.map(step => ({ ...step, status: 'pending' })));

        try {
            updateStep('rpc', 'active');
            await new Promise(r => setTimeout(r, 600));
            updateStep('rpc', 'done');

            updateStep('state', 'active');
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId: campaign.on_chain_id, userAddress: address })
            });
            const data: VerifyResponse = await res.json();
            
            if (!res.ok || !data.signature) {
                throw new Error(data.error || 'Verification failed');
            }

            updateStep('state', 'done', `${data.value} found`);
            
            updateStep('criteria', 'active');
            await new Promise(r => setTimeout(r, 400));
            updateStep('criteria', 'done', `${data.value} ≥ ${campaign.criteria_value} ✓`);

            setClaimState('claiming');
            updateStep('sign', 'active');
            await new Promise(r => setTimeout(r, 400));
            updateStep('sign', 'done', 'EIP-191 sig received');

            updateStep('submit', 'active');
            
            const txHash = await writeContractAsync({
                address: NOTRUST_ADDRESS,
                abi: NOTRUST_ABI,
                functionName: 'claim',
                args: [BigInt(campaign.on_chain_id), data.signature as `0x${string}`]
            });
            
            updateStep('submit', 'done', `tx ${txHash.slice(0,6)}...`);
            
            if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash: txHash });
            }

            setClaimTx(txHash);
            setClaimState('success');
            toast.success(`${campaign.reward_per_user} ${campaign.token_symbol} claimed successfully!`);
            
            confetti({
                particleCount: 200,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#eab308', '#ffffff']
            });

        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Claim failed');
            setClaimState('idle');
        }
    };

    const container = { animate: { transition: { staggerChildren: 0.12 } } };
    const stepAnim = { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 } };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onBack}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative w-full max-w-xl h-full bg-[#050505] border-l border-white/5 shadow-2xl overflow-y-auto no-scrollbar"
            >
                <div className="p-8 space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                            <span className="text-xl">←</span> <span className="text-sm font-bold uppercase tracking-widest">Back</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-500/20">
                            {campaign.token_symbol.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-4xl font-medium tracking-tight text-white">{campaign.reward_per_user} <span className="text-sm text-gray-400">{campaign.token_symbol}</span></h2>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{campaign.title}</h3>
                        <p className="text-sm text-gray-300 leading-relaxed mb-4">{campaign.description}</p>
                        
                        <div className="flex flex-col gap-2 font-mono text-xs text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <Database className="w-3.5 h-3.5" />
                                <span>Creator: {campaign.creator_address}</span>
                                <ExternalLink className="w-3 h-3 cursor-pointer hover:text-indigo-400" />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{timeLeft}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-gray-300 font-medium">
                        {campaign.current_claims} of {campaign.max_claims} claimed · {Number(campaign.pool_amount) - (Number(campaign.current_claims) * Number(campaign.reward_per_user))} {campaign.token_symbol} remaining in pool
                    </div>

                    {/* Already Claimed State */}
                    {alreadyClaimed && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                            <h3 className="text-lg font-medium text-white mb-1">You already claimed this reward</h3>
                            <button className="text-xs font-bold text-indigo-400 flex items-center gap-1 justify-center mx-auto hover:text-indigo-300 transition-colors">
                                View transaction <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    {/* Criteria & Claim */}
                    {!alreadyClaimed && (
                        <>
                            {/* Criteria Card */}
                            <div className="bg-[#13141A] border border-white/5 rounded-2xl p-6 space-y-4">
                                <h4 className="text-[11px] uppercase tracking-[0.15em] text-gray-500 font-bold mb-4">How to qualify</h4>
                                <p className="text-sm text-gray-300">
                                    {campaign.criteria_type === 'token_balance' ? `Hold at least ${campaign.criteria_value} ${campaign.token_symbol} on Base` :
                                     campaign.criteria_type === 'nft_hold' ? `Own at least ${campaign.criteria_value} NFT(s) from collection` :
                                     `Satisfy the custom on-chain requirement`}
                                </p>
                                
                                <details className="group">
                                    <summary className="text-xs font-bold text-indigo-400 cursor-pointer list-none">View Technical Details</summary>
                                    <div className="mt-4 p-4 bg-black/40 rounded-xl font-mono text-xs text-gray-400 space-y-2">
                                        <div className="flex justify-between"><span>Contract:</span> <span className="text-white">{campaign.criteria_target}</span></div>
                                        <div className="flex justify-between"><span>Method:</span> <span className="text-white">balanceOf(address)</span></div>
                                        <div className="flex justify-between"><span>Operator:</span> <span className="text-white">≥</span></div>
                                        <div className="flex justify-between"><span>Value:</span> <span className="text-white">{campaign.criteria_value} (raw)</span></div>
                                    </div>
                                </details>

                                {!eligibilityChecked ? (
                                    <button
                                        onClick={handleCheckEligibility}
                                        className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/5 hover:border-white/10"
                                    >
                                        Check My Eligibility
                                    </button>
                                ) : (
                                    <div className="mt-4 text-green-400 font-bold flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" /> You qualify — ready to claim
                                    </div>
                                )}
                            </div>

                            {/* Claim Flow */}
                            {eligibilityChecked && claimState === 'idle' && (
                                <button
                                    onClick={handleClaim}
                                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98]"
                                >
                                    Claim {campaign.reward_per_user} {campaign.token_symbol} Now
                                </button>
                            )}

                            {claimState !== 'idle' && (
                                <div className="bg-[#13141A] border border-indigo-500/20 rounded-2xl p-6 space-y-6">
                                    <motion.div variants={container} initial="initial" animate="animate" className="space-y-4">
                                        {steps.map((step, i) => (
                                            <motion.div key={step.id} variants={stepAnim} className={cn(
                                                "flex items-center justify-between transition-opacity duration-300",
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
                                                    <span className="text-sm text-gray-300">
                                                        {step.text}
                                                    </span>
                                                </div>
                                                {step.value && <span className="font-mono text-xs text-gray-500">{step.value}</span>}
                                            </motion.div>
                                        ))}
                                    </motion.div>

                                    {claimState === 'success' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex flex-col items-center gap-2"
                                        >
                                            <div className="flex items-center gap-2 text-green-400 font-bold mb-1">
                                                <CheckCircle className="w-5 h-5" />
                                                {campaign.reward_per_user} {campaign.token_symbol} secured
                                            </div>
                                            <a 
                                                href={`https://basescan.org/tx/${claimTx}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="text-xs text-white/80 hover:text-white flex items-center gap-1"
                                            >
                                                Transaction: {claimTx.slice(0,6)}...{claimTx.slice(-4)} <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
