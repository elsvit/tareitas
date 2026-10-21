import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ScreenHeaderWithLogo, SelectUserPrompt } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { ChildRewardsTabs } from '~/components/rewards/ChildRewardsTabs';
import { ParentRewardsTabs } from '~/components/rewards/ParentRewardsTabs';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { useMultideviceScreenSync } from '~/hooks/useMultideviceScreenSync';
import { spacing } from '~/styles';

export default function Rewards() {
  const { user: currentUser, isChild } = useCurrentUser();

  useMultideviceScreenSync('rewards');

  return (
    <SafeAreaBgImage includeBottomInset={false}>
      <ScreenHeaderWithLogo containerStyle={{ backgroundColor: 'transparent' }} />
      {!currentUser ? (
        <SelectUserPrompt />
      ) : (
        <View style={styles.container}>
          {isChild ? <ChildRewardsTabs /> : <ParentRewardsTabs />}
        </View>
      )}
    </SafeAreaBgImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: spacing(2),
  },
});
