import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { EASE_BACK } from './use-loop';

/**
 * The giant "+120" XP number — `@keyframes popIn` (scale .55 → 1.07 → 1,
 * cubic-bezier(.34,1.56,.64,1), 0.6s) immediately followed by the looping
 * `@keyframes breathe` (scale 1 ↔ 1.035, 3.4s).
 *
 * The repo currently just FadeIns this number. Wrap the XP <Text> with this:
 *   <PopBreathe><ThemedText style={styles.xpNumber}>+{xpEarned}</ThemedText></PopBreathe>
 */
export function PopBreathe({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const scale = useSharedValue(0.55);

  useEffect(() => {
    scale.value = withSequence(
      // popIn: .55 → 1.07 → 1
      withTiming(1.07, { duration: 380, easing: EASE_BACK }),
      withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }),
      // then breathe forever, after a short hold
      withDelay(
        500,
        withRepeat(
          withTiming(1.035, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
          -1,
          true,
        ),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return <Animated.View style={[style, aStyle]}>{children}</Animated.View>;
}
