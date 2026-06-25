import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle } from 'react-native-reanimated';

import { useLoop } from './use-loop';

/**
 * The lesson-video "REPRODUCIENDO…" loader — `@keyframes spin` (continuous
 * 360° rotation, 0.8s linear). A mint arc on a faint track.
 *
 *   {state === 'playing' && <VideoSpinner />}
 */
export function VideoSpinner({ size = 34 }: { size?: number }) {
  const t = useLoop(800, { easing: Easing.linear });
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${t.value * 360}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2, borderWidth: 3 },
        aStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    borderColor: 'rgba(101,231,201,0.25)',
    borderTopColor: '#65E7C9',
  },
});
