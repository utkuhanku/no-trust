import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Campaign {
    id: string; // UUID from DB
    title: string;
    description: string;
    partner_name: string;
    partner_logo_url: string;
    reward_pool: number;
    reward_amount: number;
    currency: 'USDC' | 'ETH';
    contract_campaign_id: number;
    action_url: string; // The link to redirect users to
    active: boolean;
    participants: number;
}

// Temporary Mock Data for UI before DB integration
export const MOCK_CAMPAIGNS: Campaign[] = [
    {
        id: "uuid-1",
        title: "ETHDenver 2026 Participation",
        description: "Play 'Word Rain' during ETHDenver and reach a score of 1000 to instantly claim $10 USDC.",
        partner_name: "Word Rain",
        partner_logo_url: "/placeholder-wordrain.png", // Will use generated or generic icons
        reward_pool: 250,
        reward_amount: 10,
        currency: 'USDC',
        contract_campaign_id: 1,
        action_url: "https://wordrain.example.com",
        active: true,
        participants: 12,
    },
    {
        id: "uuid-2",
        title: "Create BaseMe Profile",
        description: "Mint your on-chain identity on BaseMe and link your Farcaster account to receive 0.005 ETH.",
        partner_name: "BaseMe",
        partner_logo_url: "/placeholder-baseme.png",
        reward_pool: 5,
        reward_amount: 0.005,
        currency: 'ETH',
        contract_campaign_id: 2,
        action_url: "https://baseme.example.com",
        active: true,
        participants: 840,
    }
];
