import React, { useState } from 'react';

import { Space, Text } from '~/components/ui';
import { ChildForm } from '~/components/users/UserForm/ChildForm';
import { t } from '~/services';
import { Colors } from '~/styles';
import { EFormMode } from '~/types/ECommon';
import type { ChildFormProps } from '~/types/IChild';

import { OnboardingStepHeader } from './OnboardingStepHeader';

type OnboardingSignUpChildStepProps = {
  child?: Partial<ChildFormProps>;
  isSubmitting?: boolean;
  externalError?: string | null;
  onSubmit: (
    child: ChildFormProps,
    credentials: { username: string; pin: string },
  ) => void;
};

export function OnboardingSignUpChildStep({
  child,
  isSubmitting = false,
  externalError = null,
  onSubmit,
}: OnboardingSignUpChildStepProps) {
  const [error, setError] = useState<string | null>(null);

  const submitError = externalError ?? error;

  const handleSave = (value: ChildFormProps) => {
    const username = value.username?.trim() ?? '';

    if (!username) {
      setError(t('onboarding.sign_up.error_username_required'));
      return;
    }

    const pin = value.passwordPattern?.trim() ?? '';

    if (pin.length !== 4) {
      setError(t('onboarding.sign_up.error_child_pin_required'));
      return;
    }

    setError(null);
    onSubmit(value, { username, pin });
  };

  return (
    <>
      <OnboardingStepHeader
        title={t('onboarding.sign_up.child_title')}
        description={t('onboarding.sign_up.child_subtitle')}
        accentColor={Colors.blue600}
      />
      <ChildForm
        mode={EFormMode.Add}
        child={child}
        onSave={handleSave}
        showScreenHeader={false}
        showUniqueUsername
        submitError={submitError}
      />
      {isSubmitting ? (
        <>
          <Space size={2} />
          <Text variant="bodyMedium">{t('common.loading')}</Text>
        </>
      ) : null}
    </>
  );
}
