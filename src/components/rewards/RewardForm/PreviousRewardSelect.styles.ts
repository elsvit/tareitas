import { StyleSheet } from 'react-native';

import { FORM_FIELD } from '~/constants/formField';
import { spacing } from '~/styles';

export const styles = StyleSheet.create({
  valueOverlay: {
    position: 'absolute',
    left: 12,
    right: 44,
    top: 10,
    bottom: 6,
    justifyContent: 'center',
  },
  selectedValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedImageContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  selectedTexts: {
    flex: 1,
    minWidth: 0,
  },
  selectedTitle: {
    color: FORM_FIELD.text,
  },
  selectedReward: {
    color: FORM_FIELD.label,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  optionIconSlot: {
    width: 20,
    height: 20,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  optionImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionImage: {
    width: '100%',
    height: '100%',
  },
  optionTexts: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  optionTitle: {
    color: FORM_FIELD.menuText,
  },
  optionReward: {
    color: FORM_FIELD.label,
  },
});
