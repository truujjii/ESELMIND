import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Thin haptics wrapper. No-ops on web (no haptics there) and swallows any
 * platform rejection so feedback never throws into the UI. This is a big part
 * of what makes the quiz loop feel satisfying, so it's called on every answer.
 */
const enabled = Platform.OS !== 'web';

export const haptics = {
  success: () => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  error: () => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },
  light: () => {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  selection: () => {
    if (enabled) Haptics.selectionAsync().catch(() => {});
  },
};
