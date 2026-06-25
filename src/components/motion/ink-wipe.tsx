import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { EASE_STANDARD } from './use-loop';

/**
 * Ink-wipe curtain — the prototype's `inkCover` (circle grows from bottom-center,
 * 0.48s) + `inkReveal` (circle shrinks away, 0.5s), cubic-bezier(.4,0,.2,1).
 *
 * Used for the results → Aprende handoff. Mount it over your navigator. Drive it:
 *   const [phase, setPhase] = useState<'idle'|'cover'|'reveal'>('idle');
 *   // tap Continuar:
 *   setPhase('cover');                       // grows to full
 *   // in onCovered: navigate, then:
 *   setPhase('reveal');                      // shrinks away
 *
 *   <InkWipe phase={phase} onCovered={() => { router.replace('/(tabs)'); setPhase('reveal'); }} />
 */
export function InkWipe({
  phase,
  onCovered,
}: {
  phase: 'idle' | 'cover' | 'reveal';
  onCovered?: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const D = Math.max(width, height) * 2.4; // diameter big enough to cover corners
  const scale = useSharedValue(phase === 'cover' ? 0 : 1);

  useEffect(() => {
    if (phase === 'cover') {
      scale.value = 0;
      scale.value = withTiming(1, { duration: 480, easing: EASE_STANDARD }, (done) => {
        'worklet';
        if (done && onCovered) runOnJS(onCovered)();
      });
    } else if (phase === 'reveal') {
      scale.value = withTiming(0, { duration: 500, easing: EASE_STANDARD });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (phase === 'idle') return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: width / 2 - D / 2,
            top: height * 0.9 - D / 2, // origin at 50% 90%
            width: D,
            height: D,
            borderRadius: D / 2,
            backgroundColor: '#0A0F12',
          },
          circleStyle,
        ]}
      />
    </View>
  );
}
