import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { PopBreathe, PulseRings, SheenButton, Sparks } from '@/components/motion';
import { Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/lib/haptics';
import { useProgress } from '@/store/progress-store';

const MINT = '#65E7C9';
const ON_MINT = '#06140F';

export default function ResultsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { lastResult } = useProgress();

  const flashOpacity = useSharedValue(lastResult?.passed ? 1 : 0);

  useEffect(() => {
    if (!lastResult) return;
    if (lastResult.passed) {
      haptics.success();
      flashOpacity.value = withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
      );
    } else {
      haptics.error();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));

  const goHome = () => {
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/');
  };

  const retry = () => {
    if (lastResult) {
      router.replace({ pathname: '/quiz/[id]', params: { id: lastResult.lessonId } });
    }
  };

  if (!lastResult) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: theme.background }]}>
        <ThemedText type="subtitle">Sin resultados</ThemedText>
      </View>
    );
  }

  const { correct, total, xpEarned, isPerfect, passed, leveledUpTo, newBadges } = lastResult;

  // ── Failed ──────────────────────────────────────────────────────────────────
  if (!passed) {
    return (
      <View style={[styles.screen, { backgroundColor: '#0C0D0F' }]}>
        <View style={[styles.content, { paddingTop: insets.top + Spacing.six }]}>
          <View style={styles.inner}>
            <Animated.View entering={ZoomIn.springify().damping(12)}>
              <ThemedText style={styles.bigEmoji}>💪</ThemedText>
            </Animated.View>
            <Animated.View entering={FadeIn.delay(150)}>
              <ThemedText style={styles.failHeadline}>¡Casi!</ThemedText>
            </Animated.View>
            <Animated.View entering={FadeIn.delay(250)}>
              <ThemedText style={styles.scoreText}>{correct} de {total} correctas</ThemedText>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(350).springify().damping(16)}
              style={styles.fullWidth}>
              <View style={styles.failCard}>
                <ThemedText style={styles.failCardTitle}>
                  Repasa y vuelve a intentarlo
                </ThemedText>
                <ThemedText style={styles.failCardBody}>
                  Vuelve a ver el vídeo y prueba otra vez. Cada intento suma — no se rompe tu racha.
                </ThemedText>
              </View>
            </Animated.View>
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
          <LinearGradient
            colors={['#7DF0D6', '#46D0B0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaMint}>
            <SheenButton onPress={retry} style={styles.ctaMintInner}>
              <ThemedText style={styles.ctaMintText}>INTENTAR DE NUEVO</ThemedText>
            </SheenButton>
          </LinearGradient>
          <SheenButton onPress={goHome} style={styles.ctaGhost}>
            <ThemedText style={styles.ctaGhostText}>Salir</ThemedText>
          </SheenButton>
        </View>
      </View>
    );
  }

  // ── Passed ──────────────────────────────────────────────────────────────────
  const headline = isPerfect ? '¡Perfecto!' : '¡Bien hecho!';

  return (
    <LinearGradient
      colors={['#7DF0D6', '#46D0B0', '#2FB89B']}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.screen}>

      {/* Ambient layer: rings + rising sparks */}
      <PulseRings />
      <Sparks />

      {/* Flash overlay */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.flashOverlay, flashStyle]}
        pointerEvents="none"
      />

      <View style={[styles.content, { paddingTop: insets.top + Spacing.five }]}>
        <View style={styles.inner}>
          <Animated.View entering={FadeIn.delay(300).duration(350)}>
            <ThemedText style={styles.xpLabel}>XP GANADO</ThemedText>
          </Animated.View>

          {/* Pop-in then breathing loop on the XP number */}
          <PopBreathe>
            <ThemedText style={styles.xpNumber}>+{xpEarned}</ThemedText>
          </PopBreathe>

          <Animated.View entering={FadeIn.delay(450).duration(350)}>
            <ThemedText style={styles.passHeadline}>{headline}</ThemedText>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(500).duration(350)}>
            <ThemedText style={styles.passScore}>{correct} de {total} correctas</ThemedText>
          </Animated.View>

          {leveledUpTo && (
            <Animated.View
              entering={FadeInDown.delay(600).springify().damping(16)}
              style={styles.fullWidth}>
              <View style={styles.passCard}>
                <ThemedText style={styles.passCardLabel}>¡Nuevo título!</ThemedText>
                <ThemedText style={styles.passCardValue}>
                  {leveledUpTo.emoji} {leveledUpTo.name}
                </ThemedText>
              </View>
            </Animated.View>
          )}

          {newBadges.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(650).springify().damping(16)}
              style={styles.fullWidth}>
              <View style={styles.passCard}>
                <ThemedText style={styles.passCardLabel}>Logro desbloqueado</ThemedText>
                {newBadges.map(badge => (
                  <View key={badge.id} style={styles.badgeRow}>
                    <ThemedText style={styles.badgeEmoji}>{badge.emoji}</ThemedText>
                    <View style={styles.flex}>
                      <ThemedText style={styles.badgeName}>{badge.name}</ThemedText>
                      <ThemedText style={styles.badgeDesc}>{badge.description}</ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
        </View>
      </View>

      {/* CONTINUAR with looping sheen */}
      <Animated.View
        entering={FadeInDown.delay(560).springify().damping(16)}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
        <SheenButton onPress={goHome} style={styles.ctaDark}>
          <ThemedText style={styles.ctaDarkText}>CONTINUAR</ThemedText>
        </SheenButton>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  flashOverlay: { backgroundColor: '#ffffff', zIndex: 10 },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  inner: { width: '100%', alignItems: 'center', gap: Spacing.three },
  // Pass
  xpLabel: {
    fontFamily: Typography.mono.semibold,
    fontSize: 12,
    letterSpacing: 2,
    color: 'rgba(6,20,15,0.55)',
    textAlign: 'center',
  },
  xpNumber: {
    fontFamily: Typography.serif.semibold,
    fontSize: 100,
    lineHeight: 90,
    letterSpacing: -4,
    color: ON_MINT,
    textAlign: 'center',
  },
  passHeadline: {
    fontFamily: Typography.serif.semiboldItalic,
    fontSize: 34,
    color: ON_MINT,
    textAlign: 'center',
  },
  passScore: {
    fontFamily: Typography.sans.semibold,
    fontSize: 15,
    color: 'rgba(6,20,15,0.68)',
    textAlign: 'center',
  },
  passCard: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(6,20,15,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6,20,15,0.12)',
    borderRadius: 20,
    padding: 16,
    gap: Spacing.two,
    alignItems: 'center',
  },
  passCardLabel: { fontFamily: Typography.sans.bold, fontSize: 14, color: ON_MINT },
  passCardValue: {
    fontFamily: Typography.sans.medium,
    fontSize: 13,
    color: 'rgba(6,20,15,0.65)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    alignSelf: 'stretch',
  },
  badgeEmoji: { fontSize: 24 },
  flex: { flex: 1 },
  badgeName: { fontFamily: Typography.sans.bold, fontSize: 14, color: ON_MINT },
  badgeDesc: {
    fontFamily: Typography.sans.regular,
    fontSize: 13,
    color: 'rgba(6,20,15,0.65)',
  },
  // Fail
  bigEmoji: { fontSize: 62, lineHeight: 72, textAlign: 'center' },
  failHeadline: {
    fontFamily: Typography.serif.semiboldItalic,
    fontSize: 38,
    color: '#F4F6F4',
    textAlign: 'center',
  },
  scoreText: {
    fontFamily: Typography.sans.semibold,
    fontSize: 15,
    color: '#9AA09C',
    textAlign: 'center',
  },
  failCard: {
    backgroundColor: '#141619',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 18,
    gap: Spacing.two,
  },
  failCardTitle: {
    fontFamily: Typography.sans.semibold,
    fontSize: 14,
    color: '#E4E8E5',
  },
  failCardBody: {
    fontFamily: Typography.sans.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#878D89',
  },
  // Shared footer
  fullWidth: { alignSelf: 'stretch' },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  ctaDark: {
    height: 58,
    borderRadius: 18,
    backgroundColor: ON_MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDarkText: {
    fontFamily: Typography.sans.bold,
    fontSize: 16,
    letterSpacing: 0.5,
    color: '#F4F6F4',
  },
  ctaMint: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  ctaMintInner: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaMintText: {
    fontFamily: Typography.sans.bold,
    fontSize: 16,
    letterSpacing: 0.5,
    color: ON_MINT,
  },
  ctaGhost: {
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaGhostText: {
    fontFamily: Typography.sans.semibold,
    fontSize: 15,
    color: '#A6ACA8',
  },
});
