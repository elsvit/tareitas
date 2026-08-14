import { StyleSheet } from 'react-native';
import { HEADER_HEIGHT } from '~/constants/sizes';
import { palette } from '~/styles';

export const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: palette.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  leftContainer: {
    width: 80,
    alignItems: 'flex-start',
  },
  rightContainer: {
    flexDirection: 'row',
    width: 80, // reserve space for up to 3 icons
  },
  leftButton: {
    marginRight: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  rightButton: {
    paddingHorizontal: 8,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
