import React, { useCallback, useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import CheckIcon from '~/assets/svg/common/check.svg';
import CloseIcon from '~/assets/svg/common/cross.svg';
import { Text } from '~/components/ui';
import { IconButton } from '~/components/ui/IconButton';
import { DEFAULT_LANG } from '~/constants/settings';
import {
  flushScheduledFamilySnapshot,
  persistSharedSettingsState,
} from '~/services/familyPersistMode';
import { trackLanguageScreenOpened } from '~/services/analytics';
import {
  AvailableLanguages,
  getSupportedDeviceLanguage,
  LocalizationService,
  t,
} from '~/services/localization/localization';
import { syncRewardBaseTranslations } from '~/store/rewardBase/slice';
import { selectLang } from '~/store/settings/selectors';
import { setLanguage } from '~/store/settings/slice';
import { store } from '~/store/store';
import { syncTaskBaseTranslations } from '~/store/taskBase/slice';
import { Colors, spacing } from '~/styles';
import { ELang } from '~/types/ELang';

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
};

export function OnboardingLanguagePickerModal({
  isVisible,
  onRequestClose,
}: Props) {
  const dispatch = useDispatch();
  const storedLang = useSelector(selectLang);

  const activeLang = useMemo((): ELang => {
    if (
      storedLang &&
      AvailableLanguages.some(language => language.code === storedLang)
    ) {
      return storedLang;
    }

    return getSupportedDeviceLanguage() ?? DEFAULT_LANG;
  }, [storedLang]);

  const handleOpen = useCallback(() => {
    void trackLanguageScreenOpened(LocalizationService.getDeviceLanguage());
  }, []);

  React.useEffect(() => {
    if (isVisible) {
      handleOpen();
    }
  }, [handleOpen, isVisible]);

  const handleLanguageChange = useCallback(
    async (selectedLang: ELang) => {
      if (selectedLang === activeLang) {
        onRequestClose();
        return;
      }

      try {
        const resolvedLang =
          await LocalizationService.changeLanguage(selectedLang);
        dispatch(setLanguage({ lang: resolvedLang, userSelected: true }));
        dispatch(syncTaskBaseTranslations());
        dispatch(syncRewardBaseTranslations());
        await persistSharedSettingsState(store.getState);
        await flushScheduledFamilySnapshot(store.getState);
        onRequestClose();
      } catch (error) {
        console.error('Onboarding language change failed:', error);
      }
    },
    [activeLang, dispatch, onRequestClose],
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onRequestClose}
    >
      <SafeAreaView style={styles.backdropContainer}>
        <Pressable style={styles.backdrop} onPress={onRequestClose} />

        <View style={styles.sheet} testID="onboarding-language-modal">
          <View style={styles.header}>
            <Text variant="titleMedium" weight="bold">
              {t('settings.language')}
            </Text>
            <IconButton
              Icon={<CloseIcon width={24} height={24} fill={Colors.grey500} />}
              onPress={onRequestClose}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {AvailableLanguages.map(language => {
              const selected = activeLang === language.code;

              return (
                <Pressable
                  key={language.code}
                  testID={`onboarding-language-option-${language.code}`}
                  accessibilityRole="button"
                  onPress={() => {
                    void handleLanguageChange(language.code);
                  }}
                  style={({ pressed }) => [
                    styles.languageRow,
                    pressed && styles.languageRowPressed,
                  ]}
                >
                  <Text
                    variant="bodyLarge"
                    weight={selected ? 'bold' : undefined}
                    style={selected ? styles.languageTitleSelected : undefined}
                  >
                    {language.name}
                  </Text>
                  {selected ? <CheckIcon width={20} height={20} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: spacing(3),
    borderTopRightRadius: spacing(3),
    paddingBottom: spacing(2),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(4),
    paddingTop: spacing(3),
    paddingBottom: spacing(2),
  },
  content: {
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(4),
    gap: spacing(1),
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(2),
    borderRadius: spacing(2),
  },
  languageRowPressed: {
    backgroundColor: Colors.grey100,
  },
  languageTitleSelected: {
    color: Colors.blue600,
  },
});
