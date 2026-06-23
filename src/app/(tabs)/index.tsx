import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { titleProgress } from '@/lib/gamification';
import { formatDuration } from '@/lib/format';
import { useProgress } from '@/store/progress-store';
import { lessonsInOrder } from '@/types/content';

export default function LearnScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { course, progress, title, isLessonCompleted } = useProgress();

  const lessons = lessonsInOrder(course);
  const { ratio, next } = titleProgress(progress.xp);

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.three,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
        },
      ]}>
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <ThemedText type="small" themeColor="textSecondary">
              {course.title}
            </ThemedText>
            <ThemedText type="subtitle">Aprender</ThemedText>
          </View>
          <ThemedView type="backgroundElement" style={styles.streakChip}>
            <ThemedText type="smallBold" themeColor="streak">
              🔥 {progress.currentStreak}
            </ThemedText>
          </ThemedView>
        </View>

        <ThemedView type="backgroundElement" style={styles.xpCard}>
          <View style={styles.spaceBetween}>
            <ThemedText type="smallBold">
              {title.emoji} {title.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {progress.xp} XP
            </ThemedText>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.accent, width: `${Math.round(ratio * 100)}%` },
              ]}
            />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {next
              ? `${next.minXp - progress.xp} XP para ${next.emoji} ${next.name}`
              : '¡Nivel máximo alcanzado!'}
          </ThemedText>
        </ThemedView>

        <View style={styles.path}>
          {lessons.map((lesson, i) => {
            const completed = isLessonCompleted(lesson.id);
            const unlocked = i === 0 || isLessonCompleted(lessons[i - 1].id);
            const glyph = completed ? '✓' : unlocked ? '▶' : '🔒';
            const badgeColor = completed
              ? theme.success
              : unlocked
                ? lesson.accent
                : theme.backgroundSelected;

            return (
              <Pressable
                key={lesson.id}
                disabled={!unlocked}
                onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })}
                style={({ pressed }) => (pressed && unlocked ? styles.pressed : undefined)}>
                <ThemedView
                  type="backgroundElement"
                  style={[styles.lessonRow, !unlocked && styles.locked]}>
                  <View style={[styles.lessonBadge, { backgroundColor: badgeColor }]}>
                    <ThemedText style={styles.lessonBadgeText}>{glyph}</ThemedText>
                  </View>
                  <View style={styles.flex}>
                    <ThemedText type="smallBold" themeColor={unlocked ? 'text' : 'textSecondary'}>
                      {lesson.title}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatDuration(lesson.durationSec)} · {lesson.questions.length} preguntas
                    </ThemedText>
                  </View>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  flex: { flex: 1 },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.three,
  },
  streakChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  xpCard: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  path: {
    gap: Spacing.two,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.four,
  },
  locked: {
    opacity: 0.55,
  },
  lessonBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonBadgeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
