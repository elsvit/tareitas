import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const APP_SOUNDS = {
  taskComplete: require('~/assets/audio/clinking-coins.mp3'),
  rewardSelect: require('~/assets/audio/fairy-arcade-sparkle.mp3'),
} as const;

export type AppSoundId = keyof typeof APP_SOUNDS;

const players = new Map<AppSoundId, ReturnType<typeof createAudioPlayer>>();
let audioModeReady = false;

async function ensureAudioMode() {
  if (audioModeReady) {
    return;
  }

  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
  });
  audioModeReady = true;
}

function getPlayer(soundId: AppSoundId) {
  let player = players.get(soundId);

  if (!player) {
    player = createAudioPlayer(APP_SOUNDS[soundId]);
    players.set(soundId, player);
  }

  return player;
}

export async function playAppSound(soundId: AppSoundId) {
  try {
    await ensureAudioMode();
    const player = getPlayer(soundId);

    if (player.currentTime > 0) {
      await player.seekTo(0);
    }

    player.play();
  } catch {
    // Ignore playback errors (missing audio session, etc.).
  }
}
