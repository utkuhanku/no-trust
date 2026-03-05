'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, ExternalLink, Trophy, Clock, CheckCircle, Box } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MOCK_REWARDS = [
    {
        id: '1',
        title: 'ETHDenver Top 50 Finisher',
        provider: 'Word Rain',
        reward: 'Multi-Tier',
        pool: '$250 USDC',
        tiers: [
            { rank: '1', amount: '$100 USDC' },
            { rank: '2', amount: '$75 USDC' },
            { rank: '3', amount: '$50 USDC' },
            { rank: '4-50', amount: '$25 USDC Pool' }
        ],
        action: 'Compete on Leaderboard',
        tags: ['ETHDenver', 'On-Chain'],
        color: 'from-blue-500/20 to-indigo-500/20',
        logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        icon: '☔️',
        verificationType: 'On-Chain Event',
        contractAddress: '0x8b36c1d19D4a...eB48',
        currentClaims: 12,
        maxCap: 50,
        timeLeft: '2 Days'
    },
    {
        id: '2',
        title: 'Hold 1+ ETH on Base',
        provider: 'Base Network',
        reward: '50 USDC',
        pool: '10,000 USDC',
        action: 'On-Chain Snapshot',
        tags: ['Airdrop', 'Holder'],
        color: 'from-blue-600/20 to-cyan-500/20',
        logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/logo.png',
        icon: '💎',
        verificationType: 'Contract State (ERC20)',
        contractAddress: '0xC02aaA39b22...6Cc2',
        currentClaims: 184,
        maxCap: 200,
        timeLeft: '12 Hours'
    },
    {
        id: '3',
        title: 'Engage with Farcaster Frame',
        provider: 'Degen Arcade',
        reward: '500 DEGEN',
        pool: '50,000 DEGEN',
        action: 'Like & Recast Ann.',
        tags: ['Social', 'API'],
        color: 'from-purple-500/20 to-pink-500/20',
        logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x4ed4E8628A5EBdD83296c00F0904fFBF3A0108A7/logo.png',
        icon: '🎩',
        verificationType: 'API (Neynar)',
        contractAddress: 'N/A (API Verification)',
        currentClaims: 8,
        maxCap: 100,
        timeLeft: '5 Days'
    }
];

