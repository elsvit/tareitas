import React from 'react';

import { DeferredMainTabScreen } from '~/components/navigation';

export default function RewardsTab() {
  return (
    <DeferredMainTabScreen
      testID="rewards-tab-shell"
      loadScreen={() => import('../rewards/Rewards')}
    />
  );
}
