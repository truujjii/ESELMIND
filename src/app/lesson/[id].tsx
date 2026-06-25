import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MuxVideo } from '@/components/mux-video';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScreenIn, VideoSpinner } from '@/components/motion';
import { MaxContentWidth, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration } from '@/lib/format';
import { playbackIdForLesson } from '@/lib/mux';
import { useProgress } from '@/store/progress-store';
import { findLesson } from '@/types/content';

const MINT = '#65E7C9';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { course, isLessonCompleted } = useProgress();
  const [watched, setWatched] = useState(false);
  const [videoState, setVideoState] = useState<'idle' | 'playing' | 'ended'>('idle');

  const lesson = findLesson(course, id);

  if (!lesson) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>No encontramos esta lección.</ThemedText>
      </ThemedView>
    );
  }

  const completed = isLessonCompleted(lesson.id);
  const playbackId = lesson.muxPlaybackId ?? playbackIdForLesson(lesson.id);
  const canTakeTest = completed || !playbackId || watched;

  return (
    <ScreenIn style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.five }]}>
        <View style={styles.inner}>

          {/* ── Video player ── */}
          {playbackId ? (
            <MuxVideo
              playbackId={playbackId}
              title={lesson.title}
              accent={lesson.accent}
              onEnded={() => { setWatched(true); setVideoState('ended'); }}
            />
          ) : (
            /* Placeholder matches prototype: dark gradient + state-driven content */
            <View style={styles.player}>
              <LinearGradient
                colors={['#1A2522', '#0D1417']}
                style={StyleSheet.absoluteFill}
              />
              {/* grid texture */}
              <View style={styles.playerGrid} />

              {videoState === 'idle' && (
                <Pressable
                  onPress={() => {
                    setVideoState('playing');
                    // Simulate 2.4s video then unlock
                    setTimeout(() => {
                      setVideoState('ended');
                      setWatched(true);
                    }, 2400);
                  }}
                  style={styles.playBtn}>
                  <LinearGradient
                    colors={['#7DF0D6', '#46D0B0']}
                    style={styles.playBtnGrad}>
                    <ThemedText style={styles.playIcon}>▶</ThemedText>
                  </LinearGradient>
                </Pressable>
              )}

              {videoState === 'playing' && (
                <View style={styles.playerCenter}>
                  <VideoSpinner size={34} />
                  <ThemedText style={styles.playingLabel}>REPRODUCIENDO…</ThemedText>
                </View>
              )}

              {videoState === 'ended' && (
                <View style={styles.playerCenter}>
                  <View style={styles.doneCircle}>
                    <ThemedText style={styles.doneCheck}>✓</ThemedText>
                  </View>
                  <ThemedText style={styles.doneLabel}>VÍDEO COMPLETADO</ThemedText>
                </View>
              )}

              {/* Progress bar */}
              <View style={styles.playerBarTrack}>
                <View
                  style={[
                    styles.playerBarFill,
                    { width: videoState === 'idle' ? '0%' : '100%' },
                    videoState === 'playing' && styles.playerBarAnimating,
                  ]}
                />
              </View>
            </View>
          )}

          {/* ── Lesson body ── */}
          <View style={styles.body}>
            <ThemedText style={styles.eyebrow}>FUNDAMENTOS · {formatDuration(lesson.durationSec)}</ThemedText>
            <ThemedText style={styles.title}>{lesson.title}</ThemedText>
            <ThemedText style={styles.summary}>{lesson.summary}</ThemedText>

            {/* CTA */}
            <Pressable
              disabled={!canTakeTest}
              onPress={() => router.push({ pathname: '/quiz/[id]', params: { id: lesson.id } })}
              style={({ pressed }) => (pressed && canTakeTest ? styles.pressed : undefined)}>
              {canTakeTest ? (
                <LinearGradient
                  colors={['#7DF0D6', '#46D0B0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cta}>
                  <ThemedText style={styles.ctaTextDark}>
                    {completed ? 'Repasar test' : 'Empezar test'}
                  </ThemedText>
                </LinearGradient>
              ) : (
                <View style={[styles.cta, styles.ctaDisabled]}>
                  <ThemedText style={styles.ctaTextMuted}>Empezar test</ThemedText>
                </View>
              )}
            </Pressable>

            <ThemedText style={styles.note}>
              {canTakeTest
                ? 'Demuestra lo aprendido con preguntas.'
                : '🔒 Termina el vídeo para desbloquear el test.'}
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ScreenIn>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', justifyContent: 'center' },
  inner: { width: '100%', maxWidth: MaxContentWidth },
  // Video player
  player: {
    width: '100%',
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  playerGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  playBtn: { borderRadius: 34 },
  playBtnGrad: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#65E7C9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
  },
  playIcon: { fontSize: 24, color: '#06140F', marginLeft: 4 },
  playerCenter: { alignItems: 'center', gap: 14 },
  playingLabel: {
    fontFamily: Typography.mono.regular,
    fontSize: 12,
    letterSpacing: 1,
    color: '#9AA09C',
  },
  doneCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(101,231,201,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(101,231,201,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCheck: { fontSize: 22, color: '#65E7C9' },
  doneLabel: {
    fontFamily: Typography.mono.regular,
    fontSize: 12,
    letterSpacing: 1,
    color: '#65E7C9',
  },
  playerBarTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  playerBarFill: {
    height: '100%',
    backgroundColor: '#65E7C9',
  },
  playerBarAnimating: {},
  // Body
  body: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  eyebrow: {
    fontFamily: Typography.mono.regular,
    fontSize: 11,
    letterSpacing: 1.4,
    color: '#65E7C9',
  },
  title: {
    fontFamily: Typography.serif.semibold,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.6,
    color: '#F7F9F7',
  },
  summary: {
    fontFamily: Typography.sans.regular,
    fontSize: 15.5,
    lineHeight: 24,
    color: '#A6ACA8',
  },
  cta: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  ctaDisabled: { backgroundColor: '#16181B' },
  ctaTextDark: {
    fontFamily: Typography.sans.bold,
    fontSize: 15,
    letterSpacing: 0.5,
    color: '#06140F',
  },
  ctaTextMuted: {
    fontFamily: Typography.sans.bold,
    fontSize: 15,
    color: '#4E544F',
  },
  note: {
    fontFamily: Typography.sans.regular,
    fontSize: 13,
    color: '#71776F',
    textAlign: 'center',
  },
  pressed: { opacity: 0.8 },
});
