import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MuxVideo } from '@/components/mux-video';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration } from '@/lib/format';
import { playbackIdForLesson } from '@/lib/mux';
import { useProgress } from '@/store/progress-store';
import { findLesson } from '@/types/content';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { course, isLessonCompleted } = useProgress();

  const lesson = findLesson(course, id);

  if (!lesson) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>No encontramos esta lección.</ThemedText>
      </ThemedView>
    );
  }

  const completed = isLessonCompleted(lesson.id);
  // A real video lands once it's synced from Mux (matched by passthrough = lesson id);
  // until then we show the colored placeholder so the screen still works.
  const playbackId = lesson.muxPlaybackId ?? playbackIdForLesson(lesson.id);

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.five }]}>
      <View style={styles.inner}>
        {playbackId ? (
          <MuxVideo playbackId={playbackId} title={lesson.title} accent={lesson.accent} />
        ) : (
          <View style={[styles.player, { backgroundColor: lesson.accent }]}>
            <ThemedText style={styles.playGlyph}>▶</ThemedText>
            <View style={styles.durationPill}>
              <ThemedText style={styles.durationText}>
                {formatDuration(lesson.durationSec)}
              </ThemedText>
            </View>
          </View>
        )}

        <View style={styles.body}>
          <ThemedText type="subtitle">{lesson.title}</ThemedText>
          <ThemedText themeColor="textSecondary">{lesson.summary}</ThemedText>

          <Pressable
            onPress={() => router.push({ pathname: '/quiz/[id]', params: { id: lesson.id } })}
            style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
            <View style={[styles.cta, { backgroundColor: theme.accent }]}>
              <ThemedText style={styles.ctaText}>
                {completed ? 'Repasar test' : 'Empezar test'}
              </ThemedText>
            </View>
          </Pressable>

          {!playbackId && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
              🎬 El vídeo se conectará a Mux en cuanto sincronicemos tu biblioteca. Por ahora puedes
              ir directo al test.
            </ThemedText>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  player: {
    width: '100%',
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: {
    color: '#ffffff',
    fontSize: 56,
    opacity: 0.95,
  },
  durationPill: {
    position: 'absolute',
    bottom: Spacing.three,
    right: Spacing.three,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cta: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
