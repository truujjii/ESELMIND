import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

/*
 * One-shot mount entrances, built with Reanimated's `Keyframe` API (the same one
 * already used in animated-icon.tsx). These replace the prototype's CSS
 * `screenIn`, `fadeUp` and `cardIn` keyframes 1:1.
 *
 * Reanimated `Keyframe` easing must be set on the stop you are easing TOWARD.
 * The bezier (.22,1,.36,1) is the prototype's signature ease-out.
 */

const EASE = Easing.bezier(0.22, 1, 0.36, 1);

// screenIn — translateY(16) + scale(.985) → none, 450–500ms
const ScreenInKf = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 16 }, { scale: 0.985 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }], easing: EASE },
});

// fadeUp — translateY(16) → 0, 500ms
const FadeUpKf = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 16 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: EASE },
});

// cardIn — translateY(28) + scale(.94) → none with mid opacity hold, 600ms
const CardInKf = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 28 }, { scale: 0.94 }] },
  55: { opacity: 1, transform: [{ translateY: 12 }, { scale: 0.975 }], easing: EASE },
  100: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }], easing: EASE },
});

/** Whole-screen enter. Wrap a screen's root content. */
export function ScreenIn({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={ScreenInKf.duration(450)} style={style}>
      {children}
    </Animated.View>
  );
}

/**
 * Staggered fade-up for stacked cards. Match the prototype's stagger by passing
 * delay: card 1 = 0, card 2 = 60, card 3 = 120 …
 */
export function FadeUp({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View entering={FadeUpKf.duration(500).delay(delay)} style={style}>
      {children}
    </Animated.View>
  );
}

/** Hero card entrance (bigger travel + scale). Use on the "Continúa" / rank card. */
export function CardIn({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View entering={CardInKf.duration(600).delay(delay)} style={style}>
      {children}
    </Animated.View>
  );
}
