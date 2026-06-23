import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnswerOption } from '@/components/answer-option';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/lib/haptics';
import { useProgress } from '@/store/progress-store';
import { findLesson } from '@/types/content';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { course, completeLesson } = useProgress();

  const lesson = findLesson(course, id);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  // Hooks must run before any early return — derive these defensively.
  const total = lesson ? lesson.questions.length : 0;
  const answered = selected !== null;

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(total ? (index + (answered ? 1 : 0)) / total : 0, { duration: 300 });
  }, [index, answered, total, progress]);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  if (!lesson) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>No encontramos este test.</ThemedText>
      </ThemedView>
    );
  }

  const question = lesson.questions[index];
  const isLast = index === total - 1;
  const gotItRight = selected === question.correctOptionId;

  function onSelect(optionId: string) {
    if (answered) return;
    setSelected(optionId);
    if (optionId === question.correctOptionId) {
      setCorrectCount((c) => c + 1);
      haptics.success();
    } else {
      haptics.error();
    }
  }

  function onNext() {
    if (isLast) {
      completeLesson(lesson!.id, correctCount, total);
      router.replace('/results');
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  return (
    <ThemedView style={[styles.screen, { paddingTop: insets.top + Spacing.two }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
          <ThemedText style={styles.close}>✕</ThemedText>
        </Pressable>
        <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
          <Animated.View
            style={[styles.progressFill, { backgroundColor: theme.accent }, progressStyle]}
          />
        </View>
        <ThemedText type="smallBold" themeColor="textSecondary">
          {index + 1}/{total}
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.inner}>
          <ThemedText type="subtitle" style={styles.prompt}>
            {question.prompt}
          </ThemedText>

          <View style={styles.options}>
            {question.options.map((option) => (
              <AnswerOption
                key={`${question.id}-${option.id}`}
                text={option.text}
                answered={answered}
                isCorrect={option.id === question.correctOptionId}
                isSelected={option.id === selected}
                onPress={() => onSelect(option.id)}
              />
            ))}
          </View>

          {answered && (
            <Animated.View entering={FadeInDown.springify().damping(18)}>
              <ThemedView
                style={[
                  styles.explanation,
                  { backgroundColor: (gotItRight ? theme.success : theme.danger) + '18' },
                ]}>
                <ThemedText type="smallBold">
                  {gotItRight ? '¡Correcto!' : 'No exactamente'}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {question.explanation}
                </ThemedText>
              </ThemedView>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
        <Pressable
          disabled={!answered}
          onPress={onNext}
          style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
          <View
            style={[
              styles.cta,
              { backgroundColor: answered ? theme.accent : theme.backgroundSelected },
            ]}>
            <ThemedText style={[styles.ctaText, !answered && { color: theme.textSecondary }]}>
              {isLast ? 'Ver resultados' : 'Siguiente'}
            </ThemedText>
          </View>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  close: {
    fontSize: 22,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  prompt: {
    fontSize: 24,
    lineHeight: 32,
  },
  options: {
    gap: Spacing.two,
  },
  explanation: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.one,
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  cta: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: 'center',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
