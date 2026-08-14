import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import PlusIcon from '~/assets/svg/common/plus.svg';
import { Button, ButtonColors, Text } from '~/components/ui';
import { SCREEN_TEXT } from '~/constants/formField';
import { t } from '~/services';
import {
  removeRewardImageUrl,
  removeTaskImageUrl,
  removeUserImageUrl,
  selectRewardImageUrls,
  selectTaskImageUrls,
  selectUserImageUrls,
  setRewardImageUrl,
  setTaskImageUrl,
  setUserImageUrl,
} from '~/store/images';
import type { ImageStoreKind } from '~/store/images/types';

import {
  deleteImageFromDevice,
  isCustomImageId,
  saveImageToDevice,
} from './ImageLoader.utils';
import { styles } from './styles';

export type ImageLoaderProps = {
  kind: ImageStoreKind;
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  errorMessage?: string;
};

export function ImageLoader({
  kind,
  value,
  onChange,
  label,
  errorMessage,
}: ImageLoaderProps) {
  const dispatch = useDispatch();
  const taskUrls = useSelector(selectTaskImageUrls);
  const rewardUrls = useSelector(selectRewardImageUrls);
  const userUrls = useSelector(selectUserImageUrls);
  const customUrls =
    kind === 'task' ? taskUrls : kind === 'reward' ? rewardUrls : userUrls;

  const [isLoading, setIsLoading] = useState(false);

  const selectedUri = useMemo(() => {
    if (!isCustomImageId(value, customUrls)) {
      return undefined;
    }

    return customUrls[value];
  }, [customUrls, value]);

  const hasCustomImage = !!selectedUri;

  const setImageUrl = useCallback(
    (id: string, uri: string) => {
      if (kind === 'task') {
        dispatch(setTaskImageUrl({ id, uri }));
      } else if (kind === 'reward') {
        dispatch(setRewardImageUrl({ id, uri }));
      } else {
        dispatch(setUserImageUrl({ id, uri }));
      }
    },
    [dispatch, kind],
  );

  const removeImageUrl = useCallback(
    (id: string) => {
      if (kind === 'task') {
        dispatch(removeTaskImageUrl(id));
      } else if (kind === 'reward') {
        dispatch(removeRewardImageUrl(id));
      } else {
        dispatch(removeUserImageUrl(id));
      }
    },
    [dispatch, kind],
  );

  const handlePickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    setIsLoading(true);

    try {
      const nextId = uuidv4();
      const savedUri = await saveImageToDevice(
        result.assets[0].uri,
        kind,
        nextId,
      );

      if (isCustomImageId(value, customUrls)) {
        const previousUri = customUrls[value];
        removeImageUrl(value);
        await deleteImageFromDevice(previousUri);
      }

      setImageUrl(nextId, savedUri);
      onChange(nextId);
    } finally {
      setIsLoading(false);
    }
  }, [customUrls, kind, onChange, removeImageUrl, setImageUrl, value]);

  const handleRemoveImage = useCallback(async () => {
    if (!isCustomImageId(value, customUrls)) {
      return;
    }

    const uri = customUrls[value];
    removeImageUrl(value);
    await deleteImageFromDevice(uri);
    onChange('');
  }, [customUrls, onChange, removeImageUrl, value]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label ?? t('imageLoader.label')}
      </Text>

      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          onPress={handlePickImage}
          disabled={isLoading}
          style={[
            styles.previewOuter,
            hasCustomImage && styles.previewOuterSelected,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={SCREEN_TEXT.primary} />
          ) : hasCustomImage ? (
            <Image source={{ uri: selectedUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholder}>
              <PlusIcon width={24} height={24} fill={SCREEN_TEXT.primary} />
            </View>
          )}
        </Pressable>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handlePickImage}
            loading={isLoading}
            disabled={isLoading}
          >
            {hasCustomImage ? t('imageLoader.change') : t('imageLoader.add')}
          </Button>

          {hasCustomImage && (
            <Button
              mode="contained"
              bgColor={ButtonColors.Red}
              onPress={handleRemoveImage}
              disabled={isLoading}
            >
              {t('imageLoader.remove')}
            </Button>
          )}
        </View>
      </View>

      {!!errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
}

export default ImageLoader;
