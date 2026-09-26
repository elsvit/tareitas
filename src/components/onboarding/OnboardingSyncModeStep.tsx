import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useDispatch, useSelector } from 'react-redux';

import ChevronDownIcon from '~/assets/svg/common/chevron-down.svg';
import ChevronUpIcon from '~/assets/svg/common/chevron-up.svg';
import { ConfirmModal } from '~/components/modals';
import { ButtonColors, Space, Text } from '~/components/ui';
import {
  hasPersistedDeviceOnlyFamily,
  switchFamilyPersistMode,
} from '~/services/familyPersistMode';
import { t } from '~/services';
import { ESyncMode } from '~/store/settings/enums';
import { selectParentIds } from '~/store/parents/selectors';
import { selectLang } from '~/store/settings/selectors';
import { getLoginSignupHelpUrl } from '~/constants/helpCenter';
import { getPrivacyPolicyUrl } from '~/utils/privacyPolicyUrl';
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
  'connect',
  'connect_device_only',
  'create',
];

type SyncModeSectionHeaderProps = {
  selected: boolean;
  title: string;
  subtitle: string;
  accentColor: string;
  radioValue: string;
  onPress: () => void;
  testID: string;
};

function SyncModeSectionHeader({
  selected,
  title,
  subtitle,
  accentColor,
  radioValue,
  onPress,
  testID,
}: SyncModeSectionHeaderProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.syncModeSectionHeader}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      testID={testID}
    >
      <RadioButton
        value={radioValue}
        status={selected ? 'checked' : 'unchecked'}
        onPress={onPress}
        color={accentColor}
      />
      <View style={styles.syncModeSectionHeaderText}>
        <Text
          variant="titleMedium"
          fontFamily="fredoka"
          weight="bold"
          color={selected ? accentColor : Colors.grey700}
        >
          {title}
        </Text>
        <Text variant="bodyMedium" style={styles.syncModeSectionSubtitle}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

type OnboardingSyncModeStepProps = {
  setupPath: OnboardingSetupPath | null;
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
  testID: string;
};

