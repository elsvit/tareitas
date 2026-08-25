import React, { useState } from 'react';

import { Space, TextInput } from '~/components/ui';
import { ParentForm } from '~/components/users/UserForm/ParentForm';
import { t } from '~/services';
import { Colors } from '~/styles';
import { EFormMode } from '~/types/ECommon';
import type { ParentFormProps } from '~/types/IParent';

import { OnboardingStepHeader } from './OnboardingStepHeader';

type OnboardingSignUpAdminStepProps = {
  parent?: Partial<ParentFormProps>;
  initialFamilyName?: string;
  initialEmail?: string;
  onContinue: (
    parent: ParentFormProps,
    credentials: {
      email: string;
      familyName: string;
      pin: string;
    },
  ) => void;
};

export function OnboardingSignUpAdminStep({
  parent,
  initialFamilyName = '',
  initialEmail = '',
  onContinue,
}: OnboardingSignUpAdminStepProps) {
  const [familyName, setFamilyName] = useState(initialFamilyName);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);

  const handleSave = (value: ParentFormProps) => {
    if (!familyName.trim()) {
      setError(t('onboarding.sign_up.error_family_name_required'));
      return;
    }

    if (!email.trim()) {
      setError(t('onboarding.sign_up.error_email_required'));
      return;
    }

    const pin = value.passwordPattern?.trim() ?? '';

    if (pin.length !== 4) {
      setError(t('onboarding.sign_up.error_admin_pin_required'));
      return;
    }

    setError(null);
    onContinue(value, {
      email: email.trim(),
      familyName: familyName.trim(),
      pin,
    });
  };

  return (
    <>
      <OnboardingStepHeader
        title={t('onboarding.sign_up.admin_title')}
        description={t('onboarding.sign_up.admin_subtitle')}
        accentColor={Colors.orange500}
      />
      <ParentForm
        mode={EFormMode.Add}
        parent={parent}
        onSave={handleSave}
        showScreenHeader={false}
        submitError={error}
        fieldsBeforeName={
          <>
            <TextInput
              label={t('onboarding.account.family_name')}
              value={familyName}
              onChangeText={setFamilyName}
              autoCapitalize="words"
            />
            <Space size={3} />
            <TextInput
              label={t('onboarding.sign_up.admin_email')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </>
        }
      />
    </>
  );
}
