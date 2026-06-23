import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  text: string;
  answered: boolean;
  isCorrect: boolean;
  isSelected: boolean;
  onPress: () => void;
};

/**
 * A quiz answer. When the question is answered it animates: the correct option
 * "pops" (spring scale), a wrong pick "shakes". Mount this with a key that
 * includes the question id so each question starts from a clean state.
 */
export function AnswerOption({ text, answered, isCorrect, isSelected, onPress }: Props) {
  const theme = useTheme();
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!answered) return;
    if (isCorrect) {
      scale.value = withSequence(withSpring(1.04, { damping: 6, stiffness: 220 }), withSpring(1));
    } else if (isSelected) {
      shake.value = withSequence(
        withTiming(-8, { duration: 45 }),
        withTiming(8, { duration: 45 }),
        withTiming(-6, { duration: 45 }),
        withTiming(6, { duration: 45 }),
        withTiming(0, { duration: 45 }),
      );
    }
  }, [answered, isCorrect, isSelected, scale, shake]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  let backgroundColor = theme.backgroundElement;
  let borderColor = 'transparent';
  if (answered) {
    if (isCorrect) {
      backgroundColor = theme.success + '22';
      borderColor = theme.success;
    } else if (isSelected) {
      backgroundColor = theme.danger + '22';
      borderColor = theme.danger;
    }
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        disabled={answered}
        onPress={onPress}
        style={({ pressed }) => (pressed && !answered ? styles.pressed : undefined)}>
        <Animated.View style={[styles.option, { backgroundColor, borderColor }]}>
          <ThemedText style={styles.optionText}>{text}</ThemedText>
          {answered && isCorrect && (
            <ThemedText style={[styles.mark, { color: theme.success }]}>✓</ThemedText>
          )}
          {answered && isSelected && !isCorrect && (
            <ThemedText style={[styles.mark, { color: theme.danger }]}>✕</ThemedText>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.four,
    borderWidth: 2,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  mark: {
    fontSize: 18,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
