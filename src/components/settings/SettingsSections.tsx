import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { List } from 'react-native-paper';

import CheckIcon from '~/assets/svg/common/check.svg';
import ChevronDownIcon from '~/assets/svg/common/chevron-down.svg';
import ChevronUpIcon from '~/assets/svg/common/chevron-up.svg';
import { Switch } from '~/components/ui';
import { useStyle } from '~/styles';

import settingsSectionStyles, { SETTINGS_LIST_THEME } from './styles';
import type { SettingsItem } from './types';

type SettingsSectionItemProps = {
  item: SettingsItem;
};

export function SettingsSectionItem({ item }: SettingsSectionItemProps) {
  const [styles] = useStyle(settingsSectionStyles);

  if (item.type === 'select') {
    return (
      <List.Item
        title={item.title}
        style={[styles.item, styles.accordion]}
        theme={SETTINGS_LIST_THEME}
        titleStyle={{
          ...styles.itemTitle,
          ...(item.selected ? styles.itemTitleSelected : styles.itemTitleUnselected),
        }}
        onPress={item.onPress}
        left={() => (
          <View style={styles.checkboxStyle}>
            {item.selected ? <CheckIcon /> : null}
          </View>
        )}
      />
    );
  }

  return (
    <List.Item
      title={item.title}
      style={[styles.item, styles.accordion]}
      theme={SETTINGS_LIST_THEME}
      titleStyle={styles.itemTitle}
      right={() => (
        <Switch value={item.value} onValueChange={item.onValueChange} />
      )}
    />
  );
}

type SettingsCollapsibleSectionProps = {
  title: string;
  description?: string;
  expanded: boolean;
  onPress: () => void;
  children: React.ReactNode;
};

export function SettingsCollapsibleSection({
  title,
  description,
  expanded,
  onPress,
  children,
}: SettingsCollapsibleSectionProps) {
  const [styles] = useStyle(settingsSectionStyles);

  return (
    <List.Section style={styles.section}>
      <List.Accordion
        title={title}
        description={description}
        expanded={expanded}
        onPress={onPress}
        right={({ isExpanded }) =>
          isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />
        }
        style={[styles.item, styles.accordion]}
        titleStyle={styles.accordionTitle}
        theme={SETTINGS_LIST_THEME}
      >
        {children}
      </List.Accordion>
    </List.Section>
  );
}

type SettingsSectionsProps = {
  sections: Array<{
    id: string;
    title: string;
    description?: string;
    defaultExpanded?: boolean;
    items: SettingsItem[];
  }>;
};

export function SettingsSections({ sections }: SettingsSectionsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        sections.map(section => [section.id, section.defaultExpanded ?? false]),
      ),
  );

  useEffect(() => {
    setExpandedSections(current => {
      const next = { ...current };

      sections.forEach(section => {
        if (next[section.id] === undefined) {
          next[section.id] = section.defaultExpanded ?? false;
        }
      });

      return next;
    });
  }, [sections]);

  const handleSectionPress = useCallback((sectionId: string) => {
    setExpandedSections(current => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  }, []);

  return (
    <>
      {sections.map(section => (
        <SettingsCollapsibleSection
          key={section.id}
          title={section.title}
          description={section.description}
          expanded={expandedSections[section.id] ?? false}
          onPress={() => handleSectionPress(section.id)}
        >
          {section.items.map(item => (
            <SettingsSectionItem key={`${section.id}-${item.id}`} item={item} />
          ))}
        </SettingsCollapsibleSection>
      ))}
    </>
  );
}
