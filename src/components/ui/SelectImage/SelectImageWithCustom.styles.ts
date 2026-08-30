import { StyleSheet } from 'react-native';

import { FORM_FIELD, SCREEN_TEXT } from '~/constants/formField';
import { spacing } from '~/styles';
import { Colors } from '~/styles';

const AVATAR_SIZE = 40;

export const styles = StyleSheet.create({
  container: {
    gap: spacing(2),
  },
  errorText: {
    color: Colors.red500,
    marginTop: spacing(1),
  },
  label: {
    marginBottom: 8,
    color: SCREEN_TEXT.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
  },
  scrollGridContent: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    gap: spacing(3),
  },
  avatarOuter: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  loadPhotoButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  loadPhotoText: {
    color: Colors.blue500,
    textDecorationLine: 'underline',
  },
  customSection: {
    gap: spacing(2),
  },
  customLabel: {
    color: SCREEN_TEXT.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: FORM_FIELD.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  sheetTitle: {
    color: FORM_FIELD.text,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
  },
  previewImage: {
    width: 240,
    height: 240,
    borderRadius: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
