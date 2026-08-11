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

export const ResetModal: React.FC<Props> = ({
  title = t('tasks.reset_base_tasks'),
  message = t('tasks.reset_base_tasks_confirm'),
  confirmLabel = t('button.reset'),
  ...rest
}) => (
  <ConfirmModal
    title={title}
    message={message}
    confirmLabel={confirmLabel}
    confirmBgColor={ButtonColors.Orange}
    {...rest}
  />
);

export default ResetModal;
