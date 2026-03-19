'use client';

import { useEffect, useState } from 'react';
import { Campaign } from '@/app/api/campaigns/route';
import { CampaignCard } from './CampaignCard';
import { Compass, Search } from 'lucide-react';

export function DiscoverView({ onCampaignSelect }: { onCampaignSelect: (id: number) => void }) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await fetch('/api/campaigns');
                if (!res.ok) throw new Error('Failed to fetch campaigns');
                const data: Campaign[] = await res.json();
                setCampaigns(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    const filtered = campaigns.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.token_symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-medium tracking-tight text-white italic">Discover Rewards</h1>
                    <p className="text-gray-500">Explore on-chain tasks and claim tokens instantly with zero middleman.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center text-gray-600">
                    <Compass className="w-8 h-8 animate-pulse mb-4" />
                    <p>Scanning active campaigns...</p>
                </div>
            ) : error ? (
                <div className="p-8 text-center text-red-400 bg-red-500/10 rounded-2xl">{error}</div>
            ) : campaigns.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center text-gray-600 bg-white/5 border border-white/10 rounded-3xl">
                    <p>No active campaigns found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map(campaign => (
                        <CampaignCard 
                            key={campaign.on_chain_id} 
                            campaign={campaign} 
                            onClick={() => onCampaignSelect(campaign.on_chain_id)} 
                        />
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full p-8 text-center text-gray-500">No campaigns match your search.</div>
                    )}
                </div>
            )}
        </div>
    );
}
