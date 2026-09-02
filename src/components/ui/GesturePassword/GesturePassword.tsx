// components/GesturePassword.tsx
import React, { useMemo, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  View,
} from 'react-native';

import { Button, ButtonColors } from '~/components/ui/Button';
import { Text } from '~/components/ui/Text';
import { t } from '~/services';

type Props = {
  size?: number;
  onComplete?: (pattern: number[]) => void;
  minLength?: number;
};

// type Point = {
//   id: number;
//   x: number;
//   y: number;
// };

const GRID_SIZE = 3;

export const GesturePassword: React.FC<Props> = ({
  size = 300,
  onComplete,
  minLength = 4,
}) => {
  const [selected, setSelected] = useState<number[]>([]);
  // const [layout, setLayout] = useState<{ x: number; y: number }>({
  //   x: 0,
  //   y: 0,
  // });

  const points = useMemo(() => {
    const spacing = size / GRID_SIZE;

    return Array.from({ length: 9 }, (_, i) => {
      const row = Math.floor(i / GRID_SIZE);
      const col = i % GRID_SIZE;

      return {
        id: i + 1,
        x: col * spacing + spacing / 2,
        y: row * spacing + spacing / 2,
      };
    });
  }, [size]);

  const findTouchedPoint = (x: number, y: number) => {
    return points.find(point => {
      const dx = point.x - x;
      const dy = point.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 30;
    });
  };

  const addPoint = (pointId: number) => {
    setSelected(prev => {
      if (prev.includes(pointId)) {
        return prev;
      }
      return [...prev, pointId];
    });
  };

  const handleRelease = () => {
    if (selected.length >= minLength) {
      onComplete?.(selected);
    }
  };

  const reset = () => {
    setSelected([]);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        const touched = findTouchedPoint(locationX, locationY);

        if (touched) {
          addPoint(touched.id);
        }
      },

      onPanResponderMove: (
        evt: GestureResponderEvent,
        _gestureState: PanResponderGestureState,
      ) => {
        const { locationX, locationY } = evt.nativeEvent;
        const touched = findTouchedPoint(locationX, locationY);

        if (touched) {
          addPoint(touched.id);
        }
      },

      onPanResponderRelease: () => {
        handleRelease();
      },
    }),
  ).current;

  const onLayout = (event: LayoutChangeEvent) => {
  //   const { x, y } = event.nativeEvent.layout;
  //   setLayout({ x, y });
  };

  const handleComplete = () => {
    if (selected.length >= minLength) {
      onComplete?.(selected);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" weight="bold">
        {t('users.draw_password_pattern')}
      </Text>

      <View
        style={[styles.grid, { width: size, height: size }]}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        {points.map(point => {
          const isSelected = selected.includes(point.id);

          return (
            <View
              key={point.id}
              style={[
                styles.point,
                {
                  left: point.x - 20,
                  top: point.y - 20,
                },
                isSelected && styles.selectedPoint,
              ]}
            >
              <Text weight="bold">{point.id}</Text>
            </View>
          );
        })}
      </View>

      {/*<Text>Pattern: {selected.join('-')}</Text>*/}

      <View style={styles.footer}>
        <Button mode="contained" bgColor={ButtonColors.Gray} onPress={reset}>
          {t('button.reset') || 'Reset'}
        </Button>
        <Button
          mode="contained"
          onPress={handleComplete}
          bgColor={ButtonColors.Green}
          // style={styles.footerBtn}
          disabled={selected.length < minLength}
        >
          {t('button.save') || 'Save'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },

  grid: {
    marginVertical: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    position: 'relative',
  },

  point: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedPoint: {
    backgroundColor: '#3B82F6',
    borderColor: '#1D4ED8',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
});

export default GesturePassword;
