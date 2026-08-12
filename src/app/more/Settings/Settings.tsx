import React from 'react';
import { ScrollView, View } from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements';
import { List } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import bgImgSrc from '~/assets/img/bg.png';
import CheckIcon from '~/assets/svg/common/check.svg';
import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
import { LocalizationService, t } from '~/services/localization/localization';
import { selectLang } from '~/store/settings/selectors';
import { setLanguage } from '~/store/settings/slice';
import { syncTaskBaseTranslations } from '~/store/taskBase/slice';
import { palette, useStyle } from '~/styles';
import { ELang } from '~/types/ELang';

import themedStyles from './styles';

export default function Settings() {
  const dispatch = useDispatch();
  const headerHeight = useHeaderHeight();

  const [styles] = useStyle(themedStyles);
  const currentLang = useSelector(selectLang);

  // Keep native header title in sync with language
  useI18nHeaderTitle('settings.title');

  const handleLanguageChange = async (selectedLang: ELang) => {
    // Update Redux store
    if (selectedLang === currentLang) return;
    try {
      await LocalizationService.changeLanguage(selectedLang);
      dispatch(setLanguage(selectedLang));
      dispatch(syncTaskBaseTranslations());
    } catch (error) {
      // Handle error if needed
      console.error('Language change failed:', error);
    }
  };

  const languages = [
    { code: ELang.es, name: 'Español' },
    { code: ELang.en, name: 'English' },
  ];

  return (
    <SafeAreaBackground bgImg={bgImgSrc}>
      <ScrollView contentContainerStyle={{ paddingTop: headerHeight }}>
        <List.Section>
          <List.Subheader style={styles.listSubheader}>
            {t('settings.language')}
          </List.Subheader>
          {languages.map(language => {
            const isChecked = currentLang === language.code;
            const onPress = () => handleLanguageChange(language.code);

            const renderLeft = () => (
              <View style={styles.checkboxStyle}>
                {isChecked ? <CheckIcon /> : null}
              </View>
            );

            return (
              <List.Item
                key={language.code}
                title={language.name}
                style={styles.item}
                titleStyle={{
                  ...styles.titleStyle,
                  color: isChecked
                    ? palette.text.primary
                    : palette.text.secondary,
                }}
                onPress={onPress}
                left={renderLeft}
              />
            );
          })}
        </List.Section>
      </ScrollView>
    </SafeAreaBackground>
  );
}
