import { StyleSheet } from 'react-native';

import { Colors, spacing } from '~/styles';

export const onboardingStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screenHeader: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  container: {
    padding: spacing(4),
    paddingBottom: spacing(4),
    flexGrow: 1,
  },
  progressBar: {
    height: 20,
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.orange300,
    marginTop: spacing(2),
    marginBottom: spacing(3),
  },
  footer: {
    marginTop: spacing(3),
    flexDirection: 'row',
    gap: spacing(2),
    justifyContent: 'space-between',
  },
  footerBtn: {
    minWidth: 120,
  },
  stepHeader: {
    gap: spacing(1),
    marginBottom: spacing(3),
  },
  stepIndicatorBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(0.75),
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  stepTransitionHost: {
    overflow: 'hidden',
    width: '100%',
  },
  stepTransitionContent: {
    width: '100%',
  },
  stepDescription: {
    opacity: 0.85,
  },
  introSlide: {
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(2),
  },
  introTitle: {
    textAlign: 'center',
  },
  introDescription: {
    textAlign: 'center',
    opacity: 0.85,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing(1.5),
    marginTop: spacing(2),
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.blue200,
  },
  dotActive: {
    backgroundColor: Colors.blue600,
    width: 24,
  },
  syncModeSectionBox: {
    borderWidth: 2,
    borderColor: Colors.blue200,
    borderRadius: 16,
    padding: spacing(2.5),
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    gap: spacing(2),
  },
  syncModeSectionBoxSelected: {
    borderColor: Colors.blue600,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  syncModeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(0.5),
  },
  syncModeSectionHeaderText: {
    flex: 1,
  },
  syncModeOptions: {
    gap: spacing(2),
  },
  syncModeOption: {
    borderWidth: 2,
    borderColor: Colors.blue200,
    borderRadius: 16,
    padding: spacing(2),
    paddingRight: spacing(3),
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  syncModeOptionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  syncModeOptionContent: {
    flex: 1,
    gap: spacing(1),
    paddingTop: spacing(1),
  },
  syncModeOptionDescription: {
    opacity: 0.85,
  },
  skipChildButton: {
    alignSelf: 'center',
    marginTop: spacing(2),
    paddingVertical: spacing(1),
  },
  accountModeRow: {
    flexDirection: 'row',
    gap: spacing(2),
    marginBottom: spacing(2),
  },
  accountModeButton: {
    flex: 1,
  },
  loginModeOptions: {
    gap: spacing(1),
    marginBottom: spacing(1),
  },
  loginModeOption: {
    paddingVertical: 0,
    paddingHorizontal: spacing(2),
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 12,
  },
  loginModeOptionLabel: {
    fontFamily: 'Fredoka_500Medium',
    color: Colors.grey900,
  },
  loginFormCard: {
    padding: spacing(2),
  },
  signUpLink: {
    alignItems: 'center',
    paddingVertical: spacing(1),
  },
  visualStage: {
    width: '100%',
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(2),
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  taskCard: {
    width: 120,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.white,
    backgroundColor: Colors.white,
  },
  taskImage: {
    width: '100%',
    height: '100%',
  },
  starBadge: {
    fontSize: 36,
  },
  rewardCard: {
    width: 110,
    height: 110,
    borderRadius: 18,
    backgroundColor: Colors.yellow100,
    borderWidth: 3,
    borderColor: Colors.orange300,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(2),
  },
  completeContainer: {
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(4),
  },
  completeAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  completeName: {
    textAlign: 'center',
  },
  arrowText: {
    fontSize: 28,
  },
});
