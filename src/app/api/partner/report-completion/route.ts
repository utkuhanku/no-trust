import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { partnerApiKey, campaignId, userAddress, partnerReference } = body;

        if (!partnerApiKey || !campaignId || !userAddress) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Mock MVP API Key validation (In Prod, verify against `partners` table)
        const validApiKey = process.env.PARTNER_API_KEY || 'demo-partner-key-123';
        if (partnerApiKey !== validApiKey) {
            return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
        }

        // Verify Campaign exists and is active
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('id, status')
            .eq('id', campaignId)
            .single();

        if (campaignError || !campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        if (campaign.status !== 'active') {
            return NextResponse.json({ error: 'Campaign is not active' }, { status: 400 });
        }

        // Insert Completion
        const { error: insertError } = await supabase
            .from('completions')
            .insert({
                campaign_id: campaignId,
                user_address: userAddress.toLowerCase(),
                partner_reference: partnerReference || null
            });

        if (insertError) {
            // Check for unique constraint violation (code 23505 in Postgres)
            if (insertError.code === '23505') {
                return NextResponse.json({ message: 'User already completed this campaign' }, { status: 200 });
            }
            console.error('Insert Completion Error:', insertError);
            return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Completion recorded successfully' }, { status: 201 });

    } catch (error) {
        console.error('Report Completion Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
