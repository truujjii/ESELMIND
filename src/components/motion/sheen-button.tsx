import type { ReactNode } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { useLoop } from './use-loop';

/**
 * A button with a looping diagonal sheen — `@keyframes btnSheen`
 * (a skewed light bar sweeps across, 3.6s loop, starts after 1.4s).
 * Used on the pass-screen "CONTINUAR" button.
 *
 *   <SheenButton onPress={goHome} style={styles.ctaDark}>
 *     <ThemedText style={styles.ctaDarkText}>CONTINUAR</ThemedText>
 *   </SheenButton>
 *
 * `style` should carry the button's bg/height/radius (it gets overflow:hidden).
 */
export function SheenButton({
  children,
  onPress,
  style,
  duration = 3600,
  delay = 1400,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  duration?: number;
  delay?: number;
}) {
  const { width } = useWindowDimensions();
  const t = useLoop(duration, { delay });
  const band = 60;

  const sheenStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 0.6, 1], [-band, width, width]) },
      { skewX: '-18deg' },
    ],
  }));

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <View style={[style, styles.clip]}>
        {children}
        <Animated.View pointerEvents="none" style={[styles.sheen, { width: band }, sheenStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.18)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  sheen: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  pressed: { opacity: 0.85 },
});
