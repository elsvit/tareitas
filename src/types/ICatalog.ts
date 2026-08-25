import { ISubtask } from '~/types/ITask';

export enum ECatalogItemSource {
  bundled = 'bundled',
  custom = 'custom',
}

export interface ITaskBaseCatalogItem {
  id: string;
  name: string;
  description?: string;
  reward?: number;
  picture?: string;
  time?: string;
  color?: string;
  subtasks?: ISubtask[];
  isHidden?: boolean;
  source?: ECatalogItemSource;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRewardBaseCatalogItem {
  id: string;
  title: string;
  reward: number;
  picture?: string;
  isHidden?: boolean;
  source?: ECatalogItemSource;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFamilyCatalog {
  taskBaseRevision: number;
  rewardBaseRevision: number;
  bundledTaskCatalogVersion: number;
  bundledRewardCatalogVersion: number;
  taskBase: ITaskBaseCatalogItem[];
  rewardBase: IRewardBaseCatalogItem[];
}

export interface ISyncCatalogPayload {
  bundledTaskCatalogVersion?: number;
  bundledRewardCatalogVersion?: number;
  clientTaskRevision?: number;
  clientRewardRevision?: number;
  taskBase?: ITaskBaseCatalogItem[];
  rewardBase?: IRewardBaseCatalogItem[];
  removedTaskBaseIds?: string[];
  removedRewardBaseIds?: string[];
}
