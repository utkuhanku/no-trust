'use client';

import { useState } from 'react';
import { ChevronDown, Box, Calendar, Plus, Wallet, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function MerchantDashboard() {
    const [amount, setAmount] = useState('250.00');
    const [token, setToken] = useState('USDC');
    const [isDeploying, setIsDeploying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleDeploy = () => {
        setIsDeploying(true);
        setTimeout(() => {
            setIsDeploying(false);
            setIsSuccess(true);
            toast.success('Funds Locked & Campaign Live!', { duration: 4000 });
            setTimeout(() => {
                setIsSuccess(false);
                setAmount('');
            }, 3000);
        }, 2500);
    };

    const [metricType, setMetricType] = useState('streak');

    const renderConditionInput = () => {
        switch (metricType) {
            case 'nft':
                return (
                    <>
                        <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl flex items-center justify-center text-sm font-bold text-white w-12 shrink-0">
                            ==
                        </div>
                        <div className="w-16 shrink-0 bg-black/40 border border-white/5 p-2.5 rounded-xl flex items-center justify-center text-sm font-bold text-indigo-400 focus-within:border-indigo-500/50">
                            <input type="text" defaultValue="1" className="w-full bg-transparent text-center outline-none" />
                        </div>
                    </>
                );
            case 'token':
                return (
                    <>
                        <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl flex items-center justify-center text-sm font-bold text-white w-12 shrink-0">
                            &gt;=
                        </div>
                        <div className="flex-1 bg-black/40 border border-white/5 p-2.5 rounded-xl flex items-center justify-center text-sm font-bold text-indigo-400 focus-within:border-indigo-500/50">
                            <input type="text" defaultValue="1000" className="w-full bg-transparent text-center outline-none" />
                        </div>
                    </>
                );
            case 'streak':
            default:
                return (
                    <>
                        <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl flex items-center justify-center text-sm font-bold text-white w-12 shrink-0">
                            &gt;=
                        </div>
                        <div className="w-16 shrink-0 bg-black/40 border border-white/5 p-2.5 rounded-xl flex items-center justify-center text-sm font-bold text-indigo-400 focus-within:border-indigo-500/50">
                            <input type="text" defaultValue="10" className="w-full bg-transparent text-center outline-none" />
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="flex flex-col h-full space-y-3">

            {/* Header */}
            <div className="flex justify-between items-center mb-1">
                <span className="text-gray-400 font-medium text-sm">Reward Pool</span>
                <span className="text-gray-500 text-xs flex items-center gap-1"><Wallet className="w-3 h-3" /> Bal: 1,450.00</span>
            </div>

            {/* Input Group - Big Swap Style */}
            <div className="bg-[#13141A] border border-white/5 rounded-[24px] p-4 flex flex-col items-start gap-2 hover:bg-[#1A1B23] transition-colors relative z-10 group">
                <div className="flex justify-between w-full items-center">
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent text-white text-4xl w-full mr-4 outline-none font-medium placeholder:text-gray-700 disabled:opacity-50"
                        placeholder="0"
                        disabled={isDeploying}
                    />

                    <button className="bg-[#1E1F27] hover:bg-[#252631] text-white py-2 px-3 rounded-2xl flex items-center gap-2 transition-colors border border-white/5 whitespace-nowrap group-hover:border-white/10">
                        <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" className="w-6 h-6 rounded-full" alt="USDC" />
                        <span className="font-semibold text-lg">{token}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">
                    ~$0.00
                </div>
            </div>

            {/* Separator / Plus icon */}
            <div className="flex justify-center -my-3 relative z-20 pointer-events-none">
                <div className="bg-[#1A1B23] border border-white/5 rounded-xl p-1.5 flex items-center justify-center text-gray-400 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <Plus className="w-4 h-4" />
                </div>
            </div>

            {/* Rule Builder Group */}
            <div className="bg-[#13141A] border border-white/5 rounded-[24px] p-4 flex flex-col gap-3 relative z-10">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 font-medium text-sm text-balance">Verifiable Action </span>
                    <span className="text-indigo-400 text-[10px] font-bold tracking-wider uppercase bg-indigo-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">No-Trust</span>
                </div>

                {/* 1. Contract Target */}
                <div className="w-full bg-[#1A1B23] border border-white/5 transition-all text-white p-3 rounded-[16px] flex flex-col gap-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Target Smart Contract</span>
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            defaultValue="0xBase...Contract"
                            className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-sm font-mono text-gray-300 outline-none focus:border-indigo-500/50 transition-colors"
                            placeholder="Enter Contract Address (e.g. 0x...)"
                        />
                        <div className="absolute right-2 px-2 py-1 bg-white/5 rounded-md text-[10px] uppercase font-bold text-gray-400 cursor-pointer hover:text-white transition-colors">
                            Verify ABI
                        </div>
                    </div>
                </div>

                {/* Validation Logic Pipe */}
                <div className="pl-8 flex flex-col gap-1 -my-1">
                    <div className="w-0.5 h-3 bg-white/10" />
                </div>

                {/* 2. Condition Selection */}
                <div className="w-full bg-[#1A1B23] border border-white/5 text-white p-3 rounded-[16px] flex flex-col gap-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">On-Chain Condition</span>
                    <div className="flex items-center gap-2">
                        <select
                            value={metricType}
                            onChange={(e) => setMetricType(e.target.value)}
                            className="flex-1 bg-black/40 border border-white/5 p-2.5 rounded-xl flex items-center justify-between text-sm text-white font-medium cursor-pointer hover:border-white/10 outline-none appearance-none"
                        >
                            <option value="streak">Streak Count</option>
                            <option value="nft">NFT Balance / Ownership</option>
                            <option value="token">ERC20 Token Balance</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-[100px] pointer-events-none" />

                        {renderConditionInput()}
                    </div>
                </div>
            </div>

            {/* Secondary Settings (Duration, etc) */}
            <div className="flex gap-2">
                <button className="flex-1 bg-[#13141A] border border-white/5 hover:bg-[#1A1B23] p-3 rounded-2xl flex items-center justify-between transition-colors">
                    <div className="flex flex-col items-start">
                        <span className="text-xs text-gray-500 font-medium">Reward/User</span>
                        <span className="text-sm text-white font-semibold">5.00 USDC</span>
                    </div>
                </button>
                <button className="flex-1 bg-[#13141A] border border-white/5 hover:bg-[#1A1B23] p-3 rounded-2xl flex items-center justify-between transition-colors">
                    <div className="flex flex-col items-start">
                        <span className="text-xs text-gray-500 font-medium">Total Cap</span>
                        <span className="text-sm text-white font-semibold">50 Users</span>
                    </div>
                </button>
            </div>

            <div className="flex-grow min-h-[16px]" />

            {/* Main Deploy Button */}
            <button
                onClick={handleDeploy}
                disabled={isDeploying || isSuccess || amount === '0' || amount === '0.00' || amount === ''}
                className={cn(
                    "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                    isSuccess
                        ? "bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                        : isDeploying
                            ? "bg-indigo-600/50 text-white cursor-not-allowed"
                            : (!amount || amount === '0' || amount === '0.00' || amount === '')
                                ? "bg-[#1A1B23] text-gray-500 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                )}
            >
                {isSuccess ? (
                    <>
                        <CheckCircle className="w-5 h-5" /> Campaign Successfully Deployed
                    </>
                ) : isDeploying ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Locking {amount} {token}...
                    </>
                ) : (!amount || amount === '0' || amount === '0.00' || amount === '') ? (
                    "Enter Amount"
                ) : (
                    <>Publish Campaign & Lock Funds</>
                )}
            </button>

        </div>
    );
}
