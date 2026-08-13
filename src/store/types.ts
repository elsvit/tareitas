import type { IStateChildren } from './children/types';
import type { IStateCommon } from './common/types';
import type { EStateName } from './enums';
import type { IStateParents } from './parents/types';
import type { IStateSettings } from './settings/types';
import type { IStateRewardBase } from './rewardBase/types';
import type { IStateRewardAssignment } from './rewardAssignment/types';
import type { IStateRewards } from './rewards/types';
import type { IStateTaskAssignment } from './taskAssignment/types';
import type { IStateTaskBase } from './taskBase/types';
import type { IStateTasks } from './tasks/types';

export interface IState {
  [EStateName.common]: IStateCommon;
  [EStateName.settings]: IStateSettings;
  [EStateName.parents]: IStateParents;
  [EStateName.children]: IStateChildren;
  [EStateName.tasks]: IStateTasks;
  [EStateName.taskBase]: IStateTaskBase;
  [EStateName.rewardBase]: IStateRewardBase;
  [EStateName.taskAssignment]: IStateTaskAssignment;
  [EStateName.rewardAssignment]: IStateRewardAssignment;
  [EStateName.rewards]: IStateRewards;
}

export type Saga = (...args: any[]) => Generator<any>;
