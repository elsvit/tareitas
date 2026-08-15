import { StyleSheet } from 'react-native';

import { Colors } from '~/styles';

export const styles = StyleSheet.create({
  backdropContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.grey200,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionTitle: {
    color: Colors.grey900,
  },
  optionDescription: {
    marginTop: 4,
    color: Colors.grey700,
    opacity: 0.85,
  },
  cancelRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
