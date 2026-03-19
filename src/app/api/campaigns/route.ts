import { createClient } from '@supabase/supabase-js';
import { NextResponse, NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface Campaign {
    id?: string;
    on_chain_id: number;
    title: string;
    description?: string;
    creator_address: string;
    pool_amount: string;
    reward_per_user: string;
    token_address: string;
    token_symbol: string;
    token_decimals: number;
    max_claims: number;
    current_claims: number;
    criteria_type: 'token_balance' | 'nft_hold' | 'contract_call';
    criteria_target: string;
    criteria_value: string;
    is_active: boolean;
    ends_at: string;
    created_at?: string;
}

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        const campaigns: Campaign[] = (data || []).map((c: any) => ({
            ...c,
            criteria_type: c.criteria_type as 'token_balance' | 'nft_hold' | 'contract_call'
        }));

        return NextResponse.json(campaigns);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const campaign: Campaign = body;

        if (!campaign.on_chain_id || !campaign.creator_address || !campaign.title) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('campaigns')
            .insert({
                on_chain_id: campaign.on_chain_id,
                title: campaign.title,
                description: campaign.description || '',
                creator_address: campaign.creator_address.toLowerCase(),
                pool_amount: campaign.pool_amount,
                reward_per_user: campaign.reward_per_user,
                token_address: campaign.token_address.toLowerCase(),
                token_symbol: campaign.token_symbol,
                token_decimals: campaign.token_decimals,
                max_claims: campaign.max_claims,
                current_claims: 0,
                criteria_type: campaign.criteria_type,
                criteria_target: campaign.criteria_target.toLowerCase(),
                criteria_value: campaign.criteria_value,
                is_active: true,
                ends_at: campaign.ends_at
            })
            .select('*')
            .single();

        if (error) throw error;

        return NextResponse.json(data as Campaign, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
