import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
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

  if (!lesson) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>No encontramos este test.</ThemedText>
      </ThemedView>
    );
  }

  const question = lesson.questions[index];
  const total = lesson.questions.length;
  const answered = selected !== null;
  const isLast = index === total - 1;

  function onSelect(optionId: string) {
    if (answered) return;
    setSelected(optionId);
    if (optionId === question.correctOptionId) {
      setCorrectCount((c) => c + 1);
    }
    // Phase 2: haptics (success/error) + answer animation land here.
  }

  function onNext() {
    if (isLast) {
      const finalCorrect = correctCount; // already includes the current answer
      completeLesson(lesson!.id, finalCorrect, total);
      router.replace('/results');
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  return (
    <ThemedView style={[styles.screen, { paddingTop: insets.top + Spacing.two }]}>
      {/* Header: close + progress */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
          <ThemedText style={styles.close}>✕</ThemedText>
        </Pressable>
        <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.accent,
                width: `${Math.round(((index + (answered ? 1 : 0)) / total) * 100)}%`,
              },
            ]}
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
            {question.options.map((option) => {
              const isCorrectOption = option.id === question.correctOptionId;
              const isSelectedOption = option.id === selected;

              let backgroundColor = theme.backgroundElement;
              let borderColor = 'transparent';
              if (answered) {
                if (isCorrectOption) {
                  backgroundColor = theme.success + '22';
                  borderColor = theme.success;
                } else if (isSelectedOption) {
                  backgroundColor = theme.danger + '22';
                  borderColor = theme.danger;
                }
              }

              return (
                <Pressable
                  key={option.id}
                  disabled={answered}
                  onPress={() => onSelect(option.id)}
                  style={({ pressed }) => (pressed && !answered ? styles.pressed : undefined)}>
                  <View style={[styles.option, { backgroundColor, borderColor }]}>
                    <ThemedText style={styles.optionText}>{option.text}</ThemedText>
                    {answered && isCorrectOption && (
                      <ThemedText style={[styles.mark, { color: theme.success }]}>✓</ThemedText>
                    )}
                    {answered && isSelectedOption && !isCorrectOption && (
                      <ThemedText style={[styles.mark, { color: theme.danger }]}>✕</ThemedText>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {answered && (
            <ThemedView
              style={[
                styles.explanation,
                {
                  backgroundColor:
                    (selected === question.correctOptionId ? theme.success : theme.danger) + '18',
                },
              ]}>
              <ThemedText type="smallBold">
                {selected === question.correctOptionId ? '¡Correcto!' : 'No exactamente'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {question.explanation}
              </ThemedText>
            </ThemedView>
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
