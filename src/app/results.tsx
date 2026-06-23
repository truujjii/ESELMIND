import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Confetti } from '@/components/confetti';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/lib/haptics';
import { useProgress } from '@/store/progress-store';

export default function ResultsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { lastResult } = useProgress();

  useEffect(() => {
    if (lastResult) haptics.success();
  }, [lastResult]);

  const goHome = () => {
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/');
  };

  if (!lastResult) {
    return (
      <ThemedView style={[styles.screen, styles.center]}>
        <ThemedText type="subtitle">Sin resultados</ThemedText>
        <Pressable onPress={goHome}>
          <ThemedText type="linkPrimary">Volver a aprender</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const { correct, total, xpEarned, isPerfect, leveledUpTo, newBadges } = lastResult;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = pct >= 60;
  const headline = isPerfect ? '¡Perfecto!' : passed ? '¡Bien hecho!' : '¡Sigue así!';
  const emoji = isPerfect ? '🏆' : passed ? '🎉' : '💪';

  return (
    <ThemedView style={styles.screen}>
      {passed && <Confetti />}

      <View style={[styles.content, { paddingTop: insets.top + Spacing.six }]}>
        <View style={styles.inner}>
          <Animated.View entering={ZoomIn.springify().damping(12)}>
            <ThemedText style={styles.bigEmoji}>{emoji}</ThemedText>
          </Animated.View>
          <Animated.View entering={FadeIn.delay(150)}>
            <ThemedText type="title" style={styles.headline}>
              {headline}
            </ThemedText>
          </Animated.View>
          <Animated.View entering={FadeIn.delay(250)}>
            <ThemedText type="subtitle" themeColor="textSecondary">
              {correct}/{total} correctas
            </ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(350).springify().damping(16)}>
            <ThemedView style={[styles.xpPill, { backgroundColor: theme.accent + '22' }]}>
              <ThemedText type="smallBold" themeColor="accent">
                +{xpEarned} XP
              </ThemedText>
            </ThemedView>
          </Animated.View>

          {leveledUpTo && (
            <Animated.View
              entering={FadeInDown.delay(500).springify().damping(16)}
              style={styles.fullWidth}>
              <ThemedView type="backgroundElement" style={styles.card}>
                <ThemedText type="smallBold" themeColor="streak">
                  ¡Nuevo título desbloqueado!
                </ThemedText>
                <ThemedText type="subtitle">
                  {leveledUpTo.emoji} {leveledUpTo.name}
                </ThemedText>
              </ThemedView>
            </Animated.View>
          )}

          {newBadges.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(650).springify().damping(16)}
              style={styles.fullWidth}>
              <ThemedView type="backgroundElement" style={styles.card}>
                <ThemedText type="smallBold">Logros conseguidos</ThemedText>
                {newBadges.map((badge) => (
                  <View key={badge.id} style={styles.badgeRow}>
                    <ThemedText style={styles.badgeEmoji}>{badge.emoji}</ThemedText>
                    <View style={styles.flex}>
                      <ThemedText type="smallBold">{badge.name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {badge.description}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </ThemedView>
            </Animated.View>
          )}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
        <Pressable onPress={goHome} style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
          <View style={[styles.cta, { backgroundColor: theme.accent }]}>
            <ThemedText style={styles.ctaText}>Continuar</ThemedText>
          </View>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignItems: 'center',
    gap: Spacing.three,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  bigEmoji: {
    fontSize: 80,
    lineHeight: 96,
    textAlign: 'center',
  },
  headline: {
    textAlign: 'center',
  },
  xpPill: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  card: {
    alignSelf: 'stretch',
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.two,
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    alignSelf: 'stretch',
  },
  badgeEmoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  flex: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  cta: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: 'center',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
