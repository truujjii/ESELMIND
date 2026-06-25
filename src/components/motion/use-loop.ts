import { useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  type EasingFunction,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

/**
 * A normalized 0 → 1 driver that repeats forever.
 *
 * `pingPong` true  → 0→1→0→1 … (use for breathing / pulsing opacity & scale)
 * `pingPong` false → 0→1, 0→1 … hard reset (use for sweeps, sparks, rings, spin)
 *
 * Read it inside a useAnimatedStyle with `interpolate(t.value, …)`.
 *
 * Mirrors the prototype's CSS `animation: … infinite` loops 1:1 — match the CSS
 * `duration` here and pick the easing that matches the keyframe timing function.
 */
export function useLoop(
  duration: number,
  {
    pingPong = false,
    delay = 0,
    easing = Easing.inOut(Easing.ease),
  }: { pingPong?: boolean; delay?: number; easing?: EasingFunction } = {},
): SharedValue<number> {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing }), -1, pingPong),
    );
    return () => cancelAnimation(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, pingPong, delay]);

  return t;
}

/** The prototype's signature ease — `cubic-bezier(.22, 1, .36, 1)`. */
export const EASE_OUT_EXPO = Easing.bezier(0.22, 1, 0.36, 1);
/** Springy overshoot used by popIn — `cubic-bezier(.34, 1.56, .64, 1)`. */
export const EASE_BACK = Easing.bezier(0.34, 1.56, 0.64, 1);
/** Ink-wipe easing — `cubic-bezier(.4, 0, .2, 1)`. */
export const EASE_STANDARD = Easing.bezier(0.4, 0, 0.2, 1);
