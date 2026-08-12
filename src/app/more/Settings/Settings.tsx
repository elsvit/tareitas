import React from 'react';
import { ScrollView, View } from 'react-native';

import { List } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import bgImgSrc from '~/assets/img/bg.png';
import CheckIcon from '~/assets/svg/common/check.svg';
import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { SCREEN_TEXT } from '~/constants/formField';
import { LocalizationService, t } from '~/services/localization/localization';
import { selectLang } from '~/store/settings/selectors';
import { setLanguage } from '~/store/settings/slice';
import { syncTaskBaseTranslations } from '~/store/taskBase/slice';
import { useStyle } from '~/styles';
import { ELang } from '~/types/ELang';

import themedStyles from './styles';

export default function Settings() {
  const dispatch = useDispatch();

  const [styles] = useStyle(themedStyles);
  const currentLang = useSelector(selectLang);

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
    <SafeAreaBackground hasTopInsets bgImg={bgImgSrc}>
      <ScreenHeader
        hasBackButton
        title={t('settings.title')}
        containerStyle={styles.screenHeader}
      />
      <ScrollView>
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
                    ? SCREEN_TEXT.primary
                    : SCREEN_TEXT.secondary,
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
