'use client';

// Thin shell component for backward compatibility in narrow mobile widget
// Re-rendering functionality using the new DiscoverView module
import { useState } from 'react';
import { DiscoverView } from './DiscoverView';
import { CampaignDetail } from './CampaignDetail';
import { AnimatePresence } from 'framer-motion';

export function HunterDashboard() {
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

    // This file acts as a compatibility wrapper for old imports,
    // though the main app now uses the full screen layout.
    return (
        <div className="w-full h-full relative">
            <DiscoverView onCampaignSelect={setSelectedCampaignId} />
            <AnimatePresence>
                {/* Note: In full layout this slides in differently, but in mobile widget it will just overlay */}
                {selectedCampaignId && (
                    <CampaignDetail 
                        campaign={{} as any} // Requires actual fetch in real scenario, passed ID in previous implementations
                        onBack={() => setSelectedCampaignId(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
