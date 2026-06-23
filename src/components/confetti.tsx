import { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const COLORS = ['#208AEF', '#16A34A', '#F59E0B', '#DC2626', '#9333EA', '#22D3EE'];

/** A single falling confetti piece with randomized drift, spin, size and timing. */
function Piece({ index }: { index: number }) {
  const progress = useSharedValue(0);

  const startX = Math.random() * width;
  const drift = (Math.random() - 0.5) * 180;
  const delay = Math.random() * 350;
  const duration = 1800 + Math.random() * 1400;
  const spin = (Math.random() - 0.5) * 1080;
  const size = 6 + Math.random() * 8;
  const color = COLORS[index % COLORS.length];

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
  }, [progress, delay, duration]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift * progress.value },
      { translateY: -40 + (height + 80) * progress.value },
      { rotateZ: `${spin * progress.value}deg` },
    ],
    opacity: progress.value < 0.85 ? 1 : 1 - (progress.value - 0.85) / 0.15,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: startX,
          top: 0,
          width: size,
          height: size * 0.6,
          backgroundColor: color,
          borderRadius: 1,
        },
        style,
      ]}
    />
  );
}

/** Full-screen confetti burst. Purely decorative — never blocks touches. */
export function Confetti({ count = 90 }: { count?: number }) {
  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }).map((_, i) => (
        <Piece key={i} index={i} />
      ))}
    </Animated.View>
  );
}
