'use client';

import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowUpRight, Zap, ArrowLeft, Loader2, CheckCircle2, Lock, Cpu, Fingerprint, Activity, Hexagon, ExternalLink } from 'lucide-react';

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const staggerItem = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 350, damping: 35 } }
};

export default function QuestDetail() {
    const params = useParams();
    const router = useRouter();
    const { isConnected, address } = useAccount();
    const [isVerifying, setIsVerifying] = useState(false);
    const [signatureData, setSignatureData] = useState<any>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const questId = Array.isArray(params.id) ? params.id[0] : params.id;

    useEffect(() => {
        const fetchCampaign = async () => {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .eq('id', questId)
                .single();
            if (!error && data) {
                setCampaign(data);
            }
            setLoading(false);
        };
        fetchCampaign();
    }, [questId]);

    // Dynamic mouse tracking for holographic glare effects
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#010101] flex items-center justify-center flex-col relative overflow-hidden">
                <Loader2 className="w-12 h-12 text-base-blue animate-spin mb-4" />
                <h2 className="text-white font-mono tracking-widest text-sm">SYNCHRONIZING SECURE TUNNEL...</h2>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="min-h-screen bg-[#010101] flex items-center justify-center flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-black pointer-events-none" />
                <Lock className="w-16 h-16 text-red-500/50 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                <h2 className="text-4xl text-white font-black mb-6 tracking-tighter z-10">Terminal Not Found</h2>
                <button onClick={() => router.push('/')} className="z-10 text-white px-8 py-3 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 active:scale-95 transition-all text-sm font-bold tracking-widest uppercase">
                    Abort Protocol
                </button>
            </div>
        );
    }

    const simulateVerification = async () => {
        setIsVerifying(true);
        try {
            const response = await fetch('/api/claim-signature', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId: campaign.id,
                    userAddress: address
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verification Failed');
            }

            // Artificial delay to show off the cool "interrogating protocol" animation
            await new Promise(r => setTimeout(r, 1500));
            setSignatureData({
                campaignId: campaign.id,
                amount: BigInt(data.amount),
                nonce: BigInt(data.nonce),
                expiry: BigInt(data.expiry),
                signature: data.signature
            });
        } catch (err: any) {
            alert(`Protocol Violation: ${err.message}`);
        } finally {
            setIsVerifying(false);
        }
    };

    const executeClaim = () => {
        if (!signatureData) return;
        const CLAIM_ABI = [{
            "inputs": [
                { "internalType": "uint256", "name": "campaignId", "type": "uint256" },
                { "internalType": "uint256", "name": "amount", "type": "uint256" },
                { "internalType": "uint256", "name": "nonce", "type": "uint256" },
                { "internalType": "uint256", "name": "expiry", "type": "uint256" },
                { "internalType": "bytes", "name": "signature", "type": "bytes" }
            ],
            "name": "claim",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }];

        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

        writeContract({
            address: contractAddress,
            abi: CLAIM_ABI,
            functionName: 'claim',
            args: [
                signatureData.campaignId,
                signatureData.amount,
                signatureData.nonce,
                signatureData.expiry,
                signatureData.signature
            ],
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#010101] overflow-hidden relative selection:bg-base-blue/30 text-white font-sans">
            <Navbar />

            {/* Hyper-Premium Liquid Void Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[#010101] z-0" />
                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay z-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }} />

                {/* Moving Aurora Blobs */}
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.25, 0.15]
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-base-blue/20 blur-[140px] mix-blend-screen"
                />
                <motion.div
                    animate={{
                        rotate: -360,
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[40%] -left-[20%] w-[60vw] h-[60vw] rounded-full bg-purple-900/30 blur-[150px] mix-blend-screen"
                />

                {/* Deep background grid */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center bg-[length:40px_40px] opacity-[0.03] z-10 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />
            </div>

            <main className="flex-grow max-w-[1440px] w-full mx-auto px-4 md:px-8 py-12 md:py-20 relative z-20">

                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => router.push('/')}
                    className="group flex items-center gap-4 text-xs font-bold text-gray-500 hover:text-white mb-10 transition-colors w-fit tracking-[0.2em] uppercase"
                >
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all shadow-inner overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                    Abort & Return
                </motion.button>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12"
                >
                    {/* LEFT COLUMN: Main Briefing */}
                    <motion.div variants={staggerItem} className="xl:col-span-8 flex flex-col gap-8">

                        {/* Hero Card */}
                        <div
                            className="relative group rounded-[2.5rem] bg-[#050507]/60 backdrop-blur-3xl border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                            style={{
                                transform: `perspective(1000px) rotateX(${mousePosition.y * -0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`,
                                transition: 'transform 0.1s ease-out'
                            }}
                        >
                            {/* Animated Border Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-base-blue/0 via-base-blue/20 to-base-blue/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 [mask-image:linear-gradient(black,black) content-box,linear-gradient(black,black)] p-[1px] rounded-[2.5rem] pointer-events-none" />

                            {/* Inner ambient glow top */}
                            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

                            {/* Big background icon */}
                            <div className="absolute top-[-10%] right-[-10%] opacity-[0.03] transform scale-[2] pointer-events-none group-hover:scale-[2.2] group-hover:opacity-[0.05] transition-all duration-[2s] ease-out">
                                {campaign.currency === 'USDC' ? <Zap className="w-[800px] h-[800px]" /> : <ShieldCheck className="w-[800px] h-[800px]" />}
                            </div>

                            <div className="p-8 md:p-14 relative z-10 font-sans">

                                {/* Partner Pill */}
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-inner group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)] flex-shrink-0 animate-pulse" />
                                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">
                                        Verified System: <span className="text-white ml-1">{campaign.partner_name}</span>
                                    </span>
                                </div>

                                <h1 className="text-5xl md:text-[5.5rem] font-black tracking-tighter mb-6 text-white drop-shadow-2xl leading-[0.95] bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-gray-500">
                                    {campaign.title}
                                </h1>

                                <p className="text-lg md:text-xl text-gray-400 leading-relaxed font-medium mb-12 max-w-2xl text-balance">
                                    {campaign.description}
                                </p>

                                {/* Deep Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 group/stat hover:border-white/10 transition-colors">
                                        <div className="text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                            <Zap className="w-3 h-3 text-base-light" /> Escrowed
                                        </div>
                                        <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">{campaign.total_escrowed}</div>
                                        <div className="text-sm font-bold text-gray-500">{campaign.currency}</div>
                                    </div>
                                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 group/stat hover:border-white/10 transition-colors">
                                        <div className="text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                            <Cpu className="w-3 h-3 text-purple-400" /> Network
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-6 h-6 rounded-full bg-[#0052FF] flex items-center justify-center shadow-[0_0_10px_rgba(0,82,255,0.4)]">
                                                <div className="w-2 h-2 rounded-full bg-white block" />
                                            </div>
                                            <span className="text-xl lg:text-2xl font-black text-white tracking-tight">Base</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 group/stat hover:border-white/10 transition-colors">
                                        <div className="text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                            <Activity className="w-3 h-3 text-green-400" /> Claims limit
                                        </div>
                                        <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">{campaign.max_claims}</div>
                                        <div className="text-sm font-bold text-gray-500">Maximum</div>
                                    </div>
                                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 group/stat hover:border-white/10 transition-colors">
                                        <div className="text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                            <Hexagon className="w-3 h-3 text-orange-400" /> Security
                                        </div>
                                        <div className="text-xl lg:text-2xl font-black text-white tracking-tight mt-1">100%</div>
                                        <div className="text-sm font-bold text-gray-500">Trustless</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Steps Panel */}
                        <div className="rounded-[2.5rem] bg-[#050507]/40 backdrop-blur-xl border border-white/5 p-8 md:p-12 relative overflow-hidden group">
                            <div className="absolute top-[-50%] left-[20%] w-[60%] h-[100%] bg-base-blue/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-base-blue/10 transition-colors duration-1000" />

                            <h3 className="text-lg font-black mb-10 text-white flex items-center gap-3 tracking-[0.15em] uppercase text-xs relative z-10 border-b border-white/10 pb-6">
                                <span className="w-2 h-2 rounded-full bg-base-light animate-pulse" /> Protocol Sequence
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                {/* Desktop connecting line */}
                                <div className="hidden md:block absolute top-[2rem] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

                                {[
                                    { num: '01', title: 'Connect App', desc: `Open ${campaign.partner_name} and authenticate with your secure Base wallet.` },
                                    { num: '02', title: 'Complete Goal', desc: 'Perform the specified on-chain or off-chain actions. State changes are verified automatically.' },
                                    { num: '03', title: 'Extract Yield', desc: 'Return to this secure terminal, verify state, and claim your liquid bounty trustlessly.' }
                                ].map((step, i) => (
                                    <motion.div key={i} whileHover={{ y: -5 }} className="flex flex-col relative z-10 group/step">
                                        <div className={`w-16 h-16 rounded-2xl border ${i === 2 ? 'bg-base-blue/10 border-base-blue/50 text-base-light group-hover/step:bg-base-blue group-hover/step:text-white group-hover/step:shadow-[0_0_30px_rgba(0,82,255,0.4)]' : 'bg-black/50 border-white/10 text-gray-400 group-hover/step:border-white/30 group-hover/step:text-white'} font-black text-xl flex items-center justify-center mb-6 transition-all duration-300 relative overflow-hidden backdrop-blur-md`}>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover/step:translate-x-[100%] transition-transform duration-700" />
                                            {step.num}
                                        </div>
                                        <h4 className={`text-xl font-bold mb-3 ${i === 2 ? 'text-white' : 'text-gray-200'} tracking-tight`}>{step.title}</h4>
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed">{step.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                    </motion.div>

                    {/* RIGHT COLUMN: Action Terminal */}
                    <motion.div variants={staggerItem} className="xl:col-span-4 flex flex-col gap-6">

                        {/* Launch Action App */}
                        <motion.a
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            href={`https://${campaign.partner_name.toLowerCase().replace(/\s/g, '')}.example.com`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white text-black p-8 rounded-[2rem] flex items-center justify-between group transition-all duration-400 relative overflow-hidden shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                            <div className="relative z-10">
                                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.3em] block mb-2">Primary Directive</span>
                                <span className="text-[1.75rem] font-black tracking-tighter leading-none">Enter the Void</span>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:shadow-2xl">
                                <ArrowUpRight className="w-7 h-7" />
                            </div>
                        </motion.a>

                        {/* The Secure Verification Terminal */}
                        <div className="bg-[#050507]/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex-grow flex flex-col justify-between filter drop-shadow-2xl">
                            {/* Vault Top Light */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-base-light/10 via-base-light to-base-light/10 shadow-[0_0_20px_rgba(0,100,255,0.6)]" />

                            <div className="text-center mb-8 pt-4">
                                <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 mb-6">
                                    <Lock className="w-3 h-3 text-gray-400" />
                                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.3em]">Encrypted Vault</span>
                                </div>
                                <div className="text-[4rem] font-black text-white tracking-tighter drop-shadow-2xl leading-none mb-2">
                                    {campaign.reward_amount}
                                </div>
                                <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600 uppercase tracking-[0.2em]">{campaign.currency}</div>
                            </div>

                            <div className="mt-auto">
                                {isConnected ? (
                                    <div className="flex flex-col gap-4">
                                        <AnimatePresence mode="popLayout">
                                            {/* Verify Phase */}
                                            {!signatureData ? (
                                                <motion.button
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={simulateVerification}
                                                    disabled={isVerifying}
                                                    className="w-full relative group overflow-hidden rounded-2xl bg-[#0a0a0c] border border-white/20 py-6 font-bold text-white shadow-xl transition-all hover:border-base-blue/60 focus:outline-none disabled:opacity-70 disabled:scale-100"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    {/* Scanning Line Effect */}
                                                    {isVerifying && <div className="absolute top-0 left-0 w-full h-[2px] bg-base-light shadow-[0_0_10px_rgba(0,150,255,1)] animate-[scan_1.5s_linear_infinite]" />}

                                                    <div className="relative flex items-center justify-center gap-3 text-lg tracking-tight">
                                                        {isVerifying ? (
                                                            <><Loader2 className="w-5 h-5 animate-spin text-base-light" /> <span className="text-white/90">Interrogating Chain...</span></>
                                                        ) : (
                                                            <><Fingerprint className="w-5 h-5 text-gray-400 group-hover:text-base-light transition-colors" /> Verify Integrity</>
                                                        )}
                                                    </div>
                                                </motion.button>
                                            ) : (
                                                /* Claim Phase */
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex flex-col gap-4"
                                                >
                                                    <div className="flex items-center justify-center gap-2 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-bold font-mono tracking-tight">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        INTEGRITY CHECK PASSED
                                                    </div>

                                                    <motion.button
                                                        whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0,82,255,0.5)" }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={executeClaim}
                                                        disabled={isPending || isConfirming || isConfirmed}
                                                        className="w-full relative group overflow-hidden rounded-2xl bg-base-blue py-6 font-black text-white shadow-[0_10px_30px_rgba(10,82,255,0.4)] transition-all hover:bg-base-light focus:outline-none disabled:opacity-50 disabled:shadow-none disabled:scale-100"
                                                    >
                                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite] group-hover:animate-[shimmer_1s_infinite]" />

                                                        <div className="relative flex items-center justify-center gap-3 text-xl tracking-tighter">
                                                            {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Awaiting Signature</> :
                                                                isConfirming ? <><Loader2 className="w-5 h-5 animate-spin" /> Sealing Block...</> :
                                                                    isConfirmed ? <><CheckCircle2 className="w-5 h-5" /> Yield Extracted</> :
                                                                        <><Zap className="w-6 h-6" /> Extract Liquid Yield</>}
                                                        </div>
                                                    </motion.button>

                                                    {isConfirmed && (
                                                        <motion.a
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            href={`https://sepolia.basescan.org/tx/${hash}`}
                                                            target="_blank"
                                                            className="flex items-center justify-center gap-2 text-gray-500 hover:text-base-light text-xs font-bold tracking-widest uppercase transition-colors pt-2"
                                                        >
                                                            View Block Details <ExternalLink className="w-3 h-3" />
                                                        </motion.a>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div className="text-center p-8 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden group">
                                        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Lock className="w-8 h-8 text-gray-600 mx-auto mb-4 group-hover:text-red-400 group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-300" />
                                        <h4 className="text-white font-bold tracking-tight mb-2">Vault Locked</h4>
                                        <p className="text-xs font-medium text-gray-500 leading-relaxed text-balance">
                                            Identity synchronization required. Link your wallet via the navigation terminal to proceed.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </motion.div>
            </main>

            <style jsx global>{`
                @keyframes scan {
                    0% { transform: translateY(0); opacity: 1; }
                    50% { opacity: 1; }
                    100% { transform: translateY(80px); opacity: 0; }
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}

