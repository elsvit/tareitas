import React from 'react';
import { Pressable, View } from 'react-native';

import { Card, Space, Text } from '~/components/ui';
import { t } from '~/services';
import { ESyncMode } from '~/store/settings/enums';
import { Colors } from '~/styles';

import { FamilyConnectForm } from './FamilyConnectForm';
import { OnboardingStepHeader } from './OnboardingStepHeader';
import { onboardingStyles as styles } from './styles';

export type OnboardingSetupPath = 'create' | 'connect';

type OnboardingSyncModeStepProps = {
  setupPath: OnboardingSetupPath;
  onSetupPathChange: (path: OnboardingSetupPath) => void;
  value: ESyncMode;
  onChange: (mode: ESyncMode) => void;
  onMemberLoginSuccess: () => void;
};

type SyncModeOption = {
  mode: ESyncMode;
  title: string;
  description: string;
  accentColor: string;
};

export function OnboardingSyncModeStep({
  setupPath,
  onSetupPathChange,
  value,
  onChange,
  onMemberLoginSuccess,
}: OnboardingSyncModeStepProps) {
  const syncModeOptions: SyncModeOption[] = [
    {
      mode: ESyncMode.multidevice,
      title: t('onboarding.sync_mode.multidevice.title'),
      description: t('onboarding.sync_mode.multidevice.description'),
      accentColor: Colors.blue600,
    },
    {
      mode: ESyncMode.deviceOnly,
      title: t('onboarding.sync_mode.device_only.title'),
      description: t('onboarding.sync_mode.device_only.description'),
      accentColor: Colors.orange500,
    },
  ];

  return (
    <View>
      <OnboardingStepHeader
        title={t('onboarding.sync_mode.title')}
        description={t('onboarding.sync_mode.subtitle')}
        accentColor={Colors.blue600}
      />

      <View style={styles.syncModeSection}>
        <Pressable
          onPress={() => onSetupPathChange('create')}
          style={[
            styles.syncModeSectionHeader,
            setupPath === 'create' && styles.syncModeSectionHeaderSelected,
          ]}
        >
          <Text
            variant="titleMedium"
            fontFamily="fredoka"
            weight="bold"
            color={
              setupPath === 'create' ? Colors.blue600 : Colors.grey700
            }
          >
            {t('onboarding.sync_mode.create_section_title')}
          </Text>
        </Pressable>

        {setupPath === 'create' ? (
          <View style={styles.syncModeOptions}>
            {syncModeOptions.map(option => {
              const selected = value === option.mode;

              return (
                <Pressable
                  key={option.mode}
                  onPress={() => onChange(option.mode)}
                  style={[
                    styles.syncModeOption,
                    selected && {
                      borderColor: option.accentColor,
                      backgroundColor: 'rgba(255, 255, 255, 0.72)',
                    },
                  ]}
                >
                  <Text
                    variant="titleMedium"
                    fontFamily="fredoka"
                    weight="bold"
                    color={
                      selected ? option.accentColor : Colors.grey700
                    }
                  >
                    {option.title}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={styles.syncModeOptionDescription}
                  >
                    {option.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

      <Space size={3} />

      <View style={styles.syncModeSection}>
        <Pressable
          onPress={() => onSetupPathChange('connect')}
          style={[
            styles.syncModeSectionHeader,
            setupPath === 'connect' && styles.syncModeSectionHeaderSelected,
          ]}
        >
          <Text
            variant="titleMedium"
            fontFamily="fredoka"
            weight="bold"
            color={
              setupPath === 'connect' ? Colors.blue600 : Colors.grey700
            }
          >
            {t('onboarding.sync_mode.connect_section_title')}
          </Text>
        </Pressable>

        {setupPath === 'connect' ? (
          <Card style={styles.loginFormCard}>
            <FamilyConnectForm onSuccess={onMemberLoginSuccess} />
          </Card>
        ) : null}
      </View>
    </View>
  );
}
