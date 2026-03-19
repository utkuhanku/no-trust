import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    try {
        const { data: campaigns, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (campaignError) throw campaignError;

        // Fetch claim counts for each campaign
        const { data: claims, error: claimError } = await supabase
            .from('claims')
            .select('campaign_id');

        if (claimError) throw claimError;

        const claimsCountMap = (claims || []).reduce((acc: any, claim: any) => {
            acc[claim.campaign_id] = (acc[claim.campaign_id] || 0) + 1;
            return acc;
        }, {});

        const enhancedCampaigns = campaigns.map(c => ({
            ...c,
            claims_count: claimsCountMap[c.id] || 0
        }));

        return NextResponse.json(enhancedCampaigns);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
