'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbiItem, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000';

export function NetworkStats() {
    const [stats, setStats] = useState({
        activeCampaigns: '0',
        totalEscrowed: '0.00',
        totalPaid: '0.00'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOnChainData = async () => {
            try {
                const publicClient = createPublicClient({
                    chain: baseSepolia,
                    transport: http()
                });

                // 1. Fetch Active Campaigns (nextCampaignId)
                const nextCampaignId = await publicClient.readContract({
                    address: contractAddress,
                    abi: [{ "inputs": [], "name": "nextCampaignId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }],
                    functionName: 'nextCampaignId',
                }) as bigint;

                // 2. Fetch Events for Total Escrowed & Paid
                // Note: In production, you'd use a subgraph. For demo, we parse logs from a recent block range
                // We'll use a broad block range for the testnet.
                const currentBlock = await publicClient.getBlockNumber();
                const fromBlock = currentBlock - BigInt(50000) > BigInt(0) ? currentBlock - BigInt(50000) : BigInt(0); // arbitrary lookback

                const depositLogs = await publicClient.getLogs({
                    address: contractAddress,
                    event: parseAbiItem('event FundsDeposited(uint256 indexed campaignId, uint256 amount)'),
                    fromBlock: fromBlock,
                    toBlock: 'latest'
                });

                const claimLogs = await publicClient.getLogs({
                    address: contractAddress,
                    event: parseAbiItem('event Claimed(uint256 indexed campaignId, address indexed user, uint256 amount, uint256 nonce, uint256 feeAmount)'),
                    fromBlock: fromBlock,
                    toBlock: 'latest'
                });

                // Sum deposits
                let totalEscrowedWei = BigInt(0);
                depositLogs.forEach(log => {
                    if (log.args.amount) totalEscrowedWei += log.args.amount;
                });

                // Sum claims
                let totalPaidWei = BigInt(0);
                claimLogs.forEach(log => {
                    if (log.args.amount) totalPaidWei += log.args.amount;
                });

                // Subtract claims from escrowed to get *current* total escrowed (optional approach)
                // We'll show lifetime deposited as "Total Escrowed Volume"

                setStats({
                    activeCampaigns: nextCampaignId.toString(),
                    totalEscrowed: Number(formatEther(totalEscrowedWei)).toFixed(2),
                    totalPaid: Number(formatEther(totalPaidWei)).toFixed(2)
                });
            } catch (error) {
                console.error("Failed to fetch on-chain stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (contractAddress !== '0x0000000000000000000000000000000000000000') {
            fetchOnChainData();
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16 mb-8 lg:mt-24"
        >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 relative overflow-hidden group hover:bg-white/[0.07] transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-base-blue/10 rounded-full blur-3xl group-hover:bg-base-blue/20 transition-all pointer-events-none" />
                <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-5 h-5 text-gray-500" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Objectives</span>
                </div>
                <div className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
                    {loading ? '-' : stats.activeCampaigns}
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 relative overflow-hidden group hover:bg-white/[0.07] transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all pointer-events-none" />
                <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-5 h-5 text-gray-500" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Escrowed Volume</span>
                </div>
                <div className="text-4xl lg:text-5xl font-black text-white tracking-tighter flex items-end gap-2">
                    {loading ? '-' : stats.totalEscrowed}
                    {!loading && <span className="text-lg text-gray-500 mb-1">ETH</span>}
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 relative overflow-hidden group hover:bg-white/[0.07] transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
                <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-gray-500" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Paid Out</span>
                </div>
                <div className="text-4xl lg:text-5xl font-black text-white tracking-tighter flex items-end gap-2">
                    {loading ? '-' : stats.totalPaid}
                    {!loading && <span className="text-lg text-gray-500 mb-1">ETH</span>}
                </div>
            </div>
        </motion.div>
    );
}
