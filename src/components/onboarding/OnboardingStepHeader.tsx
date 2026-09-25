import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Text } from '~/components/ui';
import { t } from '~/services';
import { Colors } from '~/styles';

import { onboardingStyles as styles } from './styles';

type OnboardingStepHeaderProps = {
  title?: string;
  description: string;
  descriptionHelpUrl?: string;
  onDescriptionHelpPress?: () => void;
  stepIndicator?: string;
  accentColor?: string;
};

export function OnboardingStepHeader({
  title,
  description,
  descriptionHelpUrl,
  onDescriptionHelpPress,
  stepIndicator,
  accentColor,
}: OnboardingStepHeaderProps) {
  const showHelpButton = Boolean(descriptionHelpUrl || onDescriptionHelpPress);

  return (
    <View style={styles.stepHeader}>
      {stepIndicator ? (
        <View style={styles.stepIndicatorBadge}>
          <Text
            variant="labelMedium"
            weight="bold"
            color={accentColor ?? Colors.orange500}
          >
            {stepIndicator}
          </Text>
        </View>
      ) : null}
      {title ? (
        <Text
          variant="titleLarge"
          fontFamily="fredoka"
          weight="bold"
          color={accentColor ?? Colors.orange500}
        >
          {title}
        </Text>
      ) : null}
      <View style={styles.stepDescriptionRow}>
        <Text
          variant="bodyMedium"
          style={[styles.stepDescription, styles.stepDescriptionText]}
        >
          {description}
        </Text>
        {showHelpButton ? (
          <TouchableOpacity
            onPress={onDescriptionHelpPress}
            style={styles.stepDescriptionHelpButton}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.sync_mode.subtitle_help_label')}
            testID="onboarding-sync-mode-help-button"
          >
            <Text
              variant="titleMedium"
              fontFamily="fredoka"
              weight="bold"
              color={accentColor ?? Colors.blue600}
            >
              ?
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
