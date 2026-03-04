import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { TR_ABI } from '@/lib/abi'; // We will create this

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { campaignId, userAddress } = body;

        if (campaignId === undefined || !userAddress) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const normalizedUser = userAddress.toLowerCase();

        // 1. Verify Completion
        const { data: completion, error: compError } = await supabase
            .from('completions')
            .select('*')
            .eq('campaign_id', campaignId)
            .eq('user_address', normalizedUser)
            .single();

        if (compError || !completion) {
            return NextResponse.json({ error: 'User has not completed this campaign' }, { status: 403 });
        }

        if (completion.status !== 'verified') {
            return NextResponse.json({ error: 'Completion is not verified' }, { status: 403 });
        }

        // 2. Fetch Campaign Details
        const { data: campaign, error: campError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .single();

        if (campError || !campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // 3. Check for existing valid signature in DB
        const currentUnixTime = Math.floor(Date.now() / 1000);
        const { data: existingClaims } = await supabase
            .from('claims')
            .select('*')
            .eq('campaign_id', campaignId)
            .eq('user_address', normalizedUser)
            .order('created_at', { ascending: false });

        if (existingClaims && existingClaims.length > 0) {
            const latestClaim = existingClaims[0];
            if (latestClaim.status === 'claimed') {
                return NextResponse.json({ error: 'Reward already claimed on-chain' }, { status: 400 });
            }
            if (latestClaim.status === 'signed' && latestClaim.expiry > currentUnixTime + 60) {
                // We have a valid unexpired signature, return it
                return NextResponse.json({
                    signature: latestClaim.signature,
                    nonce: latestClaim.nonce,
                    expiry: latestClaim.expiry,
                    amount: latestClaim.amount
                });
            }
        }

        // 4. Connect to Base Sepolia to fetch the Nonce
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
        if (!contractAddress) {
            return NextResponse.json({ error: 'Contract address not configured' }, { status: 500 });
        }

        const publicClient = createPublicClient({
            chain: baseSepolia,
            transport: http()
        });

        const nonceOnChain = await publicClient.readContract({
            address: contractAddress,
            abi: TR_ABI,
            functionName: 'nonces',
            args: [BigInt(campaignId), userAddress as `0x${string}`]
        }) as bigint;

        const nonceStr = nonceOnChain.toString();

        // 5. Generate Signature
        const privateKey = process.env.SIGNER_PRIVATE_KEY as `0x${string}`;
        if (!privateKey) {
            return NextResponse.json({ error: 'Signer key not configured' }, { status: 500 });
        }

        const account = privateKeyToAccount(privateKey);
        const expiry = currentUnixTime + (15 * 60); // 15 minutes
        const amountWei = campaign.reward_per_claim_wei;

        const domain = {
            name: "BaseQuestHub",
            version: "1",
            chainId: baseSepolia.id,
            verifyingContract: contractAddress,
        };

        const types = {
            ClaimReward: [
                { name: "campaignId", type: "uint256" },
                { name: "user", type: "address" },
                { name: "amount", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "expiry", type: "uint256" }
            ],
        };

        const message = {
            campaignId: BigInt(campaignId),
            user: userAddress as `0x${string}`,
            amount: BigInt(amountWei),
            nonce: BigInt(nonceOnChain),
            expiry: BigInt(expiry)
        };

        const signature = await account.signTypedData({
            domain,
            types,
            primaryType: 'ClaimReward',
            message
        });

        // 6. Save to DB
        const { error: insertError } = await supabase
            .from('claims')
            .upsert({
                campaign_id: campaignId,
                user_address: normalizedUser,
                amount: amountWei,
                nonce: Number(nonceStr),
                expiry: expiry,
                signature: signature,
                status: 'signed'
            }, { onConflict: 'campaign_id, user_address, nonce' });

        if (insertError) {
            console.error('Failed to save claim:', insertError);
            return NextResponse.json({ error: 'Failed to record signature' }, { status: 500 });
        }

        return NextResponse.json({
            signature,
            nonce: Number(nonceStr),
            expiry,
            amount: amountWei
        });

    } catch (error) {
        console.error('Claim Signature Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
