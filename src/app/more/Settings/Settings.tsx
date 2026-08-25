import React, { useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native';

import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { SettingsSection, SettingsSections } from '~/components/settings';
import { DEFAULT_LANG } from '~/constants/settings';
import { logoutUser } from '~/services/api';
import { AvailableLanguages, LocalizationService, t } from '~/services/localization/localization';
import {
  selectHasAuthSession,
  selectIsAdmin,
  selectIsChildPasswordObligatory,
  selectIsMultidevice,
  selectLang,
  selectNeedsAuthLogin,
  selectRefreshToken,
} from '~/store/settings/selectors';
import {
  clearAuthSession,
  setIsChildPasswordObligatory,
  setLanguage,
  setRequireLogin,
} from '~/store/settings/slice';
import { syncTaskBaseTranslations } from '~/store/taskBase/slice';
import { useStyle } from '~/styles';
import { EScreens } from '~/types';
import { ELang } from '~/types/ELang';

import themedStyles from './styles';

export default function Settings() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [styles] = useStyle(themedStyles);

  const storedLang = useSelector(selectLang);
  const isAdmin = useSelector(selectIsAdmin);
  const isChildPasswordObligatory = useSelector(selectIsChildPasswordObligatory);
  const isMultidevice = useSelector(selectIsMultidevice);
  const hasAuthSession = useSelector(selectHasAuthSession);
  const needsAuthLogin = useSelector(selectNeedsAuthLogin);
  const refreshToken = useSelector(selectRefreshToken);

  const activeLang = useMemo((): ELang => {
    if (storedLang && AvailableLanguages.some(language => language.code === storedLang)) {
      return storedLang;
    }

    return DEFAULT_LANG;
  }, [storedLang]);

  const activeLanguageName = useMemo(
    () =>
      AvailableLanguages.find(language => language.code === activeLang)?.name ??
      activeLang,
    [activeLang],
  );

  const handleLanguageChange = useCallback(
    async (selectedLang: ELang) => {
      if (selectedLang === activeLang) {
        return;
      }

      try {
        const resolvedLang = await LocalizationService.changeLanguage(selectedLang);
        dispatch(setLanguage(resolvedLang));
        dispatch(syncTaskBaseTranslations());
      } catch (error) {
        console.error('Language change failed:', error);
      }
    },
    [activeLang, dispatch],
  );

  const handleChildPasswordObligatoryChange = useCallback(
    (value: boolean) => {
      dispatch(setIsChildPasswordObligatory(value));
    },
    [dispatch],
  );

  const handleSignOut = useCallback(async () => {
    if (refreshToken) {
      try {
        await logoutUser(refreshToken);
      } catch {
        // Ignore logout API errors and clear local session anyway.
      }
    }

    dispatch(clearAuthSession());
    dispatch(setRequireLogin(true));
  }, [dispatch, refreshToken]);

  const sections = useMemo((): SettingsSection[] => {
    const allSections: SettingsSection[] = [
      {
        id: 'account',
        title: t('settings.account.title'),
        description: needsAuthLogin
          ? t('settings.account.session_expired')
          : hasAuthSession
            ? t('settings.account.signed_in')
            : undefined,
        defaultExpanded: needsAuthLogin,
        visible: isMultidevice && isAdmin,
        items: needsAuthLogin
          ? [
              {
                type: 'select' as const,
                id: 'sign-in',
                title: t('settings.account.sign_in'),
                selected: false,
                onPress: () => {
                  router.push('/(onboarding)?setup=1');
                },
              },
            ]
          : hasAuthSession
            ? [
                {
                  type: 'select' as const,
                  id: 'sign-out',
                  title: t('settings.account.sign_out'),
                  selected: false,
                  onPress: () => {
                    void handleSignOut();
                  },
                },
              ]
            : [],
      },
      {
        id: 'language',
        title: t('settings.language'),
        description: activeLanguageName,
        defaultExpanded: false,
        items: AvailableLanguages.map(language => ({
          type: 'select' as const,
          id: language.code,
          title: language.name,
          selected: activeLang === language.code,
          onPress: () => {
            void handleLanguageChange(language.code);
          },
        })),
      },
      {
        id: 'children',
        title: t('settings.children'),
        defaultExpanded: false,
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
    activeLang,
    activeLanguageName,
    handleChildPasswordObligatoryChange,
    handleLanguageChange,
    handleSignOut,
    hasAuthSession,
    isAdmin,
    isChildPasswordObligatory,
    isMultidevice,
    needsAuthLogin,
    router,
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
