import { createSelector } from '@reduxjs/toolkit';

import { selectFamilyId } from '~/store/settings/selectors';
import { filterFamilyImageEntries, mergeFamilyUploadImageEntries } from '~/utils/imageScope';
import { selectAllChildren } from '~/store/children/selectors';
import { selectAllParents } from '~/store/parents/selectors';
import { selectAllRewardAssignment } from '~/store/rewardAssignment/selectors';
import { selectAllRewardBase } from '~/store/rewardBase/selectors';
import type { IState } from '~/store/types';
import type { IStateImages } from './types';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';
import { selectAllTaskBase } from '~/store/taskBase/selectors';

const selectImagesState = (state: IState): IStateImages => state.images;

const collectPictureIds = (
  items: Array<{ picture?: string } | { avatar?: string }>,
  field: 'picture' | 'avatar',
) => {
  const ids = new Set<string>();

  items.forEach(item => {
    const value = field === 'picture'
      ? (item as { picture?: string }).picture
      : (item as { avatar?: string }).avatar;

    if (value) {
      ids.add(value);
    }
  });

  return ids;
};

export const selectUsedUserImageIds = createSelector(
  [selectAllChildren, selectAllParents],
  (children, parents) => {
    const ids = collectPictureIds(children, 'avatar');
    collectPictureIds(parents, 'avatar').forEach(id => ids.add(id));
    return ids;
  },
);

export const selectUsedTaskImageIds = createSelector(
  [selectAllTaskAssignment, selectAllTaskBase],
  (assignments, baseTasks) => {
    const ids = collectPictureIds(assignments, 'picture');
    collectPictureIds(baseTasks, 'picture').forEach(id => ids.add(id));
    return ids;
  },
);

export const selectUsedRewardImageIds = createSelector(
  [selectAllRewardAssignment, selectAllRewardBase],
  (assignments, baseRewards) => {
    const ids = collectPictureIds(assignments, 'picture');
    collectPictureIds(baseRewards, 'picture').forEach(id => ids.add(id));
    return ids;
  },
);

export const selectTaskImageUrls = createSelector(
  selectImagesState,
  images => images.taskUrls,
);

export const selectRewardImageUrls = createSelector(
  selectImagesState,
  images => images.rewardUrls,
);

export const selectUserImageUrls = createSelector(
  selectImagesState,
  images => images.userUrls,
);

export const selectTaskImageUrlById = (state: IState, id: string) =>
  selectTaskImageUrls(state)[id];

export const selectRewardImageUrlById = (state: IState, id: string) =>
  selectRewardImageUrls(state)[id];

export const selectUserImageUrlById = (state: IState, id: string) =>
  selectUserImageUrls(state)[id];

const selectFamilyImageFilterOptions = createSelector(
  [selectFamilyId],
  familyId => ({ familyId }),
);

export const selectFamilyScopedUserImageEntries = createSelector(
  [
    selectUserImageUrls,
    selectUsedUserImageIds,
    selectFamilyImageFilterOptions,
  ],
  (userUrls, usedIds, { familyId }) =>
    filterFamilyImageEntries(
      mergeFamilyUploadImageEntries(userUrls, usedIds, familyId),
      {
        familyId,
        usedIds,
      },
    ),
);

export const selectFamilyScopedTaskImageEntries = createSelector(
  [
    selectTaskImageUrls,
    selectUsedTaskImageIds,
    selectFamilyImageFilterOptions,
  ],
  (taskUrls, usedIds, { familyId }) =>
    filterFamilyImageEntries(
      mergeFamilyUploadImageEntries(taskUrls, usedIds, familyId),
      {
        familyId,
        usedIds,
      },
    ),
);

export const selectFamilyScopedRewardImageEntries = createSelector(
  [
    selectRewardImageUrls,
    selectUsedRewardImageIds,
    selectFamilyImageFilterOptions,
  ],
  (rewardUrls, usedIds, { familyId }) =>
    filterFamilyImageEntries(
      mergeFamilyUploadImageEntries(rewardUrls, usedIds, familyId),
      {
        familyId,
        usedIds,
      },
    ),
);
