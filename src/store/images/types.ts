export type ImageStoreKind = 'task' | 'reward' | 'user';

export interface IStateImages {
  taskUrls: Record<string, string>;
  rewardUrls: Record<string, string>;
  userUrls: Record<string, string>;
}
