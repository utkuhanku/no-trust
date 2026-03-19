'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Coins, 
    Settings2, 
    Rocket, 
    ChevronLeft, 
    ChevronRight, 
    Wallet, 
    LayoutGrid, 
    Image as ImageIcon, 
    Zap,
    CheckCircle2,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccount, useBalance } from 'wagmi';
import { toast } from 'sonner';

export function DistributeWizard() {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({ address });
    
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        amount: '',
        token: 'USDC',
        duration: '7',
        rewardPerUser: '',
        criteriaType: 'token_balance' as 'token_balance' | 'nft_hold' | 'contract_call',
        criteriaValue: '',
        contractAddress: ''
    });

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const renderStep = () => {
        switch (step) {
            case 1: return <StepOne data={formData} update={setFormData} balance={balance} />;
            case 2: return <StepTwo data={formData} update={setFormData} />;
            case 3: return <StepThree data={formData} />;
            default: return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-medium tracking-tight text-white italic">Create Reward Campaign</h1>
                <p className="text-gray-500">Distribute incentives to your community trustlessly on Base.</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl">
                <StepIndicator current={step} step={1} icon={<Coins className="w-4 h-4" />} label="Fund Pool" />
                <div className="h-px flex-1 bg-white/10" />
                <StepIndicator current={step} step={2} icon={<Settings2 className="w-4 h-4" />} label="Set Criteria" />
                <div className="h-px flex-1 bg-white/10" />
                <StepIndicator current={step} step={3} icon={<Rocket className="w-4 h-4" />} label="Deploy" />
            </div>

            {/* Content */}
            <div className="bg-[#0A0A0B] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl">
                <button
                    onClick={prevStep}
                    disabled={step === 1}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-white disabled:opacity-30 transition-all"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                
                {step < 3 ? (
                    <button
                        onClick={nextStep}
                        className="flex items-center gap-2 px-8 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                    >
                        Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={() => toast.success('Campaign Deployed (Simulation)')}
                        className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-[0.98]"
                    >
                        Deploy Campaign <Rocket className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

function StepIndicator({ current, step, icon, label }: { current: number, step: number, icon: React.ReactNode, label: string }) {
    const active = current === step;
    const done = current > step;

    return (
        <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
            active ? "bg-white/10 text-white" : done ? "text-green-500" : "text-gray-500"
        )}>
            {done ? <CheckCircle2 className="w-4 h-4" /> : icon}
            <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
        </div>
    );
}

function StepOne({ data, update, balance }: any) {
    const maxClaims = data.amount && data.rewardPerUser ? Math.floor(Number(data.amount) / Number(data.rewardPerUser)) : 0;

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Amount to Lock</label>
                    <div className="text-[10px] font-mono text-gray-500">
                        Balance: {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.00'}
                    </div>
                </div>
                <div className="relative group">
                    <input
                        type="number"
                        placeholder="0.00"
                        value={data.amount}
                        onChange={(e) => update({ ...data, amount: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-6 text-4xl font-medium text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <select 
                            value={data.token}
                            onChange={(e) => update({ ...data, token: e.target.value })}
                            className="bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-sm font-bold text-white outline-none"
                        >
                            <option value="USDC">USDC</option>
                            <option value="ETH">ETH</option>
                            <option value="DEGEN">DEGEN</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Reward per User</label>
                    <input
                        type="number"
                        placeholder="0.00"
                        value={data.rewardPerUser}
                        onChange={(e) => update({ ...data, rewardPerUser: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Duration (Days)</label>
                    <select
                        value={data.duration}
                        onChange={(e) => update({ ...data, duration: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                    >
                        <option value="1">24 Hours</option>
                        <option value="7">7 Days</option>
                        <option value="30">30 Days</option>
                    </select>
                </div>
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex items-start gap-4">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-400">
                    This will lock <span className="text-white font-bold">{data.amount || '0'} {data.token}</span>. 
                    At <span className="text-white font-bold">{data.rewardPerUser || '0'}</span> per user, 
                    <span className="text-indigo-400 font-bold ml-1">{maxClaims} people</span> can claim this reward.
                </p>
            </div>
        </div>
    );
}

function StepTwo({ data, update }: any) {
    const criteriaOptions = [
        { id: 'token_balance', icon: <Wallet className="w-6 h-6" />, title: 'Token Balance', desc: 'Hold ≥ X of any token' },
        { id: 'nft_hold', icon: <ImageIcon className="w-6 h-6" />, title: 'NFT Hold', desc: 'Must own 1+ NFT' },
        { id: 'contract_call', icon: <Zap className="w-6 h-6" />, title: 'Custom Call', desc: 'Any view() function' },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
                {criteriaOptions.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => update({ ...data, criteriaType: opt.id })}
                        className={cn(
                            "flex flex-col items-center text-center p-6 rounded-2xl border transition-all space-y-3",
                            data.criteriaType === opt.id 
                                ? "bg-indigo-600/10 border-indigo-500/50 text-white" 
                                : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                            data.criteriaType === opt.id ? "bg-indigo-500 text-white" : "bg-white/5"
                        )}>
                            {opt.icon}
                        </div>
                        <div>
                            <div className="text-sm font-bold uppercase tracking-wider">{opt.title}</div>
                            <div className="text-[10px] text-gray-500 mt-1">{opt.desc}</div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Contract Address</label>
                    <input
                        type="text"
                        placeholder="0x..."
                        value={data.contractAddress}
                        onChange={(e) => update({ ...data, contractAddress: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {data.criteriaType === 'token_balance' ? 'Minimum Balance' : 
                         data.criteriaType === 'nft_hold' ? 'Collection Size' : 'Expected Return Value'}
                    </label>
                    <input
                        type="text"
                        placeholder="1,000"
                        value={data.criteriaValue}
                        onChange={(e) => update({ ...data, criteriaValue: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    />
                </div>
            </div>

            {/* Live Test Widget */}
            <div className="relative overflow-hidden rounded-2xl bg-indigo-500/5 border border-indigo-500/10 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Live Criteria Test</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Paste wallet address to test eligibility..."
                        className="flex-1 bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs font-mono text-gray-400 outline-none"
                    />
                    <button className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-600/30 transition-all">
                        Test
                    </button>
                </div>
            </div>
        </div>
    );
}

function StepThree({ data }: any) {
    const summaryItems = [
        { label: 'Token locked', value: `${data.amount} ${data.token}` },
        { label: 'Reward per user', value: `${data.rewardPerUser} ${data.token}` },
        { label: 'Max claims', value: `${Math.floor(Number(data.amount) / Number(data.rewardPerUser))} users` },
        { label: 'Duration', value: `${data.duration} days` },
        { label: 'Criteria', value: `${data.criteriaType.replace('_', ' ')}: ≥ ${data.criteriaValue}` },
        { label: 'Estimated gas', value: '~$0.05' },
    ];

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-medium text-white italic">Ready for Launch</h3>
                <p className="text-gray-500">Review your campaign details before deploying to Base.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                {summaryItems.map((item, i) => (
                    <div key={i} className="flex justify-between items-center px-6 py-4">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
                        <span className="text-sm font-medium text-white">{item.value}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                <Info className="w-5 h-5 text-yellow-500 shrink-0" />
                <p className="text-xs text-gray-500">
                    Deploying will require <span className="text-white font-bold">two transactions</span>: Approve {data.token} and Create Campaign.
                </p>
            </div>
        </div>
    );
}
