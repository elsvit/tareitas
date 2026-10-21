import React from 'react';

import { DeferredMainTabScreen } from '~/components/navigation';

export default function HabitsTab() {
  return (
    <DeferredMainTabScreen
      testID="habits-tab-shell"
      loadScreen={() => import('../tasks/Habits')}
    />
  );
}
