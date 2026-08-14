import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';

import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { Button, ButtonColors, Text } from '~/components/ui';
import { saveImageToDevice } from '~/components/ui/ImageLoader/ImageLoader.utils';
import { SCREEN_TEXT } from '~/constants/formField';
import { t } from '~/services';
import {
  selectRewardImageUrls,
  selectTaskImageUrls,
  selectUserImageUrls,
  setRewardImageUrl,
  setTaskImageUrl,
  setUserImageUrl,
} from '~/store/images';
import type { ImageStoreKind } from '~/store/images/types';
import { IImageOption } from '~/types';

import { styles } from './SelectImageWithCustom.styles';
import { styles as baseStyles } from './styles';

type Props = {
  kind: ImageStoreKind;
  options: IImageOption[];
  value?: string;
  errorMessage?: string;
  onChange?: (value: string) => void;
  label?: string;
};

export function SelectImageWithCustom({
  kind,
  options,
  value,
  errorMessage,
  onChange,
  label,
}: Props) {
  const dispatch = useDispatch();
  const taskUrls = useSelector(selectTaskImageUrls);
  const rewardUrls = useSelector(selectRewardImageUrls);
  const userUrls = useSelector(selectUserImageUrls);

  const customUrls =
    kind === 'task' ? taskUrls : kind === 'reward' ? rewardUrls : userUrls;

  const [isPickModalOpen, setIsPickModalOpen] = useState(false);
  const [isManipulatorOpen, setIsManipulatorOpen] = useState(false);
  const [draftUri, setDraftUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  const pickAndCropFromGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return null;
    }

    return result.assets[0].uri;
  }, []);

  const customEntries = useMemo(
    () => Object.entries(customUrls),
    [customUrls],
  );

  const openPickModal = () => {
    setIsPickModalOpen(true);
  };

  const closePickModal = () => {
    setIsPickModalOpen(false);
  };

  const closeManipulator = () => {
    setIsManipulatorOpen(false);
    setDraftUri(null);
  };

  const saveCustomImageUrl = useCallback(
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

  const handleChooseFromGallery = useCallback(async () => {
    setIsPicking(true);

    try {
      const uri = await pickAndCropFromGallery();

      if (!uri) {
        return;
      }

      closePickModal();
      setDraftUri(uri);
      setIsManipulatorOpen(true);
    } finally {
      setIsPicking(false);
    }
  }, [pickAndCropFromGallery]);

  const handleAdjustCrop = useCallback(async () => {
    setIsCropping(true);

    try {
      const uri = await pickAndCropFromGallery();

      if (uri) {
        setDraftUri(uri);
      }
    } finally {
      setIsCropping(false);
    }
  }, [pickAndCropFromGallery]);

  const handleSaveManipulatedPhoto = useCallback(async () => {
    if (!draftUri) {
      return;
    }

    setIsSaving(true);

    try {
      const nextId = uuidv4();
      const savedUri = await saveImageToDevice(draftUri, kind, nextId);

      saveCustomImageUrl(nextId, savedUri);
      onChange?.(nextId);
      closeManipulator();
    } finally {
      setIsSaving(false);
    }
  }, [draftUri, kind, onChange, saveCustomImageUrl]);

  return (
    <>
      <View style={styles.container}>
        <Text style={baseStyles.label}>
          {label ?? t('users.avatar')}
        </Text>

        <View style={baseStyles.grid}>
          {options.map((opt, index) => {
            const isSelected = value === opt.value;

            return (
              <TouchableOpacity
                key={`${opt.value}-${index}`}
                onPress={() => onChange?.(opt.value)}
                style={[
                  baseStyles.avatarOuter,
                  {
                    borderColor: isSelected ? '#22C55E' : '#D1D5DB',
                  },
                ]}
              >
                <Image source={opt.image} style={baseStyles.avatarImage} />
              </TouchableOpacity>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={openPickModal}
          style={styles.loadPhotoButton}
        >
          <Text style={styles.loadPhotoText}>{t('imageLoader.load_photo')}</Text>
        </Pressable>

        {customEntries.length > 0 && (
          <View style={styles.customSection}>
            <Text variant="bodyMedium" style={styles.customLabel}>
              {t('imageLoader.loaded_photos')}
            </Text>
            <View style={baseStyles.grid}>
              {customEntries.map(([id, uri]) => {
                const isSelected = value === id;

                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => onChange?.(id)}
                    style={[
                      baseStyles.avatarOuter,
                      {
                        borderColor: isSelected ? '#22C55E' : '#D1D5DB',
                      },
                    ]}
                  >
                    <Image source={{ uri }} style={baseStyles.avatarImage} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {!!errorMessage && (
          <Text style={baseStyles.errorText}>{errorMessage}</Text>
        )}
      </View>

      <Modal
        visible={isPickModalOpen}
        animationType="slide"
        transparent
        onRequestClose={closePickModal}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.backdrop} onPress={closePickModal} />

          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <Text variant="titleMedium" weight="bold" style={styles.sheetTitle}>
              {t('imageLoader.load_photo')}
            </Text>
            <Text variant="bodyMedium">{t('imageLoader.choose_from_gallery')}</Text>

            <Button
              mode="contained"
              onPress={handleChooseFromGallery}
              loading={isPicking}
              disabled={isPicking}
            >
              {t('imageLoader.choose_photo')}
            </Button>

            <Button
              mode="contained"
              bgColor={ButtonColors.Gray}
              textColor={SCREEN_TEXT.primary}
              onPress={closePickModal}
              disabled={isPicking}
            >
              {t('button.cancel')}
            </Button>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal
        visible={isManipulatorOpen}
        animationType="slide"
        transparent
        onRequestClose={closeManipulator}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.backdrop} onPress={closeManipulator} />

          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <Text variant="titleMedium" weight="bold" style={styles.sheetTitle}>
              {t('imageLoader.edit_photo')}
            </Text>
            <Text variant="bodyMedium">{t('imageLoader.crop_hint')}</Text>

            <View style={styles.previewContainer}>
              {draftUri ? (
                <Image source={{ uri: draftUri }} style={styles.previewImage} />
              ) : (
                <ActivityIndicator color={SCREEN_TEXT.primary} />
              )}
            </View>

            <Button
              mode="contained"
              bgColor={ButtonColors.Gray}
              textColor={SCREEN_TEXT.primary}
              onPress={handleAdjustCrop}
              loading={isCropping}
              disabled={isSaving || isCropping}
            >
              {t('imageLoader.adjust_crop')}
            </Button>

            <View style={styles.actions}>
              <Button
                mode="contained"
                bgColor={ButtonColors.Gray}
                textColor={SCREEN_TEXT.primary}
                onPress={closeManipulator}
                style={styles.actionButton}
                disabled={isSaving}
              >
                {t('button.cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveManipulatedPhoto}
                style={styles.actionButton}
                loading={isSaving}
                disabled={isSaving || !draftUri}
              >
                {t('button.save')}
              </Button>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

export default SelectImageWithCustom;
