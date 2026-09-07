import {
  AudioQuality,
  IOSOutputFormat,
  type RecordingOptions,
} from 'expo-audio';

/** Mono voice capture at 24 kHz — good for short task instructions. */
export const TASK_RECORD_SAMPLE_RATE = 24000;

/** Target bitrate (25–48 kbps range); ~120 KB for a 30 s clip. */
export const TASK_RECORD_BITRATE = 32000;

export const TASK_RECORD_CHANNELS = 1;

/**
 * Compact AAC recording preset for task voice notes.
 * Native iOS/Android use .m4a (AAC). Opus is used on web only.
 */
export const TASK_RECORDING_OPTIONS: RecordingOptions = {
  extension: '.m4a',
  sampleRate: TASK_RECORD_SAMPLE_RATE,
  numberOfChannels: TASK_RECORD_CHANNELS,
  bitRate: TASK_RECORD_BITRATE,
  android: {
    extension: '.m4a',
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
    sampleRate: TASK_RECORD_SAMPLE_RATE,
  },
  ios: {
    extension: '.m4a',
    outputFormat: IOSOutputFormat.MPEG4AAC,
    audioQuality: AudioQuality.LOW,
    sampleRate: TASK_RECORD_SAMPLE_RATE,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm;codecs=opus',
    bitsPerSecond: TASK_RECORD_BITRATE,
  },
};
