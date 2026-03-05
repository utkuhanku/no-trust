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
                    <div className="flex-1 flex gap-2 w-full">
                        <input type="text" defaultValue="0x... Collection Address" className="flex-[2] bg-transparent text-sm outline-none px-2" />
                        <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl flex items-center justify-center text-sm font-bold text-white w-12 shrink-0">==</div>
                        <input type="text" defaultValue="1" className="flex-1 bg-transparent text-center text-sm outline-none font-bold text-indigo-400" />
                    </div>
                );
            case 'token':
                return (
                    <div className="flex-1 flex gap-2 w-full">
                        <input type="text" defaultValue="0x... Token Address" className="flex-[2] bg-transparent text-sm outline-none px-2" />
                        <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl flex items-center justify-center text-sm font-bold text-white w-12 shrink-0">&gt;=</div>
                        <input type="text" defaultValue="1000" className="flex-1 bg-transparent text-center text-sm outline-none font-bold text-indigo-400" />
                    </div>
                );
            case 'streak':
            case 'custom':
            default:
                return (
                    <div className="flex-1 flex gap-2 w-full">
                        <input type="text" defaultValue="uint256 score" className="flex-[2] bg-transparent text-sm outline-none font-mono text-gray-400 px-2" placeholder="e.g. uint256 score" />
                        <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl flex items-center justify-center text-sm font-bold text-white w-12 shrink-0">&gt;=</div>
                        <input type="text" defaultValue="10" className="flex-1 bg-transparent text-center text-sm outline-none font-bold text-indigo-400" />
                    </div>
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
                    <span className="text-gray-400 font-medium text-sm text-balance">On-Chain Trigger Mechanism</span>
                    <span className="text-indigo-400 text-[10px] flex items-center gap-1 font-bold tracking-wider uppercase bg-indigo-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        <Box className="w-3 h-3" /> Base Network
                    </span>
                </div>

                {/* 1. Contract Target */}
                <div className="w-full bg-[#1A1B23] border border-white/5 transition-all text-white p-3 rounded-[16px] flex flex-col gap-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Target Smart Contract</span>
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            defaultValue="0xBase...Contract"
                            className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-sm font-mono text-gray-300 outline-none focus:border-indigo-500/50 transition-colors"
                            placeholder="Target Contract Address (0x...)"
                        />
                        <button className="absolute right-2 px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-[10px] uppercase font-bold cursor-pointer hover:bg-indigo-500/30 transition-colors">
                            Fetch ABI
                        </button>
                    </div>
                </div>

                {/* Validation Logic Pipe */}
                <div className="pl-8 flex flex-col gap-1 -my-1">
                    <div className="w-0.5 h-3 bg-white/10" />
                </div>

                {/* 2. Event Selection */}
                <div className="w-full bg-[#1A1B23] border border-white/5 text-white p-3 rounded-[16px] flex flex-col gap-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Monitored Event Signature</span>
                    <select
                        value={metricType}
                        onChange={(e) => setMetricType(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 p-2.5 rounded-xl text-sm font-mono text-gray-300 cursor-pointer hover:border-white/10 outline-none appearance-none"
                    >
                        <option value="streak">StreakUpdated(address,uint256)</option>
                        <option value="nft">Transfer(address,address,uint256)</option>
                        <option value="custom">Custom Signature...</option>
                    </select>
                </div>

                {/* Validation Logic Pipe */}
                <div className="pl-8 flex flex-col gap-1 -my-1">
                    <div className="w-0.5 h-3 bg-white/10" />
                </div>

                {/* 3. Evaluation Logic */}
                <div className="w-full bg-[#1A1B23] border border-white/5 text-white p-3 rounded-[16px] flex flex-col gap-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Evaluation Parameter</span>
                    <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-1 rounded-xl">
                        {renderConditionInput()}
                    </div>
                </div>
            </div>

            {/* Campaign Config */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#13141A] border border-white/5 p-3 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Reward / User</span>
                    <div className="flex items-center justify-between">
                        <input type="text" defaultValue="5.00" className="w-16 bg-transparent text-sm text-white font-semibold outline-none" />
                        <span className="text-sm font-medium text-gray-500">{token}</span>
                    </div>
                </div>
                <div className="bg-[#13141A] border border-white/5 p-3 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Max Claims</span>
                    <div className="flex items-center justify-between">
                        <input type="text" defaultValue="50" className="w-16 bg-transparent text-sm text-white font-semibold outline-none" />
                        <span className="text-sm font-medium text-gray-500 opacity-50">/ 50</span>
                    </div>
                </div>
                <div className="bg-[#13141A] border border-white/5 p-3 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3 h-3" /> Ends In</span>
                    <select className="bg-transparent text-sm text-white font-semibold outline-none cursor-pointer">
                        <option>7 Days</option>
                        <option>14 Days</option>
                        <option>30 Days</option>
                    </select>
                </div>
                <div className="bg-[#13141A] border border-white/5 p-3 rounded-2xl flex flex-col gap-1 justify-center">
                    <span className="text-xs text-indigo-400 font-semibold cursor-pointer hover:text-indigo-300">Advanced Config &rarr;</span>
                </div>
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
