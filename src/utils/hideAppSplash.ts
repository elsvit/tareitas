import * as SplashScreen from 'expo-splash-screen';

let hideRequested = false;

export function hideAppSplash() {
  if (hideRequested) {
    return;
  }

  hideRequested = true;
  void SplashScreen.hideAsync().catch(() => {});
}

/** Safety net if bootstrap/rehydration never completes (release builds). */
export function scheduleAppSplashFallbackHide(delayMs = 4000) {
  const timer = setTimeout(() => {
    hideAppSplash();
  }, delayMs);

  return () => clearTimeout(timer);
}
