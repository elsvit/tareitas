import { EntityState } from '@reduxjs/toolkit';
import { IParent } from '~/types/IParent';

export interface IStateParents extends EntityState<IParent, string> {}

export type AddParentPayload = {
  entity: IParent;
  onSuccess?: () => void;
};

export type UpdateParentPayload = AddParentPayload;

export type RemoveParentPayload = {
  id: string;
  onSuccess?: () => void;
};
