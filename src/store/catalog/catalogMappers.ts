import { getBaseRewards } from '~/constants/rewards';
import { getBaseTasks } from '~/constants/tasks';
import {
  ECatalogItemSource,
  IRewardBaseCatalogItem,
  ITaskBaseCatalogItem,
} from '~/types/ICatalog';
import { IRewardBase } from '~/types/IReward';
import { ITaskBase } from '~/types/ITask';

const bundledTaskIds = () =>
  new Set(getBaseTasks().map(task => task.id));

const bundledRewardIds = () =>
  new Set(getBaseRewards().map(reward => reward.id));

export const toTaskBaseSyncItem = (item: ITaskBase) => ({
  id: item.id,
  name: item.name,
  description: item.description,
  reward: item.reward,
  picture: item.picture,
  time: item.time,
  color: item.color,
  subtasks: item.subtasks,
  isHidden: item.isHidden,
  source: bundledTaskIds().has(item.id)
    ? ECatalogItemSource.bundled
    : ECatalogItemSource.custom,
});

export const toRewardBaseSyncItem = (item: IRewardBase) => ({
  id: item.id,
  title: item.title,
  reward: item.reward,
  picture: item.picture,
  isHidden: item.isHidden,
  source: bundledRewardIds().has(item.id)
    ? ECatalogItemSource.bundled
    : ECatalogItemSource.custom,
});

export const mapCatalogTaskBaseToLocal = (
  items: ITaskBaseCatalogItem[],
): ITaskBase[] =>
  items.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    reward: item.reward,
    picture: item.picture,
    time: item.time,
    color: item.color,
    subtasks: item.subtasks,
    isHidden: item.isHidden,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

export const mapCatalogRewardBaseToLocal = (
  items: IRewardBaseCatalogItem[],
): IRewardBase[] =>
  items.map(item => ({
    id: item.id,
    title: item.title,
    reward: item.reward,
    picture: item.picture,
    isHidden: item.isHidden,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
