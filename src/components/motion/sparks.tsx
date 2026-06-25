import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { useLoop } from './use-loop';

/**
 * Rising spark particles on the pass screen — `@keyframes sparkUp`
 * (translateY 12 → -150, opacity 0 → .9 → 0, scale .6 → 1).
 * The repo already renders STATIC dots here; this makes them rise + fade in a loop.
 */
const SPARKS = [
  { left: '16%', top: '64%', size: 8, color: 'rgba(255,255,255,0.9)', dur: 3600, delay: 0 },
  { left: '80%', top: '60%', size: 6, color: 'rgba(255,255,255,0.8)', dur: 4200, delay: 600 },
  { left: '28%', top: '70%', size: 5, color: 'rgba(6,20,15,0.25)', dur: 3900, delay: 1100 },
  { left: '68%', top: '72%', size: 7, color: 'rgba(255,255,255,0.85)', dur: 4600, delay: 1700 },
  { left: '46%', top: '66%', size: 5, color: 'rgba(6,20,15,0.22)', dur: 4000, delay: 2300 },
  { left: '88%', top: '68%', size: 5, color: 'rgba(255,255,255,0.75)', dur: 4300, delay: 2900 },
] as const;

function Spark({ s }: { s: (typeof SPARKS)[number] }) {
  const t = useLoop(s.dur, { delay: s.delay });
  const aStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.18, 1], [0, 0.9, 0]),
    transform: [
      { translateY: interpolate(t.value, [0, 1], [12, -150]) },
      { scale: interpolate(t.value, [0, 1], [0.6, 1]) },
    ],
  }));
  return (
    <Animated.View
      style={[
        styles.spark,
        {
          left: s.left as any,
          top: s.top as any,
          width: s.size,
          height: s.size,
          borderRadius: s.size / 2,
          backgroundColor: s.color,
        },
        aStyle,
      ]}
    />
  );
}

export function Sparks() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {SPARKS.map((s, i) => (
        <Spark key={i} s={s} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  spark: { position: 'absolute' },
});
