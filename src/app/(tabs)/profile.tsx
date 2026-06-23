import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BADGES } from '@/constants/badges';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { titleProgress } from '@/lib/gamification';
import { useProgress } from '@/store/progress-store';

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { progress, title, resetProgress } = useProgress();
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
        <ThemedText type="subtitle">Perfil</ThemedText>

        <ThemedView type="backgroundElement" style={styles.titleCard}>
          <ThemedText style={styles.titleEmoji}>{title.emoji}</ThemedText>
          <ThemedText type="title" style={styles.titleName}>
            {title.name}
          </ThemedText>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {progress.xp} XP
          </ThemedText>
          <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.accent, width: `${Math.round(ratio * 100)}%` },
              ]}
            />
          </View>
          {next && (
            <ThemedText type="small" themeColor="textSecondary">
              Próximo: {next.emoji} {next.name}
            </ThemedText>
          )}
        </ThemedView>

        <View style={styles.statsRow}>
          <ThemedView type="backgroundElement" style={styles.statCard}>
            <ThemedText type="title" themeColor="streak" style={styles.statValue}>
              {progress.currentStreak}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              🔥 Racha actual
            </ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.statCard}>
            <ThemedText type="title" style={styles.statValue}>
              {progress.bestStreak}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              🏅 Mejor racha
            </ThemedText>
          </ThemedView>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Logros</ThemedText>
          <View style={styles.badgeGrid}>
            {BADGES.map((badge) => {
              const earned = progress.earnedBadgeIds.includes(badge.id);
              return (
                <ThemedView
                  key={badge.id}
                  type="backgroundElement"
                  style={[styles.badgeCard, !earned && styles.badgeLocked]}>
                  <ThemedText style={styles.badgeEmoji}>{earned ? badge.emoji : '🔒'}</ThemedText>
                  <ThemedText type="smallBold" style={styles.badgeName}>
                    {badge.name}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.badgeDesc}>
                    {badge.description}
                  </ThemedText>
                </ThemedView>
              );
            })}
          </View>
        </View>

        <Pressable onPress={resetProgress} style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.reset}>
            Reiniciar progreso (dev)
          </ThemedText>
        </Pressable>
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
  titleCard: {
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  titleEmoji: {
    fontSize: 64,
    lineHeight: 76,
  },
  titleName: {
    textAlign: 'center',
  },
  progressTrack: {
    height: 10,
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: Spacing.one,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 36,
    lineHeight: 42,
  },
  section: {
    gap: Spacing.two,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  badgeCard: {
    width: '47%',
    flexGrow: 1,
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.one,
  },
  badgeLocked: {
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  badgeName: {},
  badgeDesc: {},
  reset: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.6,
  },
});
