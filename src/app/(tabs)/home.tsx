import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AmbientGlow, CardIn, FadeUp, LightSweep, ScreenIn, StreakBadge } from '@/components/motion';
import { BottomTabInset, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { titleProgress } from '@/lib/gamification';
import { useAuth } from '@/store/auth-store';
import { useProgress } from '@/store/progress-store';
import { lessonsInOrder } from '@/types/content';

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MINT = '#65E7C9';

function getWeekStates(
  currentStreak: number,
  lastActiveDate: string | null,
): Array<'done' | 'today' | 'future' | 'empty'> {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dow = today.getDay();
  const mondayIdx = (dow + 6) % 7;
  const doneToday = lastActiveDate === todayStr;
  return DAY_LABELS.map((_, i) => {
    if (i > mondayIdx) return 'future';
    if (i === mondayIdx) return doneToday ? 'done' : 'today';
    return mondayIdx - i < currentStreak ? 'done' : 'empty';
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { course, progress, title, isLessonCompleted } = useProgress();
  const { ratio, next } = titleProgress(progress.xp);
  const [cardW, setCardW] = useState(0);

  const displayName = user?.email?.split('@')[0] ?? 'Usuario';
  const initial = (displayName[0] ?? 'U').toUpperCase();

  const lessons = lessonsInOrder(course);
  const activeLessonIdx = lessons.findIndex((l, i) => {
    const unlocked = i === 0 || isLessonCompleted(lessons[i - 1].id);
    return unlocked && !isLessonCompleted(l.id);
  });
  const activeLesson =
    activeLessonIdx >= 0 ? lessons[activeLessonIdx] : lessons[lessons.length - 1];
  const lessonProgress = activeLessonIdx >= 0 ? activeLessonIdx / lessons.length : 1;
  const weekStates = getWeekStates(progress.currentStreak, progress.lastActiveDate);

  return (
    <ScreenIn style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.two,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
          paddingHorizontal: 22,
          gap: Spacing.three,
        }}>

        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <View style={styles.avatarRow}>
            <LinearGradient
              colors={['#7DF0D6', '#3FCBAB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}>
              <ThemedText style={styles.avatarLetter}>{initial}</ThemedText>
            </LinearGradient>
            <View>
              <ThemedText style={styles.greetingLine}>Hola,</ThemedText>
              <ThemedText style={styles.displayName}>{displayName}</ThemedText>
            </View>
          </View>
          <StreakBadge
            count={progress.currentStreak}
            onPress={() => router.push('/(tabs)/profile')}
          />
        </View>

        {/* ── Continue card ── */}
        {activeLesson && (
          <CardIn>
            <Pressable
              onPress={() =>
                router.push({ pathname: '/lesson/[id]', params: { id: activeLesson.id } })
              }
              style={({ pressed }) => [pressed && styles.pressed]}>
              <LinearGradient
                colors={['#16221E', '#0F1619']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.6, y: 1 }}
                style={styles.continueCard}
                onLayout={e => setCardW(e.nativeEvent.layout.width)}>
                <AmbientGlow size={160} top={-40} right={-30} />
                {cardW > 0 && <LightSweep width={cardW} duration={5500} delay={1200} />}

                <ThemedText style={styles.continueMeta}>CONTINÚA DONDE LO DEJASTE</ThemedText>
                <ThemedText style={styles.continueTitle}>{activeLesson.title}</ThemedText>
                <ThemedText style={styles.continueSubtitle}>
                  {Math.round(activeLesson.durationSec / 60)} min ·{' '}
                  {activeLesson.questions.length} preguntas
                </ThemedText>
                <View style={styles.continueBar}>
                  <LinearGradient
                    colors={['#65E7C9', '#3FCBAB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.continueBarFill,
                      { width: `${Math.round(lessonProgress * 100)}%` },
                    ]}
                  />
                </View>
                <View style={styles.continueFooter}>
                  <ThemedText style={styles.continueLessonNum}>
                    Lección {activeLessonIdx + 1} de {lessons.length}
                  </ThemedText>
                  <LinearGradient
                    colors={['#7DF0D6', '#46D0B0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.continueArrow}>
                    <ThemedText style={styles.continueArrowIcon}>→</ThemedText>
                  </LinearGradient>
                </View>
              </LinearGradient>
            </Pressable>
          </CardIn>
        )}

        {/* ── Weekly calendar ── */}
        <FadeUp delay={60}>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <ThemedText style={styles.cardTitle}>Tu semana</ThemedText>
              <ThemedText style={styles.streakOrange}>
                🔥 {progress.currentStreak} días
              </ThemedText>
            </View>
            <View style={styles.weekRow}>
              {weekStates.map((state, i) => {
                const isDone = state === 'done';
                const isToday = state === 'today';
                const isFuture = state === 'future';
                return (
                  <View key={i} style={styles.dayCol}>
                    <View
                      style={[
                        styles.dayDot,
                        isDone && styles.dayDotDone,
                        isToday && styles.dayDotToday,
                        isFuture && styles.dayDotFuture,
                      ]}>
                      {isDone && <ThemedText style={styles.dayCheck}>✓</ThemedText>}
                    </View>
                    <ThemedText
                      style={[
                        styles.dayLabel,
                        (isDone || isToday) && styles.dayLabelActive,
                        isFuture && styles.dayLabelFuture,
                      ]}>
                      {DAY_LABELS[i]}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          </View>
        </FadeUp>

        {/* ── Rank / XP card ── */}
        <FadeUp delay={120}>
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <View style={styles.titleLeft}>
                <ThemedText style={styles.titleEmoji}>{title.emoji}</ThemedText>
                <ThemedText style={styles.titleName}>{title.name}</ThemedText>
              </View>
              {next && (
                <View style={styles.titleRight}>
                  <ThemedText style={styles.nextTitle}>{next.name}</ThemedText>
                  <ThemedText style={styles.titleEmoji}>{next.emoji}</ThemedText>
                </View>
              )}
            </View>
            <View style={styles.xpBar}>
              <LinearGradient
                colors={['#65E7C9', '#3FCBAB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.xpBarFill, { width: `${Math.round(ratio * 100)}%` }]}
              />
            </View>
            <ThemedText style={styles.xpNote}>
              {next
                ? `${next.minXp - progress.xp} XP para ${next.emoji} ${next.name}`
                : '¡Nivel máximo alcanzado!'}
            </ThemedText>
          </View>
        </FadeUp>
      </ScrollView>
    </ScreenIn>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarLetter: {
    fontFamily: Typography.serif.semibold,
    fontSize: 20,
    color: '#06140F',
  },
  greetingLine: {
    fontFamily: Typography.sans.regular,
    fontSize: 13,
    color: '#878D89',
  },
  displayName: {
    fontFamily: Typography.serif.semibold,
    fontSize: 21,
    color: '#F4F6F4',
    lineHeight: 26,
  },
  // Continue card
  continueCard: {
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(101,231,201,0.18)',
    overflow: 'hidden',
  },
  continueMeta: {
    fontFamily: Typography.mono.semibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: '#65E7C9',
    marginBottom: 12,
  },
  continueTitle: {
    fontFamily: Typography.serif.semibold,
    fontSize: 27,
    color: '#F6F8F6',
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  continueSubtitle: {
    fontFamily: Typography.mono.regular,
    fontSize: 12,
    color: '#8E948F',
    marginBottom: 18,
  },
  continueBar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  continueBarFill: { height: '100%', borderRadius: 4 },
  continueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueLessonNum: {
    fontFamily: Typography.sans.regular,
    fontSize: 13,
    color: '#9AA09C',
  },
  continueArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#65E7C9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
  },
  continueArrowIcon: {
    fontSize: 18,
    color: '#06140F',
    fontFamily: Typography.sans.bold,
  },
  // Cards
  card: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#101214',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: Spacing.two,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: Typography.sans.semibold,
    fontSize: 14,
    color: '#E4E8E5',
  },
  streakOrange: {
    fontFamily: Typography.mono.medium,
    fontSize: 12,
    color: '#FF9D6B',
  },
  // Week tracker
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 7 },
  dayDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#16181B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotDone: { backgroundColor: MINT, borderColor: MINT },
  dayDotToday: {
    backgroundColor: 'rgba(101,231,201,0.08)',
    borderWidth: 2,
    borderColor: MINT,
  },
  dayDotFuture: { opacity: 0.4 },
  dayCheck: { fontSize: 13, color: '#06140F', fontFamily: Typography.sans.bold },
  dayLabel: { fontFamily: Typography.mono.semibold, fontSize: 11, color: '#71776F' },
  dayLabelActive: { color: MINT },
  dayLabelFuture: { color: '#5A605C' },
  // Rank card
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleRight: { flexDirection: 'row', alignItems: 'center', gap: 8, opacity: 0.5 },
  titleEmoji: { fontSize: 22 },
  titleName: {
    fontFamily: Typography.sans.semibold,
    fontSize: 15,
    color: '#E4E8E5',
  },
  nextTitle: {
    fontFamily: Typography.sans.regular,
    fontSize: 14,
    color: '#9AA09C',
  },
  xpBar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  xpBarFill: { height: '100%', borderRadius: 4 },
  xpNote: {
    fontFamily: Typography.mono.regular,
    fontSize: 12,
    color: '#8E948F',
  },
  pressed: { opacity: 0.7 },
});
