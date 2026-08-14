import React from 'react';
import { ScrollView } from 'react-native';

import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { LoadedPhotosContent } from '~/components/more/LoadedPhotosContent';
import { t } from '~/services';
import { useStyle } from '~/styles';

import themedStyles from './styles';

export default function LoadedPhotos() {
  const [styles] = useStyle(themedStyles);

  return (
    <SafeAreaBgImage>
      <ScreenHeader
        hasBackButton
        title={t('more.loaded_images')}
        containerStyle={styles.screenHeader}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LoadedPhotosContent />
      </ScrollView>
    </SafeAreaBgImage>
  );
}
