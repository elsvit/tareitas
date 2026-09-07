import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';

import { useResolvedMediaUrl } from '~/hooks/useResolvedMediaUrl';
import { Colors } from '~/styles';

type Props = {
  audioRecord: string;
  variant: 'indicator' | 'button';
};

export function TaskRecordPlayControl({ audioRecord, variant }: Props) {
  const playbackSource = useResolvedMediaUrl(audioRecord);
  const player = useAudioPlayer(playbackSource);
  const playerStatus = useAudioPlayerStatus(player);

  const handlePlay = async () => {
    if (!playbackSource) {
      return;
    }

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    });

    if (playerStatus.playing) {
      player.pause();
      return;
    }

    if (
      playerStatus.currentTime > 0 &&
      playerStatus.currentTime < (playerStatus.duration || 0)
    ) {
      player.play();
      return;
    }

    player.seekTo(0);
    player.play();
  };

  if (variant === 'indicator') {
    return (
      <View style={styles.indicator} pointerEvents="none">
        <MaterialCommunityIcons
          name="play-circle-outline"
          size={16}
          color={Colors.grey700}
        />
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePlay}
      hitSlop={8}
      style={styles.playButton}
    >
      <MaterialCommunityIcons
        name={playerStatus.playing ? 'pause-circle' : 'play-circle'}
        size={28}
        color={Colors.grey700}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  indicator: {
    flexShrink: 0,
  },
  playButton: {
    marginRight: 8,
    flexShrink: 0,
  },
});

export default TaskRecordPlayControl;
