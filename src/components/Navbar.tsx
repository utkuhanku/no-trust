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
import { cn } from '@/lib/utils';
import { useAccount, useChainId } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

interface NavbarProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

export function Navbar({ activeView, onViewChange }: NavbarProps) {
    const { isConnected } = useAccount();
    const chainId = useChainId();

    const isBase = chainId === base.id || chainId === baseSepolia.id;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/40 backdrop-blur-xl transition-all">
            {/* Left: Logo */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => onViewChange('discover')}>
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <div className="absolute inset-0 bg-indigo-600 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 p-1.5 flex items-center justify-center">
                            <div className="w-full h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg tracking-tight leading-none text-white">No-Trust</span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">on Base</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center: Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/5 rounded-full p-1">
                {['discover', 'distribute', 'activity'].map((view) => (
                    <button
                        key={view}
                        onClick={() => onViewChange(view)}
                        className={cn(
                            "px-5 py-1.5 text-xs font-semibold rounded-full transition-all capitalize",
                            activeView === view
                                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                : "text-gray-400 hover:text-white"
                        )}
                    >
                        {view === 'activity' ? 'My Activity' : view}
                    </button>
                ))}
            </div>

            {/* Right: Wallet & Network */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full">
                    <div className={cn("w-2 h-2 rounded-full", isBase ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-yellow-500 animate-pulse")} />
                    <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                        {isBase ? 'Base' : 'Wrong Network'}
                    </span>
                </div>

                <Wallet>
                    <ConnectWallet className="!bg-indigo-600 !hover:bg-indigo-500 !text-white !border-none !rounded-full !px-5 !py-1.5 !h-auto !min-h-0 !text-xs !font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                        <Avatar className="h-4 w-4" />
                        <Name className="!text-white" />
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
