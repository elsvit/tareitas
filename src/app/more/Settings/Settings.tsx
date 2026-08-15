import React, { useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { SettingsSection, SettingsSections } from '~/components/settings';
import { LocalizationService, t } from '~/services/localization/localization';
import {
  selectIsAdmin,
  selectIsChildPasswordObligatory,
  selectLang,
} from '~/store/settings/selectors';
import {
  setIsChildPasswordObligatory,
  setLanguage,
} from '~/store/settings/slice';
import { syncTaskBaseTranslations } from '~/store/taskBase/slice';
import { useStyle } from '~/styles';
import { ELang } from '~/types/ELang';

import themedStyles from './styles';

const LANGUAGES = [
  { code: ELang.es, name: 'Español' },
  { code: ELang.en, name: 'English' },
] as const;

export default function Settings() {
  const dispatch = useDispatch();
  const [styles] = useStyle(themedStyles);

  const currentLang = useSelector(selectLang);
  const isAdmin = useSelector(selectIsAdmin);
  const isChildPasswordObligatory = useSelector(selectIsChildPasswordObligatory);

  const handleLanguageChange = useCallback(
    async (selectedLang: ELang) => {
      if (selectedLang === currentLang) {
        return;
      }

      try {
        await LocalizationService.changeLanguage(selectedLang);
        dispatch(setLanguage(selectedLang));
        dispatch(syncTaskBaseTranslations());
      } catch (error) {
        console.error('Language change failed:', error);
      }
    },
    [currentLang, dispatch],
  );

  const handleChildPasswordObligatoryChange = useCallback(
    (value: boolean) => {
      dispatch(setIsChildPasswordObligatory(value));
    },
    [dispatch],
  );

  const sections = useMemo((): SettingsSection[] => {
    const allSections: SettingsSection[] = [
      {
        id: 'language',
        title: t('settings.language'),
        items: LANGUAGES.map(language => ({
          type: 'select',
          id: language.code,
          title: language.name,
          selected: currentLang === language.code,
          onPress: () => {
            void handleLanguageChange(language.code);
          },
        })),
      },
      {
        id: 'children',
        title: t('settings.children'),
        visible: isAdmin,
        items: [
          {
            type: 'switch',
            id: 'child-password-obligatory',
            title: t('settings.child_password_obligatory'),
            value: isChildPasswordObligatory,
            onValueChange: handleChildPasswordObligatoryChange,
          },
        ],
      },
    ];

    return allSections.filter(section => section.visible !== false);
  }, [
    currentLang,
    handleChildPasswordObligatoryChange,
    handleLanguageChange,
    isAdmin,
    isChildPasswordObligatory,
  ]);

  return (
    <SafeAreaBgImage>
      <ScreenHeader
        hasBackButton
        title={t('settings.title')}
        containerStyle={styles.screenHeader}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SettingsSections sections={sections} />
      </ScrollView>
    </SafeAreaBgImage>
  );
}
