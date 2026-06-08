import { EntityState } from '@reduxjs/toolkit';
import { IChild } from '~/types/IChild';

export interface IStateChildren extends EntityState<IChild, string> {}

export type AddChildrenPayload = {
  entity: IChild;
  onSuccess?: () => void;
};

export type UpdateChildrenPayload = AddChildrenPayload;

export type RemoveChildrenPayload = {
  id: string;
  onSuccess?: () => void;
};
