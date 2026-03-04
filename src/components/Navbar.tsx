'use client';

import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownLink,
    WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
    Address,
    Avatar,
    Name,
    Identity,
    EthBalance
} from '@coinbase/onchainkit/identity';

export function Navbar() {
    return (
        <nav className="flex justify-between items-center w-full max-w-7xl mx-auto px-6 py-4 glass-panel mt-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                    NT
                </div>
                <span className="font-semibold text-lg tracking-tight">No-Trust</span>
            </div>

            <div className="flex items-center gap-4">
                <Wallet>
                    <ConnectWallet>
                        <Avatar className="h-6 w-6" />
                        <Name />
                    </ConnectWallet>
                    <WalletDropdown>
                        <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                            <Avatar />
                            <Name />
                            <Address />
                            <EthBalance />
                        </Identity>
                        <WalletDropdownLink
                            icon="wallet"
                            href="https://keys.coinbase.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Wallet
                        </WalletDropdownLink>
                        <WalletDropdownDisconnect />
                    </WalletDropdown>
                </Wallet>
            </div>
        </nav>
    );
}
