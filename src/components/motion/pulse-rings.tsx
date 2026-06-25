import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { useLoop } from './use-loop';

/**
 * Concentric pulse rings on the pass screen — `@keyframes ringPulse`
 * (scale .45 → 1.85, opacity .55 → 0, 3s, ×3 staggered by 1s).
 * Absolutely centered; drop into the pass-screen background.
 */
function Ring({ delay }: { delay: number }) {
  const t = useLoop(3000, { delay });
  const aStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 1], [0.55, 0]),
    transform: [{ scale: interpolate(t.value, [0, 1], [0.45, 1.85]) }],
  }));
  return <Animated.View style={[styles.ring, aStyle]} />;
}

export function PulseRings() {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Ring delay={0} />
      <Ring delay={1000} />
      <Ring delay={2000} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
    borderColor: 'rgba(6,20,15,0.16)',
  },
});
