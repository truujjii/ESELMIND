import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AmbientGlow, FadeUp, LightSweep, ScreenIn, StreakBadge } from '@/components/motion';
import { BottomTabInset, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { titleProgress } from '@/lib/gamification';
import { formatDuration } from '@/lib/format';
import { useProgress } from '@/store/progress-store';
import { lessonsInOrder } from '@/types/content';

const MINT = '#65E7C9';

export default function LearnScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { course, progress, title, isLessonCompleted } = useProgress();
  const { ratio, next } = titleProgress(progress.xp);
  const [rankCardW, setRankCardW] = useState(0);

  const lessons = lessonsInOrder(course);

  return (
    <ScreenIn style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.two,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
          paddingHorizontal: 22,
          gap: Spacing.three,
        }}>

        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <ThemedText style={styles.courseEyebrow}>CURSO</ThemedText>
            <ThemedText style={styles.courseTitle}>{course.title}</ThemedText>
          </View>
          <StreakBadge
            count={progress.currentStreak}
            onPress={() => router.push('/(tabs)/profile')}
          />
        </View>

        {/* ── Rank hero card ── */}
        <FadeUp delay={0}>
          <LinearGradient
            colors={['#16221E', '#0D1316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.55, y: 1 }}
            style={styles.rankCard}
            onLayout={e => setRankCardW(e.nativeEvent.layout.width)}>
            <AmbientGlow size={180} top={-50} right={-30} />
            {rankCardW > 0 && <LightSweep width={rankCardW} duration={6500} delay={1000} />}

            <View style={styles.rankHeader}>
              <ThemedText style={styles.rankLabel}>
                {title.emoji} {title.name.toUpperCase()}
              </ThemedText>
              <ThemedText style={styles.levelLabel}>NIVEL {progress.xp > 0 ? Math.floor(progress.xp / 500) + 1 : 1}</ThemedText>
            </View>
            <View style={styles.xpRow}>
              <ThemedText style={styles.xpBig}>
                {progress.xp.toLocaleString()}
              </ThemedText>
              <ThemedText style={styles.xpUnit}>XP</ThemedText>
            </View>
            <View style={styles.rankBar}>
              <LinearGradient
                colors={['#65E7C9', '#3FCBAB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.rankBarFill, { width: `${Math.round(ratio * 100)}%` }]}
              />
            </View>
            <ThemedText style={styles.rankNote}>
              {next
                ? `${next.minXp - progress.xp} XP para ${next.emoji} ${next.name}`
                : '¡Nivel máximo!'}
            </ThemedText>
          </LinearGradient>
        </FadeUp>

        {/* ── Lesson timeline ── */}
        <ThemedText style={styles.pathEyebrow}>RUTA DE APRENDIZAJE</ThemedText>

        <View style={styles.path}>
          {lessons.map((lesson, i) => {
            const completed = isLessonCompleted(lesson.id);
            const unlocked = i === 0 || isLessonCompleted(lessons[i - 1].id);
            const isActive = unlocked && !completed;
            const isLast = i === lessons.length - 1;

            const status: 'done' | 'active' | 'locked' = completed
              ? 'done'
              : isActive
              ? 'active'
              : 'locked';

            return (
              <FadeUp key={lesson.id} delay={i * 40}>
                <View style={styles.lessonRow}>
                  {/* Connector line to next item */}
                  {!isLast && (
                    <View
                      style={[
                        styles.connector,
                        {
                          backgroundColor:
                            completed
                              ? 'rgba(101,231,201,0.40)'
                              : 'rgba(255,255,255,0.08)',
                        },
                      ]}
                    />
                  )}

                  {/* Badge */}
                  <View
                    style={[
                      styles.badge,
                      status === 'done' && styles.badgeDone,
                      status === 'active' && styles.badgeActive,
                      status === 'locked' && styles.badgeLocked,
                    ]}>
                    <ThemedText style={[
                      styles.badgeGlyph,
                      status === 'done' && { color: '#06140F' },
                      status === 'active' && { color: MINT },
                      status === 'locked' && { color: '#4E544F' },
                    ]}>
                      {completed ? '✓' : isActive ? '▶' : '🔒'}
                    </ThemedText>
                  </View>

                  {/* Card */}
                  <Pressable
                    disabled={!unlocked}
                    onPress={() =>
                      router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })
                    }
                    style={({ pressed }) => [
                      styles.lessonCard,
                      status === 'done' && styles.lessonCardDone,
                      status === 'active' && styles.lessonCardActive,
                      status === 'locked' && styles.lessonCardLocked,
                      pressed && unlocked && styles.pressed,
                    ]}>
                    <ThemedText
                      style={[
                        styles.lessonTitle,
                        status === 'locked' && { color: '#7C827E' },
                        status === 'active' && { color: '#F4F6F4' },
                      ]}>
                      {lesson.title}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.lessonMeta,
                        status === 'locked' && { color: '#5A605C' },
                      ]}>
                      {formatDuration(lesson.durationSec)} · {lesson.questions.length} preguntas
                    </ThemedText>
                  </Pressable>
                </View>
              </FadeUp>
            );
          })}
        </View>
      </ScrollView>
    </ScreenIn>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  courseEyebrow: {
    fontFamily: Typography.mono.regular,
    fontSize: 11,
    letterSpacing: 1.4,
    color: '#71776F',
    marginBottom: 4,
  },
  courseTitle: {
    fontFamily: Typography.serif.semibold,
    fontSize: 23,
    color: '#F4F6F4',
    lineHeight: 28,
  },
  // Rank card
  rankCard: {
    borderRadius: 26,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(101,231,201,0.16)',
    overflow: 'hidden',
    gap: 0,
  },
  rankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  rankLabel: {
    fontFamily: Typography.mono.semibold,
    fontSize: 13,
    letterSpacing: 1.2,
    color: MINT,
  },
  levelLabel: {
    fontFamily: Typography.mono.regular,
    fontSize: 11,
    letterSpacing: 1,
    color: '#71776F',
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 18,
  },
  xpBig: {
    fontFamily: Typography.serif.semibold,
    fontSize: 60,
    lineHeight: 54,
    letterSpacing: -1.8,
    color: '#F7F9F7',
  },
  xpUnit: {
    fontFamily: Typography.mono.regular,
    fontSize: 15,
    color: '#8E948F',
    marginBottom: 4,
  },
  rankBar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 11,
  },
  rankBarFill: { height: '100%', borderRadius: 4 },
  rankNote: {
    fontFamily: Typography.mono.regular,
    fontSize: 12,
    color: '#8E948F',
  },
  // Timeline
  pathEyebrow: {
    fontFamily: Typography.mono.regular,
    fontSize: 11,
    letterSpacing: 1.4,
    color: '#71776F',
    marginTop: 4,
  },
  path: { gap: 14 },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    position: 'relative',
  },
  // Vertical line connecting badges
  connector: {
    position: 'absolute',
    left: 22,
    top: 46,
    bottom: -14,
    width: 2,
    borderRadius: 2,
    zIndex: 0,
  },
  // Badges
  badge: {
    zIndex: 1,
    flexShrink: 0,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDone: {
    backgroundColor: MINT,
    shadowColor: MINT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  badgeActive: {
    backgroundColor: 'rgba(101,231,201,0.12)',
    borderWidth: 2,
    borderColor: MINT,
    shadowColor: MINT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
  },
  badgeLocked: {
    backgroundColor: '#161719',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  badgeGlyph: { fontSize: 17, fontFamily: Typography.sans.bold },
  // Lesson cards
  lessonCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    zIndex: 1,
  },
  lessonCardDone: {
    backgroundColor: '#121316',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  lessonCardActive: {
    backgroundColor: '#16211E',
    borderWidth: 1,
    borderColor: 'rgba(101,231,201,0.22)',
  },
  lessonCardLocked: {
    backgroundColor: '#0F1012',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    opacity: 0.75,
  },
  lessonTitle: {
    fontFamily: Typography.sans.semibold,
    fontSize: 15.5,
    color: '#E4E8E5',
    marginBottom: 5,
  },
  lessonMeta: {
    fontFamily: Typography.mono.regular,
    fontSize: 12,
    color: '#9AA09C',
  },
  pressed: { opacity: 0.7 },
});
