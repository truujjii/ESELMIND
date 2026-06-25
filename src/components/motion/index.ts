/**
 * ESELMIND motion kit — drop-in Reanimated components that reproduce every
 * looping / ambient animation from the HTML prototype. See INTEGRATION.md.
 *
 * Copy the whole `motion/` folder into `src/components/motion/` in the app, then:
 *   import { StreakBadge, AmbientGlow, CardIn } from '@/components/motion';
 */
export { useLoop, EASE_OUT_EXPO, EASE_BACK, EASE_STANDARD } from './use-loop';
export { AmbientGlow } from './ambient-glow';
export { LightSweep } from './light-sweep';
export { AnimatedFlame } from './animated-flame';
export { StreakBadge } from './streak-badge';
export { ScreenIn, FadeUp, CardIn } from './entrance';
export { DockGlow } from './dock-glow';
export { InkWipe } from './ink-wipe';
export { PulseRings } from './pulse-rings';
export { Sparks } from './sparks';
export { PopBreathe } from './pop-breathe';
export { SheenButton } from './sheen-button';
export { VideoSpinner } from './video-spinner';
