import { MOCK_CAMPAIGNS } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { createWalletClient, http, custom } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

export async function POST(request: Request) {
    try {
        const { campaignId, user, amount } = await request.json();

        if (!campaignId || !user || !amount) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const campaign = MOCK_CAMPAIGNS.find((c) => c.contract_campaign_id === Number(campaignId));
        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // In a real scenario, this would check Supabase:
        // const { data } = await supabase.from('user_progress').select('*').eq('user_id', user).eq('campaign_id', campaign.id);
        // if (!data || data.status !== 'COMPLETED') throw new Error('Not eligible');

        const privateKey = process.env.SIGNER_PRIVATE_KEY as `0x${string}`;
        if (!privateKey) {
            console.error('SERVER ERROR: SIGNER_PRIVATE_KEY is missing in backend env');
            return NextResponse.json({ error: 'Internal Server Error (No Key)' }, { status: 500 });
        }

        const account = privateKeyToAccount(privateKey);
        // Use the actual contract address obtained after deployment
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

        // Nonce simulation for simplicity. In prod, fetch the nonce from DB or Contract
        const nonce = Math.floor(Math.random() * 1000000);

        const domain = {
            name: "BaseQuestHub",
            version: "1",
            chainId: baseSepolia.id,
            verifyingContract: contractAddress as `0x${string}`,
        };

        const types = {
            ClaimReward: [
                { name: "campaignId", type: "uint256" },
                { name: "user", type: "address" },
                { name: "amount", type: "uint256" },
                { name: "nonce", type: "uint256" }
            ],
        };

        const message = {
            campaignId: BigInt(campaignId),
            user: user as `0x${string}`,
            amount: BigInt(amount),
            nonce: BigInt(nonce)
        };

        const signature = await account.signTypedData({
            domain,
            types,
            primaryType: 'ClaimReward',
            message
        });

        return NextResponse.json({ signature, nonce });

    } catch (error) {
        console.error('Signature Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
    }
}
