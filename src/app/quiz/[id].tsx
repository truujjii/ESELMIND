import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
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
import { ScreenIn } from '@/components/motion';
import { MaxContentWidth, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/lib/haptics';
import { useProgress } from '@/store/progress-store';
import { findLesson } from '@/types/content';

const MINT = '#65E7C9';

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

  const total = lesson ? lesson.questions.length : 0;
  const answered = selected !== null;

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(
      total ? (index + (answered ? 1 : 0)) / total : 0,
      { duration: 450 },
    );
  }, [index, answered, total, progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

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
      setCorrectCount(c => c + 1);
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
    setIndex(i => i + 1);
    setSelected(null);
  }

  return (
    <ScreenIn style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* ── Header: close + progress bar + counter ── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.closeGlyph}>✕</ThemedText>
        </Pressable>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              progressStyle,
            ]}>
            <LinearGradient
              colors={['#65E7C9', '#3FCBAB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <ThemedText style={styles.counter}>{index + 1}/{total}</ThemedText>
      </View>

      {/* ── Body ── */}
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.inner}>
          <ThemedText style={styles.eyebrow}>PREGUNTA {index + 1}</ThemedText>
          <ThemedText style={styles.prompt}>{question.prompt}</ThemedText>

          <View style={styles.options}>
            {question.options.map(option => (
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
              <View
                style={[
                  styles.explanation,
                  {
                    backgroundColor: gotItRight
                      ? 'rgba(101,231,201,0.10)'
                      : 'rgba(255,107,92,0.10)',
                    borderColor: gotItRight
                      ? 'rgba(101,231,201,0.32)'
                      : 'rgba(255,107,92,0.30)',
                  },
                ]}>
                <ThemedText
                  style={[
                    styles.explTitle,
                    { color: gotItRight ? MINT : '#FF8A7D' },
                  ]}>
                  {gotItRight ? 'Correcto' : 'Incorrecto'}
                </ThemedText>
                <ThemedText style={styles.explBody}>{question.explanation}</ThemedText>
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* ── Footer CTA ── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
        <Pressable
          disabled={!answered}
          onPress={onNext}
          style={({ pressed }) => (pressed && answered ? styles.pressed : undefined)}>
          {answered ? (
            <LinearGradient
              colors={['#7DF0D6', '#46D0B0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cta}>
              <ThemedText style={styles.ctaTextDark}>
                {isLast ? 'Ver resultados' : 'Siguiente'}
              </ThemedText>
            </LinearGradient>
          ) : (
            <View style={[styles.cta, styles.ctaDisabled]}>
              <ThemedText style={styles.ctaTextMuted}>
                {isLast ? 'Ver resultados' : 'Siguiente'}
              </ThemedText>
            </View>
          )}
        </Pressable>
      </View>
    </ScreenIn>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: 22,
    paddingBottom: Spacing.three,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#141518',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  closeGlyph: { fontSize: 15, color: '#E4E8E5' },
  progressTrack: {
    flex: 1,
    height: 7,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  counter: {
    fontFamily: Typography.mono.medium,
    fontSize: 13,
    color: '#8E948F',
    flexShrink: 0,
  },
  // Body
  body: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  eyebrow: {
    fontFamily: Typography.mono.regular,
    fontSize: 12,
    letterSpacing: 1.4,
    color: '#65E7C9',
  },
  prompt: {
    fontFamily: Typography.sans.bold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
    color: '#F4F6F4',
  },
  options: { gap: Spacing.two },
  explanation: {
    padding: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
    gap: Spacing.one,
  },
  explTitle: {
    fontFamily: Typography.sans.bold,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  explBody: {
    fontFamily: Typography.sans.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#C2C8C4',
  },
  // Footer
  footer: {
    paddingHorizontal: 22,
    paddingTop: Spacing.two,
  },
  cta: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ctaDisabled: { backgroundColor: '#16181B' },
  ctaTextDark: {
    fontFamily: Typography.sans.bold,
    fontSize: 16,
    letterSpacing: 0.5,
    color: '#06140F',
  },
  ctaTextMuted: {
    fontFamily: Typography.sans.bold,
    fontSize: 16,
    color: '#4E544F',
  },
  pressed: { opacity: 0.75 },
});
