import { StyleSheet } from 'react-native';

import { SCREEN_TEXT } from '~/constants/formField';
import { spacing } from '~/styles';
import { Colors } from '~/styles';

export const IMAGE_SIZE = 56;

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing(5),
    paddingTop: spacing(4),
    paddingBottom: spacing(6),
    gap: spacing(6),
  },
  section: {
    gap: spacing(3),
  },
  sectionTitle: {
    color: SCREEN_TEXT.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    overflow: 'visible',
    position: 'relative',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.red500,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  emptyText: {
    color: Colors.grey500,
  },
});
