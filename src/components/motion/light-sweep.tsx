import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { useLoop } from './use-loop';

/**
 * Diagonal light bar that sweeps across a card, then pauses — the prototype's
 * `@keyframes sweep` (translateX(-160%) → 560% over the first 55% of the cycle,
 * then holds). Skewed -18deg.
 *
 * Place as a child of a card with `overflow:'hidden'`. Needs the card's width so
 * the travel distance is right.
 *
 *   <View style={styles.continueCard}>
 *     <AmbientGlow … />
 *     <LightSweep width={CARD_WIDTH} duration={5500} delay={1200} />
 *     … content …
 *   </View>
 */
export function LightSweep({
  width,
  band = 70,
  duration = 5500,
  delay = 1200,
}: {
  width: number;
  band?: number;
  duration?: number;
  delay?: number;
}) {
  const t = useLoop(duration, { delay });

  const aStyle = useAnimatedStyle(() => ({
    // travel during first 55% of the loop, then hold off-screen until it repeats
    transform: [
      {
        translateX: interpolate(
          t.value,
          [0, 0.55, 1],
          [-band - width * 0.6, width + band, width + band],
        ),
      },
      { skewX: '-18deg' },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, { width: band }, aStyle]}>
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.07)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, bottom: 0, left: 0 },
});