export function HunterDashboard() {
    const [selectedReward, setSelectedReward] = useState<string | null>(null);
    const [claimState, setClaimState] = useState<'idle' | 'verifying' | 'claiming' | 'success'>('idle');

    const handleProceed = () => {
        setClaimState('verifying');
        // Simulate objective verification
        setTimeout(() => {
            setClaimState('claiming');
            // Simulate extraction yield transaction
            setTimeout(() => {
                setClaimState('success');
                toast.success('Yield Successfully Extracted!', { duration: 4000 });
            }, 2500);
        }, 2000);
    };

    if (selectedReward) {
        const reward = MOCK_REWARDS.find(r => r.id === selectedReward)!;

        return (
            <div
                className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200"
            >
                <button
                    onClick={() => {
                        setSelectedReward(null);
                        setClaimState('idle');
                    }}
                    className="text-gray-400 text-sm font-medium mb-4 flex items-center gap-1 hover:text-white transition-colors w-fit"
                >
                    &larr; Back to list
                </button>

                <div className={cn("rounded-3xl p-6 bg-gradient-to-br border border-white/5 mb-6 relative overflow-hidden", reward.color)}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className="flex items-center gap-3 mb-4">
                        <img src={reward.logo} alt="token" className="w-8 h-8 rounded-full shadow-lg" />
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight leading-none">{reward.reward}</h2>
                            <span className="text-xs text-white/60 font-medium uppercase tracking-wider">{reward.provider}</span>
                        </div>
                    </div>

                    <h3 className="text-xl font-medium text-white/90 mb-2">{reward.title}</h3>

                    <div className="flex gap-2">
                        {reward.tags.map(t => (
                            <span key={t} className="bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white border border-white/5 rounded-full backdrop-blur-md">
                                {t}
                            </span>
                        ))}
                        <span className="bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white border border-white/5 rounded-full flex items-center gap-1 backdrop-blur-md">
                            <Clock className="w-3 h-3" /> {reward.timeLeft}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5">
                        <div className="flex justify-between items-end mb-1.5">
                            <span className="text-xs font-semibold text-white/80">Campaign Capacity</span>
                            <span className="text-xs font-bold text-white">{reward.currentClaims} / {reward.maxCap} <span className="text-white/50 font-medium">Claimed</span></span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-1.5 border border-white/10 overflow-hidden">
                            <div className="bg-white h-1.5 rounded-full" style={{ width: `${(reward.currentClaims / reward.maxCap) * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="flex-grow flex flex-col gap-4">
                    <div className="bg-[#13141A] rounded-[24px] p-5 border border-white/5 relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-semibold text-white">Execution Steps</h4>
                            <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                {reward.verificationType.includes('On-Chain') || reward.verificationType.includes('Contract') ? <Box className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                                {reward.verificationType}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 relative before:absolute before:inset-y-4 before:left-3.5 before:w-0.5 before:bg-white/10">
                            <div className="flex items-start gap-4 p-3 bg-[#1A1B23] rounded-xl border border-white/5 relative z-10">
                                <div className="w-7 h-7 bg-black border border-white/10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 shadow-md">1</div>
                                <div>
                                    <h5 className="text-sm font-medium text-white mb-0.5">Interact with {reward.provider}</h5>
                                    <p className="text-xs text-gray-500 mb-2">
                                        {reward.verificationType.includes('API') ? 'Complete the action via their app or social platform.' : 'Perform the required action directly on the blockchain.'}
                                    </p>
                                    {!reward.verificationType.includes('API') && (
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-black/40 border border-white/5 rounded-md hover:bg-black/60 cursor-pointer transition-colors group">
                                            <span className="text-[10px] text-gray-500 font-mono">{reward.contractAddress}</span>
                                            <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-3 bg-[#1A1B23] rounded-xl border border-white/5 relative z-10">
                                <div className="w-7 h-7 bg-black border border-white/10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 shadow-md">2</div>
                                <div className="w-full">
                                    <h5 className="text-sm font-medium text-white mb-0.5">Meet the Condition</h5>

                                    {/* Handle Tiers if they exist */}
                                    {reward.tiers ? (
                                        <div className="mt-2 flex flex-col gap-1.5 w-full">
                                            {reward.tiers.map((tier, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-black/40 border border-white/5 p-2 rounded-lg">
                                                    <span className="text-xs text-gray-400">Rank {tier.rank}</span>
                                                    <span className="text-xs text-green-400 font-bold">{tier.amount}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-indigo-400 font-medium bg-indigo-500/10 inline-block px-1.5 py-0.5 rounded mt-0.5 mb-2">{reward.title}</p>
                                    )}

                                    <p className="text-[10px] text-gray-500 mt-2 italic flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                                        {reward.verificationType.includes('API') ? 'Automatically verified via Integration Endpoint' : 'Evaluates Contract State Trustlessly'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-3 border-t border-white/5 mt-4">
                            <span className="text-sm text-gray-500">Total Reward Pool</span>
                            <span className="text-sm text-indigo-400 font-semibold">{reward.pool}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    {claimState === 'success' ? (
                        <button className="w-full bg-green-500/20 text-green-400 font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 border border-green-500/30 transition-all pointer-events-none">
                            <CheckCircle className="w-5 h-5" /> Secured on Base
                        </button>
                    ) : (
                        <button
                            onClick={handleProceed}
                            disabled={claimState !== 'idle'}
                            className={cn(
                                "w-full font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]",
                                claimState === 'idle' ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-indigo-600/50 text-white cursor-not-allowed"
                            )}>
                            {claimState === 'idle' && <><ExternalLink className="w-5 h-5" /> Execute & Claim Objective</>}
                            {claimState === 'verifying' && <><div className="w-5 h-5 animate-spin border-2 border-white/20 border-t-white rounded-full" /> Verifying Logic...</>}
                            {claimState === 'claiming' && <><div className="w-5 h-5 animate-spin border-2 border-white/20 border-t-white rounded-full" /> Extracting Yield...</>}
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-white font-medium text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-indigo-400" /> Available Bounties
                </h3>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar pb-4 pr-1">
                {MOCK_REWARDS.map((reward, i) => (
                    <button
                        key={reward.id}
                        style={{ animationDelay: `${i * 50}ms` }}
                        onClick={() => setSelectedReward(reward.id)}
                        className="group w-full bg-[#13141A] border border-white/5 hover:bg-[#1A1B23] hover:border-white/10 transition-all duration-300 rounded-[24px] p-4 flex items-center justify-between text-left animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl border border-white/10 shadow-inner">
                                    {reward.icon}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-[#1A1B23] rounded-full p-0.5 border border-white/10">
                                    <img src={reward.logo} className="w-4 h-4 rounded-full" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-white text-[15px]">{reward.reward}</h4>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded-sm">
                                        {reward.provider} {/* Swapped tag for provider name for clarity */}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 font-medium">Pool: <span className="text-white">{reward.pool}</span></p>
                            </div>
                        </div>

                        <div className="bg-[#1E1F27] text-gray-400 group-hover:text-white group-hover:bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center transition-all">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
