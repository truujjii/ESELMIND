import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AmbientGlow, FadeUp, ScreenIn } from '@/components/motion';
import { BADGES } from '@/constants/badges';
import { BottomTabInset, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { titleProgress } from '@/lib/gamification';
import { useAuth } from '@/store/auth-store';
import { useProgress } from '@/store/progress-store';

const MINT = '#65E7C9';

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { progress, title, resetProgress } = useProgress();
  const { user, signOut } = useAuth();
  const { ratio, next } = titleProgress(progress.xp);

  return (
    <ScreenIn style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.three,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
          paddingHorizontal: 22,
          gap: Spacing.three,
        }}>

        <ThemedText style={styles.pageTitle}>Perfil</ThemedText>

        {/* ── Identity card ── */}
        <FadeUp delay={0}>
          <LinearGradient
            colors={['#16221E', '#0D1316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.55, y: 1 }}
            style={styles.identityCard}>
            <AmbientGlow size={200} top={-50} left="50%" />
            <ThemedText style={styles.rankEmoji}>{title.emoji}</ThemedText>
            <ThemedText style={styles.rankName}>{title.name}</ThemedText>
            <ThemedText style={styles.rankXp}>{progress.xp.toLocaleString()} XP</ThemedText>
            <View style={styles.identityBar}>
              <LinearGradient
                colors={['#65E7C9', '#3FCBAB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.identityBarFill, { width: `${Math.round(ratio * 100)}%` }]}
              />
            </View>
            {next && (
              <ThemedText style={styles.rankNext}>
                Próximo: {next.emoji} {next.name} · {next.minXp - progress.xp} XP
              </ThemedText>
            )}
          </LinearGradient>
        </FadeUp>

        {/* ── Stat tiles ── */}
        <FadeUp delay={60}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <ThemedText style={styles.statEmoji}>🔥</ThemedText>
              <ThemedText style={styles.statValue}>{progress.currentStreak}</ThemedText>
              <ThemedText style={styles.statLabel}>Racha actual</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statEmoji}>🏆</ThemedText>
              <ThemedText style={styles.statValue}>{progress.bestStreak}</ThemedText>
              <ThemedText style={styles.statLabel}>Mejor racha</ThemedText>
            </View>
          </View>
        </FadeUp>

        {/* ── Achievements ── */}
        <FadeUp delay={100}>
          <ThemedText style={styles.sectionEyebrow}>LOGROS</ThemedText>
          <View style={styles.badgeGrid}>
            {BADGES.map(badge => {
              const earned = progress.earnedBadgeIds.includes(badge.id);
              return (
                <View
                  key={badge.id}
                  style={[styles.badgeCard, !earned && styles.badgeLocked]}>
                  <ThemedText style={styles.badgeEmoji}>
                    {earned ? badge.emoji : '🔒'}
                  </ThemedText>
                  <ThemedText style={[styles.badgeName, !earned && { color: '#7C827E' }]}>
                    {badge.name}
                  </ThemedText>
                  <ThemedText style={styles.badgeDesc}>{badge.description}</ThemedText>
                </View>
              );
            })}
          </View>
        </FadeUp>

        {/* ── Account ── */}
        <FadeUp delay={140}>
          <View style={styles.accountCard}>
            <View style={styles.accountInfo}>
              <ThemedText style={styles.accountLabel}>CUENTA</ThemedText>
              <ThemedText style={styles.accountEmail}>
                {user?.email ?? 'Sesión iniciada'}
              </ThemedText>
            </View>
            <Pressable
              onPress={signOut}
              style={({ pressed }) => [styles.signOutBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.signOutText}>Salir</ThemedText>
            </Pressable>
          </View>
        </FadeUp>

        <Pressable
          onPress={resetProgress}
          style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
          <ThemedText style={styles.resetText}>Reiniciar progreso (dev)</ThemedText>
        </Pressable>
      </ScrollView>
    </ScreenIn>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pageTitle: {
    fontFamily: Typography.serif.semibold,
    fontSize: 27,
    color: '#F4F6F4',
    marginBottom: 4,
  },
  // Identity card
  identityCard: {
    borderRadius: 26,
    padding: 26,
    borderWidth: 1,
    borderColor: 'rgba(101,231,201,0.16)',
    alignItems: 'center',
    overflow: 'hidden',
    gap: 6,
  },
  rankEmoji: { fontSize: 54, lineHeight: 62 },
  rankName: {
    fontFamily: Typography.serif.semibold,
    fontSize: 25,
    color: '#F6F8F6',
  },
  rankXp: {
    fontFamily: Typography.mono.semibold,
    fontSize: 13,
    color: MINT,
  },
  identityBar: {
    width: '100%',
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: 4,
  },
  identityBarFill: { height: '100%', borderRadius: 4 },
  rankNext: {
    fontFamily: Typography.mono.regular,
    fontSize: 12,
    color: '#8E948F',
  },
  // Stat tiles
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#101214',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: Spacing.one,
  },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: {
    fontFamily: Typography.serif.semibold,
    fontSize: 30,
    color: '#F4F6F4',
    lineHeight: 34,
  },
  statLabel: {
    fontFamily: Typography.mono.regular,
    fontSize: 11,
    color: '#8E948F',
    marginTop: 4,
  },
  // Achievements
  sectionEyebrow: {
    fontFamily: Typography.mono.regular,
    fontSize: 11,
    letterSpacing: 1.4,
    color: '#71776F',
    marginBottom: 12,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '47%',
    flexGrow: 1,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#101214',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 4,
  },
  badgeLocked: { opacity: 0.38 },
  badgeEmoji: { fontSize: 26, marginBottom: 5 },
  badgeName: {
    fontFamily: Typography.sans.semibold,
    fontSize: 14,
    color: '#E9ECE9',
  },
  badgeDesc: {
    fontFamily: Typography.sans.regular,
    fontSize: 12,
    lineHeight: 16,
    color: '#71776F',
  },
  // Account row
  accountCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#101214',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountInfo: { gap: 3 },
  accountLabel: {
    fontFamily: Typography.mono.regular,
    fontSize: 11,
    color: '#71776F',
  },
  accountEmail: {
    fontFamily: Typography.sans.regular,
    fontSize: 14.5,
    color: '#E4E8E5',
  },
  signOutBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,107,92,0.3)',
    borderRadius: 14,
    backgroundColor: 'rgba(255,107,92,0.08)',
  },
  signOutText: {
    fontFamily: Typography.sans.semibold,
    fontSize: 13,
    color: '#FF8A7D',
  },
  resetText: {
    fontFamily: Typography.sans.regular,
    fontSize: 12,
    color: '#5A605C',
    textAlign: 'center',
    textDecorationLine: 'underline',
    paddingVertical: Spacing.two,
  },
  pressed: { opacity: 0.6 },
});
