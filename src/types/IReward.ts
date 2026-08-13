export interface IRewardBase extends Partial<CreatedProps> {
  id: string;
  title: string;
  reward?: number;
  picture?: string;
}

export type RewardBaseFormProps = OmitCreatedKeys<IRewardBase>;

export interface IReward extends Partial<CreatedProps> {
  id: string;
  title: string;
  reward?: number;
  picture?: string;
}
