import React, { useCallback, useState } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import ChevronDownIcon from '~/assets/svg/common/chevron-down.svg';
import ChevronUpIcon from '~/assets/svg/common/chevron-up.svg';
import { Space, Text } from '~/components/ui';
import { switchFamilyPersistMode } from '~/services/familyPersistMode';
import { t } from '~/services';
import { ESyncMode } from '~/store/settings/enums';
import { selectParentIds } from '~/store/parents/selectors';
import type { AppDispatch } from '~/store/store';
import { persistor } from '~/store/store';
import { Colors } from '~/styles';

import { DeviceOnlyConnectForm } from './DeviceOnlyConnectForm';
import { FamilyConnectForm } from './FamilyConnectForm';
import { OnboardingStepHeader } from './OnboardingStepHeader';
import { onboardingStyles as styles } from './styles';

export type OnboardingSetupPath =
  | 'create'
  | 'connect'
  | 'connect_device_only';

const SETUP_PATHS: OnboardingSetupPath[] = [
  'create',
  'connect',
  'connect_device_only',
];

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

type SyncModeOptionCardProps = SyncModeOption & {
  selected: boolean;
  onSelect: () => void;
};

function SyncModeOptionCard({
  mode,
  title,
  description,
  accentColor,
  selected,
  onSelect,
}: SyncModeOptionCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <View
      style={[
        styles.syncModeOption,
        selected && {
          borderColor: accentColor,
          backgroundColor: 'rgba(255, 255, 255, 0.72)',
        },
      ]}
    >
      <Pressable
        onPress={onSelect}
        style={styles.syncModeOptionRow}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
      >
        <RadioButton value={mode} color={accentColor} onPress={onSelect} />
        <View style={styles.syncModeOptionContent}>
          <Text
            variant="titleMedium"
            fontFamily="fredoka"
            weight="bold"
            color={selected ? accentColor : Colors.grey700}
          >
            {title}
          </Text>
        </View>
      </Pressable>

      <View style={styles.syncModeDescriptionSection}>
        <TouchableOpacity
          onPress={() => setIsDescriptionExpanded(prev => !prev)}
          activeOpacity={0.8}
          style={styles.syncModeDescriptionToggle}
          accessibilityRole="button"
          accessibilityState={{ expanded: isDescriptionExpanded }}
        >
          <Text style={styles.syncModeDescriptionLabel}>
            {t('tasks.description')}
          </Text>
          {isDescriptionExpanded ? (
            <ChevronUpIcon width={18} height={18} fill={Colors.grey700} />
          ) : (
            <ChevronDownIcon width={18} height={18} fill={Colors.grey700} />
          )}
        </TouchableOpacity>

        {isDescriptionExpanded ? (
          <Text variant="bodyMedium" style={styles.syncModeOptionDescription}>
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function OnboardingSyncModeStep({
  setupPath,
  onSetupPathChange,
  value,
  onChange,
  onMemberLoginSuccess,
}: OnboardingSyncModeStepProps) {
  const dispatch = useDispatch<AppDispatch>();
  const parentIds = useSelector(selectParentIds);
  const [isLoadingDeviceOnlyFamily, setIsLoadingDeviceOnlyFamily] =
    useState(false);
  const [deviceOnlyLoadVersion, setDeviceOnlyLoadVersion] = useState(0);

  const handleSetupPathChange = useCallback(
    async (path: OnboardingSetupPath) => {
      if (path === 'connect_device_only') {
        setIsLoadingDeviceOnlyFamily(true);

        try {
          await switchFamilyPersistMode(
            dispatch,
            persistor,
            ESyncMode.deviceOnly,
          );
          setDeviceOnlyLoadVersion(version => version + 1);
          onSetupPathChange(path);
        } catch (error) {
          console.error(
            '[Tareitas] Failed to load device-only family storage',
            error,
          );
        } finally {
          setIsLoadingDeviceOnlyFamily(false);
        }

        return;
      }

      if (path === 'connect') {
        try {
          await switchFamilyPersistMode(
            dispatch,
            persistor,
            ESyncMode.multidevice,
          );
        } catch (error) {
          console.error(
            '[Tareitas] Failed to load multidevice family storage',
            error,
          );
        }
      }

      onSetupPathChange(path);
    },
    [dispatch, onSetupPathChange, parentIds],
  );

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

      <View
        style={[
          styles.syncModeSectionBox,
          setupPath === 'create' && styles.syncModeSectionBoxSelected,
        ]}
      >
        <Pressable
          onPress={() => onSetupPathChange('create')}
          style={styles.syncModeSectionHeader}
          accessibilityRole="radio"
          accessibilityState={{ selected: setupPath === 'create' }}
        >
          <RadioButton
            value="create"
            status={setupPath === 'create' ? 'checked' : 'unchecked'}
            onPress={() => onSetupPathChange('create')}
            color={Colors.blue600}
          />
          <Text
            variant="titleMedium"
            fontFamily="fredoka"
            weight="bold"
            color={
              setupPath === 'create' ? Colors.blue600 : Colors.grey700
            }
            style={styles.syncModeSectionHeaderText}
          >
            {t('onboarding.sync_mode.create_section_title')}
          </Text>
        </Pressable>

        {setupPath === 'create' ? (
          <RadioButton.Group
            onValueChange={nextValue => onChange(nextValue as ESyncMode)}
            value={value}
          >
            <View style={styles.syncModeOptions}>
              {syncModeOptions.map(option => (
                <SyncModeOptionCard
                  key={option.mode}
                  {...option}
                  selected={value === option.mode}
                  onSelect={() => onChange(option.mode)}
                />
              ))}
            </View>
          </RadioButton.Group>
        ) : null}
      </View>

      <Space size={3} />

      <View
        style={[
          styles.syncModeSectionBox,
          setupPath === 'connect' && styles.syncModeSectionBoxSelected,
        ]}
      >
        <Pressable
          onPress={() => handleSetupPathChange('connect')}
          style={styles.syncModeSectionHeader}
          accessibilityRole="radio"
          accessibilityState={{ selected: setupPath === 'connect' }}
        >
          <RadioButton
            value="connect"
            status={setupPath === 'connect' ? 'checked' : 'unchecked'}
            onPress={() => handleSetupPathChange('connect')}
            color={Colors.blue600}
          />
          <Text
            variant="titleMedium"
            fontFamily="fredoka"
            weight="bold"
            color={
              setupPath === 'connect' ? Colors.blue600 : Colors.grey700
            }
            style={styles.syncModeSectionHeaderText}
          >
            {t('onboarding.sync_mode.connect_section_title')}
          </Text>
        </Pressable>

        {setupPath === 'connect' ? (
          <FamilyConnectForm onSuccess={onMemberLoginSuccess} />
        ) : null}
      </View>

      <Space size={3} />

      <View
        style={[
          styles.syncModeSectionBox,
          setupPath === 'connect_device_only' &&
            styles.syncModeSectionBoxSelected,
        ]}
      >
        <Pressable
          onPress={() => handleSetupPathChange('connect_device_only')}
          style={styles.syncModeSectionHeader}
          accessibilityRole="radio"
          accessibilityState={{
            selected: setupPath === 'connect_device_only',
          }}
        >
          <RadioButton
            value="connect_device_only"
            status={
              setupPath === 'connect_device_only'
                ? 'checked'
                : 'unchecked'
            }
            onPress={() => handleSetupPathChange('connect_device_only')}
            color={Colors.orange500}
          />
          <Text
            variant="titleMedium"
            fontFamily="fredoka"
            weight="bold"
            color={
              setupPath === 'connect_device_only'
                ? Colors.orange500
                : Colors.grey700
            }
            style={styles.syncModeSectionHeaderText}
          >
            {t('onboarding.sync_mode.connect_device_only_section_title')}
          </Text>
        </Pressable>

        {setupPath === 'connect_device_only' ? (
          isLoadingDeviceOnlyFamily ? (
            <Text variant="bodyMedium">
              {t('common.loading')}
            </Text>
          ) : (
            <DeviceOnlyConnectForm
              key={`device-only-${deviceOnlyLoadVersion}-${parentIds.join(',')}`}
              onSuccess={onMemberLoginSuccess}
            />
          )
        ) : null}
      </View>

      <View style={styles.dotsRow}>
        {SETUP_PATHS.map(path => (
          <Pressable
            key={path}
            onPress={() => handleSetupPathChange(path)}
            accessibilityRole="button"
            accessibilityState={{ selected: setupPath === path }}
          >
            <View
              style={[
                styles.dot,
                setupPath === path && styles.dotActive,
              ]}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
