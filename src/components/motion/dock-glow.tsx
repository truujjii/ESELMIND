import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { EASE_OUT_EXPO, useLoop } from './use-loop';

const MINT = '#65E7C9';

/**
 * The tab-bar glow dot — but it now SLIDES under the active tab
 * (`left` transition 0.42s cubic-bezier(.22,1,.36,1)) and pulses
 * (`@keyframes dockGlow`, opacity .45 ↔ .9, 3.6s) instead of jumping.
 *
 * Drop-in replacement for the static `<View style={styles.glow} />` in
 * (tabs)/_layout.tsx. Render it as the first child of `styles.wrapper`,
 * passing the live `state.index` and the tab count.
 *
 *   <DockGlow index={state.index} count={3} />
 */
export function DockGlow({
  index,
  count = 3,
  horizontalInset = 16,
  width = 92,
}: {
  index: number;
  count?: number;
  horizontalInset?: number;
  width?: number;
}) {
  const { width: screenW } = useWindowDimensions();
  const barWidth = screenW - horizontalInset * 2;
  const slot = barWidth / count;

  const x = useSharedValue(horizontalInset + slot * (index + 0.5));
  const pulse = useLoop(3600, { pingPong: true });

  useEffect(() => {
    x.value = withTiming(horizontalInset + slot * (index + 0.5), {
      duration: 420,
      easing: EASE_OUT_EXPO,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, slot, horizontalInset]);

  const aStyle = useAnimatedStyle(() => ({
    left: x.value,
    opacity: interpolate(pulse.value, [0, 1], [0.45, 0.9]),
  }));

  return <Animated.View pointerEvents="none" style={[styles.glow, { width }, aStyle]} />;
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    bottom: 8,
    height: 20,
    borderRadius: 46,
    backgroundColor: 'rgba(101,231,201,0.45)',
    transform: [{ translateX: -46 }],
    shadowColor: MINT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
});
