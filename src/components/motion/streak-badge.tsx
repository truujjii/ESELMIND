import { useId } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Typography } from '@/constants/theme';
import { AnimatedFlame } from './animated-flame';
import { useLoop } from './use-loop';

const FONT_SERIF = Typography.serif.semibold;
const FONT_MONO = Typography.mono.semibold;

/**
 * The home/aprende streak chip with the live flame + pulsing ember glow
 * (`@keyframes emberPulse`, radial orange glow opacity .45 ↔ .95, 2.4s).
 * Drop-in replacement for the static streak badge currently in home.tsx /
 * (tabs)/index.tsx.
 */
export function StreakBadge({ count, onPress }: { count: number; onPress?: () => void }) {
  const id = useId();
  const t = useLoop(2400, { pingPong: true });

  const emberStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 1], [0.5, 1]),
  }));

  return (
    <Pressable onPress={onPress} style={styles.badge}>
      {/* ember glow */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, emberStyle]}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id={id} cx="18%" cy="65%" r="60%">
              <Stop offset="0" stopColor="rgb(255,150,70)" stopOpacity={0.42} />
              <Stop offset="0.6" stopColor="rgb(255,150,70)" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id})`} />
        </Svg>
      </Animated.View>

      <View style={styles.iconWrap}>
        <AnimatedFlame />
      </View>
      <View>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.label}>RACHA</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 6,
    paddingLeft: 7,
    paddingRight: 15,
    borderRadius: 30,
    backgroundColor: 'rgba(255,150,70,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,140,70,0.30)',
    overflow: 'hidden',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,120,50,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: { fontFamily: FONT_SERIF, fontSize: 18, color: '#FFD3AE', lineHeight: 20 },
  label: {
    fontFamily: FONT_MONO,
    fontSize: 8,
    letterSpacing: 1.4,
    color: 'rgba(255,160,110,0.78)',
    marginTop: 2,
  },
});
