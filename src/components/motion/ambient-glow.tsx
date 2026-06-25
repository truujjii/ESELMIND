import { useId } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useLoop } from './use-loop';

/**
 * Soft pulsing radial glow — the prototype's `@keyframes glowPulse`
 * (opacity .45 ↔ .85 over 5–6s, ease-in-out).
 *
 * RN has no CSS radial-gradient, so this paints one with react-native-svg and
 * pulses the whole layer's opacity. Drop it as the FIRST child of any hero card
 * (the card needs `overflow:'hidden'`). It is absolutely positioned + non-touchable.
 *
 *   <View style={styles.continueCard}>
 *     <AmbientGlow size={160} top={-40} right={-30} />
 *     … card content …
 *   </View>
 */
export function AmbientGlow({
  size = 160,
  color = '101,231,201', // rgb triplet, no alpha — the mint accent
  peak = 0.22, // matches rgba(...,0.22) center stop in the prototype
  duration = 5000,
  style,
  top,
  left,
  right,
  bottom,
}: {
  size?: number;
  color?: string;
  peak?: number;
  duration?: number;
  style?: ViewStyle;
  top?: number;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
}) {
  const id = useId();
  const t = useLoop(duration, { pingPong: true });

  const aStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 1], [0.55, 1]),
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.base,
        { width: size, height: size, top, left, right, bottom } as ViewStyle,
        style,
        aStyle,
      ]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={`rgb(${color})`} stopOpacity={peak} />
            <Stop offset="0.65" stopColor={`rgb(${color})`} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { position: 'absolute' },
});
