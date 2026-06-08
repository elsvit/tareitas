import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';

import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { Button } from '~/components/ui/Button/Button';
import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
import { t } from '~/services';
import { RouteProp, useRoute } from '@react-navigation/native';
import { removeChild } from '~/store/children/slice';
// import { clearParents } from '~/store/parents/slice';

export default function ChildRemove() {
  useI18nHeaderTitle('users.delete');
  const dispatch = useDispatch();
  const router = useRouter();
  const route = useRoute<RouteProp<Record<string, { id: string }>, string>>();
  const id = route.params?.id;

  const handleRemove = () => {
    // dispatch(clearParents());
    if (router.canGoBack()) {
      router.back();
    }
    dispatch(removeChild({ id }));
  };

  return (
    <SafeAreaBackground>
      <View style={styles.container}>
        <Button
          mode="contained"
          isFullSize
          buttonColor="#e53935" // destructive color
          onPress={handleRemove}
        >
          {t('users.delete')}
        </Button>
      </View>
    </SafeAreaBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
