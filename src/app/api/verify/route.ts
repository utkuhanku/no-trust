import { createClient } from '@supabase/supabase-js';
import { NextResponse, NextRequest } from 'next/server';
import { Wallet, JsonRpcProvider, solidityPackedKeccak256, Contract } from 'ethers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const PRIVATE_KEY = process.env.VERIFIER_PRIVATE_KEY!;

interface VerifyRequest {
    campaignId: number;
    userAddress: string;
    checkOnly?: boolean;
}

export interface VerifyResponse {
    signature?: string;
    error?: string;
    status?: string;
    diff?: number;
    value?: string;
}

export async function POST(req: NextRequest) {
    try {
        if (!PRIVATE_KEY) {
            throw new Error('Verifier strictly configured');
        }

        const body = (await req.json()) as VerifyRequest;
        const { campaignId, userAddress, checkOnly } = body;

        if (campaignId === undefined || !userAddress) {
            return NextResponse.json({ error: 'Missing campaignId or userAddress' }, { status: 400 });
        }

        // 1. Fetch Campaign
        const { data: campaign, error: campError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('on_chain_id', campaignId)
            .single();

        if (campError || !campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // 2. Check claim_records for duplicates
        const { count } = await supabase
            .from('claim_records')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', campaign.id)
            .eq('user_address', userAddress.toLowerCase());

        if (count && count > 0) {
            return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
        }

        // 3. Check Criteria
        const provider = new JsonRpcProvider(RPC_URL);
        const threshold = BigInt(campaign.criteria_value);
        let qualifies = false;
        let diff = 0;
        let stringValue = '0';

        if (campaign.criteria_type === 'token_balance' || campaign.criteria_type === 'nft_hold') {
            const abi = ["function balanceOf(address) view returns (uint256)"];
            const contract = new Contract(campaign.criteria_target, abi, provider);
            try {
                const balance = await contract.balanceOf(userAddress);
                qualifies = balance >= threshold;
                if (!qualifies) {
                    diff = Number((threshold - balance).toString());
                }
                stringValue = balance.toString();
            } catch (err) {
                return NextResponse.json({ error: 'Failed to read contract state' }, { status: 500 });
            }
        } else if (campaign.criteria_type === 'contract_call') {
            // Simplified custom call handling for demo: assume a generic 'verify(address)' function
            const abi = ["function verify(address) view returns (bool)"];
            const contract = new Contract(campaign.criteria_target, abi, provider);
            try {
                qualifies = await contract.verify(userAddress);
                stringValue = qualifies ? 'true' : 'false';
            } catch (err) {
                return NextResponse.json({ error: 'Failed custom verification' }, { status: 500 });
            }
        }

        if (!qualifies) {
            return NextResponse.json({ 
                error: 'Criteria not met', 
                diff,
                value: stringValue
            }, { status: 400 });
        }

        if (checkOnly) {
            return NextResponse.json({ status: 'qualifies', value: stringValue });
        }

        // 4. Sign keccak256
        const wallet = new Wallet(PRIVATE_KEY);
        const messageHash = solidityPackedKeccak256(
            ['uint256', 'address'],
            [campaignId, userAddress]
        );
        
        // EIP-191 signature
        const signature = await wallet.signMessage(ethers.getBytes(messageHash));

        // 5. Return
        return NextResponse.json({ signature, value: stringValue });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import * as ethers from 'ethers';
