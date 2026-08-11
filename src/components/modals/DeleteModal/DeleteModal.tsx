import React from 'react';

import { ButtonColors } from '~/components/ui';
import { t } from '~/services';

import { ConfirmModal, ConfirmModalProps } from '../ConfirmModal';

type Props = Omit<
  ConfirmModalProps,
  'title' | 'message' | 'confirmLabel' | 'confirmBgColor'
> & {
  title?: string;
  message?: string;
  confirmLabel?: string;
};

export const DeleteModal: React.FC<Props> = ({
  title = t('tasks.delete_task'),
  message = t('tasks.delete_task_confirm'),
  confirmLabel = t('button.delete'),
  ...rest
}) => (
  <ConfirmModal
    title={title}
    message={message}
    confirmLabel={confirmLabel}
    confirmBgColor={ButtonColors.Red}
    {...rest}
  />
);

export default DeleteModal;
