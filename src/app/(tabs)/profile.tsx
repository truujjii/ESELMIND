import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BADGES } from '@/constants/badges';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { titleProgress } from '@/lib/gamification';
import { useAuth } from '@/store/auth-store';
import { useProgress } from '@/store/progress-store';

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { progress, title, resetProgress } = useProgress();
  const { user, signIn, signOut, signingIn } = useAuth();
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

        <ThemedView type="backgroundElement" style={styles.accountCard}>
          {user ? (
            <>
              <ThemedText type="smallBold">Cuenta</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {user.email ?? 'Sesión iniciada'}
              </ThemedText>
              <Pressable
                onPress={signOut}
                style={({ pressed }) => [
                  styles.authBtnOutline,
                  { borderColor: theme.backgroundSelected },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold">Cerrar sesión</ThemedText>
              </Pressable>
            </>
          ) : (
            <>
              <ThemedText type="smallBold">Guarda tu progreso</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Inicia sesión para sincronizarlo entre dispositivos. Tu avance actual se
                conserva al entrar.
              </ThemedText>
              <Pressable
                disabled={signingIn}
                onPress={() => signIn('google')}
                style={({ pressed }) => [
                  styles.authBtn,
                  { backgroundColor: theme.accent },
                  (pressed || signingIn) && styles.pressed,
                ]}>
                {signingIn ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <ThemedText type="smallBold" style={styles.authBtnText}>
                    Continuar con Google
                  </ThemedText>
                )}
              </Pressable>
              <Pressable
                disabled={signingIn}
                onPress={() => signIn('apple')}
                style={({ pressed }) => [
                  styles.authBtnOutline,
                  { borderColor: theme.backgroundSelected },
                  (pressed || signingIn) && styles.pressed,
                ]}>
                <ThemedText type="smallBold">Continuar con Apple</ThemedText>
              </Pressable>
            </>
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
  accountCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  authBtn: {
    height: 48,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  authBtnText: {
    color: '#ffffff',
  },
  authBtnOutline: {
    height: 48,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
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
