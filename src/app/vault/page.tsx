'use client';

import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Lock, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { formatEther } from 'viem';

interface Claim {
    id: string;
    campaign_id: string;
    amount: string;
    nonce: string;
    expiry: string;
    signature: string;
    status: string;
    campaigns?: {
        partner_name: string;
        title: string;
        currency: string;
    };
}

export default function ClaimVault() {
    const { isConnected, address } = useAccount();
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (!address) {
            setTimeout(() => setLoading(false), 0);
            return;
        }

        const fetchClaims = async () => {
            const { data, error } = await supabase
                .from('claims')
                .select(`
                    *,
                    campaigns (
                        title,
                        partner_name,
                        currency
                    )
                `)
                .eq('user_address', address.toLowerCase())
                .order('created_at', { ascending: false });

            if (!error && data) {
                setClaims(data);
            }
            setLoading(false);
        };
        fetchClaims();
    }, [address]);

    const executeClaim = (claim: Claim) => {
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
                BigInt(claim.campaign_id),
                BigInt(claim.amount),
                BigInt(claim.nonce),
                BigInt(claim.expiry),
                claim.signature
            ],
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#010101] overflow-hidden relative selection:bg-base-blue/30 text-white font-sans">
            <Navbar />

            {/* Depth & Noise Layer */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[url('/grid.svg')] bg-center bg-[length:40px_40px] opacity-[0.03] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_80%)]">
                <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }} />
            </div>

            <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-20 relative z-20">
                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-6">
                        <Lock className="w-3 h-3 text-base-light" />
                        <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Encrypted Storage</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white">Claim Vault</h1>
                    <p className="text-gray-400 max-w-xl text-lg text-balance font-light">
                        Liquidate cryptographic proofs. Access your signed, pending yields natively generated across the BaseQuestHub syndicate network.
                    </p>
                </div>

                {!isConnected ? (
                    <div className="p-12 border border-white/10 bg-black/40 backdrop-blur-md rounded-3xl text-center group relative overflow-hidden">
                        <div className="absolute inset-0 bg-base-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl pointer-events-none" />
                        <Lock className="w-12 h-12 text-gray-600 group-hover:text-base-light transition-colors duration-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold tracking-tight mb-2">Vault Sealed</h2>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">Authenticate your wallet to inspect cryptographic claims and extract yield.</p>
                    </div>
                ) : loading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white/20 animate-spin mb-4" />
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Querying Signatures...</span>
                    </div>
                ) : claims.length === 0 ? (
                    <div className="p-12 border border-white/10 bg-black/40 backdrop-blur-md rounded-3xl text-center">
                        <Archive className="w-12 h-12 text-white/10 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold tracking-tight mb-2">Empty Vault</h2>
                        <p className="text-gray-500 text-sm">No cryptographic claims available for this identity.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {claims.map((claim, idx) => (
                                <motion.div
                                    key={claim.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-[#050507]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col justify-between group hover:border-white/20 transition-all shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 group-hover:via-white/30 to-transparent transition-all" />

                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">{claim.campaigns?.partner_name}</span>
                                                <h3 className="text-xl font-bold text-white tracking-tight">{claim.campaigns?.title}</h3>
                                            </div>
                                            {claim.status === 'signed' ? (
                                                <div className="bg-base-blue/10 text-base-light border border-base-blue/20 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-base-light animate-pulse" /> Pending
                                                </div>
                                            ) : (
                                                <div className="bg-white/5 text-gray-400 border border-white/10 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-3 h-3" /> Extracted
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-end gap-2 mb-8">
                                            <span className="text-4xl font-black text-white tracking-tighter leading-none">{formatEther(BigInt(claim.amount))}</span>
                                            <span className="text-lg font-bold text-gray-500">{claim.campaigns?.currency}</span>
                                        </div>
                                    </div>

                                    {claim.status === 'signed' ? (
                                        <button
                                            onClick={() => executeClaim(claim)}
                                            disabled={isPending || isConfirming}
                                            className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                        >
                                            {isPending || isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Extract Yield</>}
                                        </button>
                                    ) : (
                                        <div className="w-full bg-white/5 border border-white/10 text-gray-500 font-bold py-4 rounded-xl flex items-center justify-center text-sm">
                                            Yield Extracted On-Chain
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
