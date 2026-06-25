import { useId } from 'react';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { useLoop } from './use-loop';

/**
 * The real ESELMIND flame — replaces the flat 🔥 emoji in the streak badge.
 * SVG path + vertical gradient (#FFE08A → #FF9D3D → #FF5A2E), flickering via the
 * prototype's `@keyframes flameFlicker` (scale + rotate wobble, ~1.5s loop,
 * transform-origin bottom).
 */
export function AnimatedFlame({ width = 15, height = 19 }: { width?: number; height?: number }) {
  const id = useId();
  const t = useLoop(1500, { pingPong: true });

  const aStyle = useAnimatedStyle(() => ({
    transform: [
      // emulate transform-origin:50% 100% by nudging up while it scales
      { translateY: interpolate(t.value, [0, 0.5, 1], [0, -0.6, 0]) },
      { scaleX: interpolate(t.value, [0, 0.25, 0.5, 0.75, 1], [1, 1.08, 0.95, 1.05, 1]) },
      { scaleY: interpolate(t.value, [0, 0.25, 0.5, 0.75, 1], [1, 0.94, 1.06, 0.97, 1]) },
      { rotate: `${interpolate(t.value, [0, 0.25, 0.5, 0.75, 1], [0, -3, 2, -1.5, 0])}deg` },
    ],
  }));

  return (
    <Animated.View style={aStyle}>
      <Svg width={width} height={height} viewBox="0 0 24 30">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFE08A" />
            <Stop offset="0.45" stopColor="#FF9D3D" />
            <Stop offset="1" stopColor="#FF5A2E" />
          </LinearGradient>
        </Defs>
        <Path
          d="M13 1c.8 5.6 6.6 7.1 6.6 14.1A7.6 7.6 0 0 1 5 16c0-2.7 1.2-4.1 2-5.3.6 2.4 2.4 2.9 2.4 1.2C9.4 9 12.5 7 13 1Z"
          fill={`url(#${id})`}
        />
      </Svg>
    </Animated.View>
  );
}
