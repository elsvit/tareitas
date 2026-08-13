import { BASE_REWARDS_IMAGES } from '~/assets/img/rewards/rewards';
import { t } from '~/services';
import { IImageOption, IRewardBase } from '~/types';

export const getBaseRewards = (): IRewardBase[] => {
  return [
  {
    id: 'choose_desert',
    title: t('baseRewards.choose_desert'),
    picture: 'choose_desert',
    reward: 30,
  },
  {
    id: 'movie',
    title: t('baseRewards.movie'),
    picture: 'movie',
    reward: 40,
  },
  {
    id: 'screen_time',
    title: t('baseRewards.screen_time'),
    picture: 'screen_time',
    reward: 50,
  },
  {
    id: 'music_in_car',
    title: t('baseRewards.music_in_car'),
    picture: 'music_in_car',
    reward: 30,
  },
  {
    id: 'stay_up_15_minutes_more',
    title: t('baseRewards.stay_up_15_minutes_more'),
    picture: 'stay_up_15_minutes_more',
    reward: 50,
  },
  {
    id: 'choose_breakfast',
    title: t('baseRewards.choose_breakfast'),
    picture: 'choose_breakfast',
    reward: 40,
  },
  {
    id: 'choose_family_game',
    title: t('baseRewards.choose_family_game'),
    picture: 'choose_family_game',
    reward: 40,
  },
  {
    id: 'skip_one_chore',
    title: t('baseRewards.skip_one_chore'),
    picture: 'skip_one_chore',
    reward: 70,
  },
  {
    id: 'choose_what_for_dinner',
    title: t('baseRewards.choose_what_for_dinner'),
    picture: 'choose_what_for_dinner',
    reward: 80,
  },
  {
    id: 'special_time_with_parents',
    title: t('baseRewards.special_time_with_parents'),
    picture: 'special_time_with_parents',
    reward: 100,
  },
  {
    id: 'trip_to_playground',
    title: t('baseRewards.trip_to_playground'),
    picture: 'trip_to_playground',
    reward: 60,
  },
  {
    id: 'ice_cream',
    title: t('baseRewards.ice_cream'),
    picture: 'ice_cream',
    reward: 120,
  },
  ];
};

type RewardImageKey = keyof typeof BASE_REWARDS_IMAGES;

export const getRewardImageOptions = (): IImageOption[] => {
  const baseRewards = getBaseRewards();

  return (Object.keys(BASE_REWARDS_IMAGES) as RewardImageKey[]).map(value => {
    const task = baseRewards.find(item => item.picture === value);

    return {
      label: task?.title ?? value,
      value,
      image: BASE_REWARDS_IMAGES[value],
    };
  });
};