function SyncModeOptionCard({
  mode,
  title,
  description,
  accentColor,
  selected,
  onSelect,
  testID,
}: SyncModeOptionCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <View
      testID={testID}
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
        testID={`${testID}-select`}
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
  const appLang = useSelector(selectLang);
  const privacyPolicyUrl = useMemo(
    () => getPrivacyPolicyUrl(appLang),
    [appLang],
  );
  const loginSignupHelpUrl = useMemo(
    () => getLoginSignupHelpUrl(appLang),
    [appLang],
  );
  const [isLoadingDeviceOnlyFamily, setIsLoadingDeviceOnlyFamily] =
    useState(false);
  const [deviceOnlyLoadVersion, setDeviceOnlyLoadVersion] = useState(0);
  const [isReplaceDeviceOnlyConfirmVisible, setIsReplaceDeviceOnlyConfirmVisible] =
    useState(false);

  const handleSyncModeSelect = useCallback(
    async (mode: ESyncMode) => {
      if (mode === value) {
        return;
      }

      if (mode === ESyncMode.deviceOnly) {
        try {
          const hasStoredFamily = await hasPersistedDeviceOnlyFamily();

          if (hasStoredFamily) {
            setIsReplaceDeviceOnlyConfirmVisible(true);
            return;
          }
        } catch (error) {
          console.error(
            '[Tareitas] Failed to check device-only family storage',
            error,
          );
        }
      }

      onChange(mode);
    },
    [onChange, value],
  );

  const handleConfirmReplaceDeviceOnlyFamily = useCallback(() => {
    onChange(ESyncMode.deviceOnly);
    setIsReplaceDeviceOnlyConfirmVisible(false);
  }, [onChange]);

  const handlePrivacyPolicyPress = useCallback(async () => {
    try {
      await openBrowserAsync(privacyPolicyUrl, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    } catch (error) {
      console.error('[Tareitas] Failed to open privacy policy', error);
    }
  }, [privacyPolicyUrl]);

  const handleSubtitleHelpPress = useCallback(async () => {
    try {
      await openBrowserAsync(loginSignupHelpUrl, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    } catch (error) {
      console.error('[Tareitas] Failed to open login/signup help', error);
    }
  }, [loginSignupHelpUrl]);

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
    <View testID="onboarding-setup-screen">
      <OnboardingStepHeader
        description={t('onboarding.sync_mode.subtitle')}
        descriptionHelpUrl={loginSignupHelpUrl}
        onDescriptionHelpPress={handleSubtitleHelpPress}
        accentColor={Colors.blue600}
      />

      <View
        testID="onboarding-section-multidevice-connect"
        style={[
          styles.syncModeSectionBox,
          setupPath === 'connect' && styles.syncModeSectionBoxSelected,
        ]}
      >
        <SyncModeSectionHeader
          selected={setupPath === 'connect'}
          title={t('onboarding.sync_mode.connect_section_title')}
          subtitle={t('onboarding.sync_mode.connect_section_subtitle')}
          accentColor={Colors.blue600}
          radioValue="connect"
          onPress={() => handleSetupPathChange('connect')}
          testID="onboarding-section-multidevice-connect-header"
        />

        {setupPath === 'connect' ? (
          <FamilyConnectForm onSuccess={onMemberLoginSuccess} />
        ) : null}
      </View>

      <Space size={3} />

      <View
        testID="onboarding-section-device-only-connect"
        style={[
          styles.syncModeSectionBox,
          setupPath === 'connect_device_only' &&
            styles.syncModeSectionBoxSelected,
        ]}
      >
        <SyncModeSectionHeader
          selected={setupPath === 'connect_device_only'}
          title={t('onboarding.sync_mode.connect_device_only_section_title')}
          subtitle={t(
            'onboarding.sync_mode.connect_device_only_section_subtitle',
          )}
          accentColor={Colors.orange500}
          radioValue="connect_device_only"
          onPress={() => handleSetupPathChange('connect_device_only')}
          testID="onboarding-section-device-only-connect-header"
        />

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

      <Space size={3} />

      <View
        testID="onboarding-section-create"
        style={[
          styles.syncModeSectionBox,
          setupPath === 'create' && styles.syncModeSectionBoxSelected,
        ]}
      >
        <SyncModeSectionHeader
          selected={setupPath === 'create'}
          title={t('onboarding.sync_mode.create_section_title')}
          subtitle={t('onboarding.sync_mode.create_section_subtitle')}
          accentColor={Colors.blue600}
          radioValue="create"
          onPress={() => onSetupPathChange('create')}
          testID="onboarding-section-create-header"
        />

        {setupPath === 'create' ? (
          <RadioButton.Group
            onValueChange={nextValue =>
              void handleSyncModeSelect(nextValue as ESyncMode)
            }
            value={value}
          >
            <View style={styles.syncModeOptions}>
              {syncModeOptions.map(option => (
                <SyncModeOptionCard
                  key={option.mode}
                  {...option}
                  testID={
                    option.mode === ESyncMode.multidevice
                      ? 'onboarding-create-multidevice'
                      : 'onboarding-create-device-only'
                  }
                  selected={value === option.mode}
                  onSelect={() => void handleSyncModeSelect(option.mode)}
                />
              ))}
            </View>
          </RadioButton.Group>
        ) : null}
      </View>

      <Pressable
        onPress={() => void handlePrivacyPolicyPress()}
        accessibilityRole="link"
        style={styles.privacyPolicyLink}
      >
        <Text variant="bodyMedium" style={styles.privacyPolicyLinkText}>
          {t('onboarding.sync_mode.privacy_policy')}
        </Text>
      </Pressable>

      <ConfirmModal
        isVisible={isReplaceDeviceOnlyConfirmVisible}
        onRequestClose={() => setIsReplaceDeviceOnlyConfirmVisible(false)}
        onConfirm={handleConfirmReplaceDeviceOnlyFamily}
        title={t('onboarding.sync_mode.replace_device_only_title')}
        message={t('onboarding.sync_mode.replace_device_only_message')}
        confirmLabel={t('onboarding.sync_mode.replace_device_only_confirm')}
        confirmBgColor={ButtonColors.Orange}
      />

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
