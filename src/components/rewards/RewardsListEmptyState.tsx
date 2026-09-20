import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import { Text } from '~/components/ui';
import { t } from '~/services';
import { selectIsRewardsDataSyncing } from '~/store/settings/selectors';
import { Colors } from '~/styles';
import type { TranslationKey } from '~/services/localization/localization';

type Props = {
  messageKey: TranslationKey;
};

export function RewardsListEmptyState({ messageKey }: Props) {
  const isLoading = useSelector(selectIsRewardsDataSyncing);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.blue500} />
      </View>
    );
  }

  return <Text style={styles.emptyText}>{t(messageKey)}</Text>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    marginTop: 24,
    textAlign: 'center',
    opacity: 0.6,
  },
});
