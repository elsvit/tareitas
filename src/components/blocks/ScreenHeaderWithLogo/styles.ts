import { StyleSheet } from 'react-native';
import { palette } from '~/styles';
import { HEADER_HEIGHT } from '~/constants';

const AVATAR_SIZE = 36;

export const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: palette.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    position: 'relative',
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 1,
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  userSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    gap: 8,
  },
  userName: {
    flexShrink: 1,
    maxWidth: 120,
    textAlign: 'right',
  },
  avatarButton: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  avatarFallbackText: {
    fontSize: 16,
    fontWeight: '700',
  },
  leftButton: {
    marginRight: 12,
  },
  titleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  rightButton: {
    paddingHorizontal: 8,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
