import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
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
import { useMediaSessionPause } from '~/hooks/useSessionPause';
import { t } from '~/services';
import { uploadFamilyImageWithSession } from '~/services/api/uploadFamilyImageWithSession';
import {
  selectFamilyScopedRewardImageEntries,
  selectFamilyScopedTaskImageEntries,
  selectFamilyScopedUserImageEntries,
  selectUsedRewardImageIds,
  selectUsedTaskImageIds,
  selectUsedUserImageIds,
  setRewardImageUrl,
  setTaskImageUrl,
  setUserImageUrl,
} from '~/store/images';
import type { ImageStoreKind } from '~/store/images/types';
import {
  selectFamilyId,
  selectIsMultidevice,
} from '~/store/settings/selectors';
import { spacing } from '~/styles';
import { IImageOption } from '~/types';
import { filterFamilyImageEntries } from '~/utils/imageScope';

import { styles } from './SelectImageWithCustom.styles';
import { styles as baseStyles } from './styles';

const AVATAR_SIZE = 40;
const AVATAR_GAP = spacing(3);

type AvatarGridProps = {
  maxRows?: number;
  children: React.ReactNode;
};

function AvatarGrid({ maxRows, children }: AvatarGridProps) {
  if (!maxRows) {
    return <View style={baseStyles.grid}>{children}</View>;
  }

  const maxHeight = maxRows * AVATAR_SIZE + (maxRows - 1) * AVATAR_GAP;

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      style={{ maxHeight }}
      contentContainerStyle={[styles.scrollGridContent, { maxHeight }]}
    >
      {children}
    </ScrollView>
  );
}

type Props = {
  kind: ImageStoreKind;
  options: IImageOption[];
  value?: string;
  errorMessage?: string;
  onChange?: (value: string) => void;
  label?: string;
  /** When set, avatars scroll horizontally with at most this many rows. */
  avatarMaxRows?: number;
  /** When set, loaded/custom photos scroll horizontally with at most this many rows. */
  loadedPhotosMaxRows?: number;
};

export function SelectImageWithCustom({
  kind,
  options,
  value,
  errorMessage,
  onChange,
  label,
  avatarMaxRows,
  loadedPhotosMaxRows,
}: Props) {
  const dispatch = useDispatch();
  const isMultidevice = useSelector(selectIsMultidevice);
  const familyId = useSelector(selectFamilyId);
  const scopedUserEntries = useSelector(
    selectFamilyScopedUserImageEntries,
  );
  const scopedTaskEntries = useSelector(
    selectFamilyScopedTaskImageEntries,
  );
  const scopedRewardEntries = useSelector(
    selectFamilyScopedRewardImageEntries,
  );
  const usedUserIds = useSelector(selectUsedUserImageIds);
  const usedTaskIds = useSelector(selectUsedTaskImageIds);
  const usedRewardIds = useSelector(selectUsedRewardImageIds);

  const [isPickModalOpen, setIsPickModalOpen] = useState(false);
  const [isManipulatorOpen, setIsManipulatorOpen] = useState(false);
  const [draftUri, setDraftUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isMediaFlowActive =
    isPickModalOpen ||
    isManipulatorOpen ||
    isPicking ||
    isCropping ||
    isSaving;

  useMediaSessionPause(isMediaFlowActive);

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

  const customEntries = useMemo(() => {
    const baseEntries =
      kind === 'task'
        ? scopedTaskEntries
        : kind === 'reward'
          ? scopedRewardEntries
          : scopedUserEntries;
    const usedIds =
      kind === 'task'
        ? usedTaskIds
        : kind === 'reward'
          ? usedRewardIds
          : usedUserIds;

    return filterFamilyImageEntries(baseEntries, {
      familyId,
      usedIds,
      selectedId: value,
    });
  }, [
    familyId,
    kind,
    scopedRewardEntries,
    scopedTaskEntries,
    scopedUserEntries,
    usedRewardIds,
    usedTaskIds,
    usedUserIds,
    value,
  ]);

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
    setUploadError(null);

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
    setUploadError(null);

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
    setUploadError(null);

    try {
      const nextId = uuidv4();
      const savedUri = await saveImageToDevice(draftUri, kind, nextId);

      if (isMultidevice && familyId) {
        const uploaded = await uploadFamilyImageWithSession(
          familyId,
          savedUri,
          kind,
        );

        saveCustomImageUrl(uploaded.path, savedUri);
        onChange?.(uploaded.path);
      } else {
        saveCustomImageUrl(nextId, savedUri);
        onChange?.(nextId);
      }

      closeManipulator();
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : t('settings.account.sync_try_later'),
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    draftUri,
    familyId,
    isMultidevice,
    kind,
    onChange,
    saveCustomImageUrl,
  ]);

  return (
    <>
      <View style={styles.container}>
        <Text style={baseStyles.label}>
          {label ?? t('users.avatar')}
        </Text>

        <AvatarGrid maxRows={avatarMaxRows}>
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
        </AvatarGrid>

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
            <AvatarGrid maxRows={loadedPhotosMaxRows ?? avatarMaxRows}>
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
            </AvatarGrid>
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
              {uploadError ? (
                <Text variant="bodyMedium" style={baseStyles.errorText}>
                  {uploadError}
                </Text>
              ) : null}
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
