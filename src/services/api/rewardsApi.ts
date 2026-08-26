import { ERewardStatus } from '~/types/EReward';
import { IReward, IRewardAssignment } from '~/types/IReward';

import { apiFetch, parseApiJson } from './client';

export type ServerFamilyReward = {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  cost: number;
  isActive: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export enum ServerRewardRedemptionStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
}

export type ServerRewardRedemption = {
  id: string;
  familyId: string;
  rewardId: string;
  childUserId: string;
  cost: number;
  status: ServerRewardRedemptionStatus;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
};

type CreateRewardBody = {
  title: string;
  description?: string;
  cost: number;
};

type UpdateRewardBody = {
  title?: string;
  description?: string;
  cost?: number;
  isActive?: boolean;
};

export async function listFamilyRewards(
  token: string,
  familyId: string,
) {
  const response = await apiFetch(
    `/families/${familyId}/rewards`,
    { token },
  );

  return parseApiJson<ServerFamilyReward[]>(response);
}

export async function createFamilyReward(
  token: string,
  familyId: string,
  body: CreateRewardBody,
) {
  const response = await apiFetch(
    `/families/${familyId}/rewards`,
    {
      method: 'POST',
      token,
      body,
    },
  );

  return parseApiJson<ServerFamilyReward>(response);
}

export async function updateFamilyReward(
  token: string,
  familyId: string,
  rewardId: string,
  body: UpdateRewardBody,
) {
  const response = await apiFetch(
    `/families/${familyId}/rewards/${rewardId}`,
    {
      method: 'PATCH',
      token,
      body,
    },
  );

  return parseApiJson<ServerFamilyReward>(response);
}

export async function deleteFamilyReward(
  token: string,
  familyId: string,
  rewardId: string,
) {
  await apiFetch(
    `/families/${familyId}/rewards/${rewardId}`,
    {
      method: 'DELETE',
      token,
    },
  );
}

export async function listRewardRedemptions(
  token: string,
  familyId: string,
  childUserId?: string,
) {
  const query = childUserId ? `?childUserId=${childUserId}` : '';
  const response = await apiFetch(
    `/families/${familyId}/rewards/redemptions${query}`,
    { token },
  );

  return parseApiJson<ServerRewardRedemption[]>(response);
}

export async function redeemFamilyReward(
  token: string,
  familyId: string,
  rewardId: string,
) {
  const response = await apiFetch(
    `/families/${familyId}/rewards/${rewardId}/redeem`,
    {
      method: 'POST',
      token,
    },
  );

  return parseApiJson<ServerRewardRedemption>(response);
}

export async function approveRewardRedemption(
  token: string,
  familyId: string,
  redemptionId: string,
) {
  const response = await apiFetch(
    `/families/${familyId}/rewards/redemptions/${redemptionId}/approve`,
    {
      method: 'POST',
      token,
    },
  );

  return parseApiJson<ServerRewardRedemption>(response);
}

export async function rejectRewardRedemption(
  token: string,
  familyId: string,
  redemptionId: string,
) {
  const response = await apiFetch(
    `/families/${familyId}/rewards/redemptions/${redemptionId}/reject`,
    {
      method: 'POST',
      token,
    },
  );

  return parseApiJson<ServerRewardRedemption>(response);
}

export async function completeRewardRedemption(
  token: string,
  familyId: string,
  redemptionId: string,
) {
  const response = await apiFetch(
    `/families/${familyId}/rewards/redemptions/${redemptionId}/complete`,
    {
      method: 'POST',
      token,
    },
  );

  return parseApiJson<ServerRewardRedemption>(response);
}

export function mapServerFamilyRewardToAssignment(
  server: ServerFamilyReward,
): IRewardAssignment {
  return {
    id: server.id,
    title: server.title,
    reward: server.cost,
    createdBy: server.createdByUserId,
    createdAt: server.createdAt,
    updatedAt: server.updatedAt,
  };
}

function mapRedemptionStatusToLocal(
  status: ServerRewardRedemptionStatus,
): ERewardStatus {
  switch (status) {
    case ServerRewardRedemptionStatus.approved:
      return ERewardStatus.Approved;
    case ServerRewardRedemptionStatus.rejected:
      return ERewardStatus.Rejected;
    default:
      return ERewardStatus.Selected;
  }
}

export function mapServerRedemptionToLocal(
  server: ServerRewardRedemption,
): IReward {
  const completedDate = server.completedAt?.slice(0, 10);

  return {
    id: server.id,
    rewardAssignmentId: server.rewardId,
    childId: server.childUserId,
    status: mapRedemptionStatusToLocal(server.status),
    completedDate,
    createdAt: server.createdAt,
    updatedAt:
      server.completedAt ??
      server.approvedAt ??
      server.rejectedAt ??
      server.createdAt,
  };
}

export function toCreateFamilyRewardBody(
  assignment: IRewardAssignment,
): CreateRewardBody {
  return {
    title: assignment.title,
    cost: assignment.reward,
  };
}

export function toUpdateFamilyRewardBody(
  assignment: IRewardAssignment,
): UpdateRewardBody {
  return {
    title: assignment.title,
    cost: assignment.reward,
    isActive: true,
  };
}
