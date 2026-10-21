import React from 'react';

import { DeferredMainTabScreen } from '~/components/navigation';

export default function TasksTab() {
  return (
    <DeferredMainTabScreen
      testID="tasks-tab-shell"
      loadScreen={() => import('../tasks/Tasks')}
    />
  );
}
