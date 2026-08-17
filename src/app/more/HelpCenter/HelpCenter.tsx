import React, { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';

import { List } from 'react-native-paper';

import ChevronDownIcon from '~/assets/svg/common/chevron-down.svg';
import ChevronUpIcon from '~/assets/svg/common/chevron-up.svg';
import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { Text } from '~/components/ui';
import { t } from '~/services';
import { useStyle } from '~/styles';

import themedStyles, { HELP_CENTER_LIST_THEME } from './styles';
import { HelpCenterFlowStepVisual } from './HelpCenterFlowStepVisual';

const HELP_EMAIL = 'tarecitas@gmail.com';

const FLOW_STEP_KEYS = [
  'helpCenter.flow_step_1',
  'helpCenter.flow_step_2',
  'helpCenter.flow_step_3',
  'helpCenter.flow_step_4',
  'helpCenter.flow_step_5',
  'helpCenter.flow_step_6',
  'helpCenter.flow_step_7',
] as const;

type HelpSectionId = 'flow' | 'write_us';

export default function HelpCenter() {
  const [styles] = useStyle(themedStyles);
  const [expandedSections, setExpandedSections] = useState<
    Record<HelpSectionId, boolean>
  >({
    flow: false,
    write_us: false,
  });

  const flowSteps = FLOW_STEP_KEYS.map(key => t(key));

  const toggleSection = useCallback((sectionId: HelpSectionId) => {
    setExpandedSections(current => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  }, []);

  const handleEmailPress = useCallback(async () => {
    const mailtoUrl = `mailto:${HELP_EMAIL}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);

      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      }
    } catch {
      // Ignore — no mail client available.
    }
  }, []);

  return (
    <SafeAreaBgImage>
      <ScreenHeader
        hasBackButton
        title={t('helpCenter.title')}
        containerStyle={styles.screenHeader}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <List.Section style={styles.section}>
          <List.Accordion
            title={t('helpCenter.flow')}
            expanded={expandedSections.flow}
            onPress={() => toggleSection('flow')}
            right={({ isExpanded }) =>
              isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />
            }
            style={styles.accordion}
            titleStyle={styles.accordionTitle}
            theme={HELP_CENTER_LIST_THEME}
          >
            <View style={styles.flowContent}>
              {flowSteps.map((step, index) => (
                <View key={FLOW_STEP_KEYS[index]} style={styles.flowStep}>
                  <Text style={styles.flowStepNumber}>{index + 1}.</Text>
                  <Text style={styles.flowStepText}>{step}</Text>
                  <HelpCenterFlowStepVisual stepIndex={index} />
                </View>
              ))}
            </View>
          </List.Accordion>
        </List.Section>

        <List.Section style={styles.section}>
          <List.Accordion
            title={t('helpCenter.write_us')}
            expanded={expandedSections.write_us}
            onPress={() => toggleSection('write_us')}
            right={({ isExpanded }) =>
              isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />
            }
            style={styles.accordion}
            titleStyle={styles.accordionTitle}
            theme={HELP_CENTER_LIST_THEME}
          >
            <View style={styles.writeUsContent}>
              <Pressable
                onPress={handleEmailPress}
                accessibilityRole="link"
                accessibilityLabel={HELP_EMAIL}
              >
                <Text style={styles.emailLink}>{HELP_EMAIL}</Text>
              </Pressable>
              <Text style={styles.writeUsHint}>{t('helpCenter.write_us_hint')}</Text>
            </View>
          </List.Accordion>
        </List.Section>
      </ScrollView>
    </SafeAreaBgImage>
  );
}
