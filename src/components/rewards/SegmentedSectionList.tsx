import React, { useCallback } from 'react';
import {
  SectionList,
  SectionListData,
  SectionListRenderItem,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '~/components/ui';
import { Colors } from '~/styles';

export type SegmentedSection<TItem, TSectionExtra = Record<string, unknown>> = {
  title: string;
  subtitle?: string;
  data: TItem[];
} & TSectionExtra;

type Props<TItem, TSectionExtra> = {
  sections: SegmentedSection<TItem, TSectionExtra>[];
  keyExtractor: (item: TItem, index: number) => string;
  renderItem: SectionListRenderItem<TItem, SegmentedSection<TItem, TSectionExtra>>;
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
  contentContainerStyle?: object;
};

export function SegmentedSectionList<TItem, TSectionExtra = Record<string, unknown>>({
  sections,
  keyExtractor,
  renderItem,
  ListEmptyComponent,
  contentContainerStyle,
}: Props<TItem, TSectionExtra>) {
  const renderSectionHeader = useCallback(
    ({
      section,
    }: {
      section: SectionListData<TItem, SegmentedSection<TItem, TSectionExtra>>;
    }) => (
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" weight="bold" style={styles.sectionTitle}>
          {section.title}
        </Text>
        {!!section.subtitle && (
          <Text variant="bodyMedium" style={styles.sectionSubtitle}>
            {section.subtitle}
          </Text>
        )}
      </View>
    ),
    [],
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  return (
    <SectionList<TItem, SegmentedSection<TItem, TSectionExtra>>
      sections={sections}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      ItemSeparatorComponent={renderSeparator}
      SectionSeparatorComponent={() => <View style={styles.sectionGap} />}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 96,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    color: Colors.blue500,
  },
  sectionSubtitle: {
    marginTop: 4,
    opacity: 0.8,
  },
  sectionGap: {
    height: 8,
  },
  separator: {
    height: 8,
  },
});

export default SegmentedSectionList;
