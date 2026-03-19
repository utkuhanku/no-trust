'use client';

import { useState } from 'react';
import { DiscoverView } from '@/components/DiscoverView';
import { CampaignDetail } from '@/components/CampaignDetail';
import { DistributeWizard } from '@/components/DistributeWizard';
import { MyActivityView } from '@/components/MyActivityView';
import { useView } from '@/context/ViewContext';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const { activeView } = useView();
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  const renderView = () => {
    switch (activeView) {
      case 'discover':
        return <DiscoverView onCampaignSelect={setSelectedCampaignId} />;
      case 'distribute':
        return <DistributeWizard />;
      case 'activity':
        return <MyActivityView />;
      default:
        return <DiscoverView onCampaignSelect={setSelectedCampaignId} />;
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectedCampaignId && (
          <CampaignDetail 
            campaignId={selectedCampaignId} 
            onClose={() => setSelectedCampaignId(null)} 
          />
        )}
      </AnimatePresence>

      {/* Ambient background glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen opacity-50" />
    </div>
  );
}
