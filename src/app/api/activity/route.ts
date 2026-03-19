import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 10; // Cache-Control: max-age=10

export interface ActivityEvent {
    user_address: string;
    created_at: string;
    title: string;
    token_symbol: string;
    reward_per_user: string;
    token_decimals: number;
}

export interface ActivityResponse {
    events: ActivityEvent[];
    error?: string;
}

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('claim_records')
            .select(`
                user_address,
                created_at,
                campaign:campaign_id (
                    title,
                    token_symbol,
                    reward_per_user,
                    token_decimals
                )
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        const events: ActivityEvent[] = (data || []).map((record: any) => ({
            user_address: record.user_address,
            created_at: record.created_at,
            title: record.campaign?.title || 'Unknown Campaign',
            token_symbol: record.campaign?.token_symbol || 'TOKEN',
            reward_per_user: record.campaign?.reward_per_user || '0',
            token_decimals: record.campaign?.token_decimals || 18
        }));

        return NextResponse.json({ events });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
