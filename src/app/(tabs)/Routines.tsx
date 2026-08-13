import { StyleSheet, View } from 'react-native';

import { ScreenHeaderWithLogo, SelectUserPrompt } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { useCurrentUser } from '~/hooks/useCurrentUser';

export default function Routines() {
  const { user: currentUser } = useCurrentUser();

  return (
    <SafeAreaBgImage>
      <ScreenHeaderWithLogo containerStyle={{ backgroundColor: 'transparent' }} />
      {!currentUser ? (
        <SelectUserPrompt />
      ) : (
        <View style={styles.container} />
      )}
    </SafeAreaBgImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
