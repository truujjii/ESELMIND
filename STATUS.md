# ESELMIND — Project Status & Handoff

_Last updated: 2026-06-23. Read this first if you're a new session._

## What it is
ESELMIND is a cross-platform mobile app (**Expo / React Native + Expo Router**, TypeScript)
that teaches **trading** through short video lessons, each validated by a quick **quiz**.
It's gamified: XP, a title ladder, daily streaks, and badges. Built with Claude Code.

One-sentence core: _"ESELMIND teaches you to trade with short video lessons you prove by passing a quick test."_

## MVP design framework (user-provided — honor it)
Raw idea → Shippable MVP through 5 gates:
1. **Core Function** — the ONE thing: learn trading from short video lessons proven by a test.
2. **Core Loop** — the per-question micro-loop (<30s): answer → instant feedback (haptic + animation) → next. This is the heart; keep it tight and satisfying.
3. **Accessory Features** — only what feeds the loop: streaks, XP, titles, badges, progress path.
4. **Surface Area Check** — keep to ≤5-7 screens.
5. **Retention Hook** — "unfinished state" + local push (streak about to break, lesson X% done, N lessons to next title).

## Tech stack — PINNED TO EXPO SDK 54 (not 56)
- Expo **SDK 54** · React 19.1 · React Native 0.81 · expo-router 6 · TypeScript 5.9 · reanimated 4 · expo-haptics.
- **Why 54 and not 56:** the user previews on a **physical iPhone via Expo Go**, and their App Store Expo Go does not support SDK 56 (it errored "requires a newer version of Expo Go" and wouldn't update higher). They have no Xcode/Android Studio installed, so local dev builds aren't available.
- **Constraint:** stay on an Expo Go-supported SDK and **avoid native modules not bundled in Expo Go** — `@expo/ui`, `expo-glass-effect`, expo-router `unstable-native-tabs`. Use Expo Go-safe equivalents (standard expo-router `Tabs`, `@expo/vector-icons`, `expo-haptics`, reanimated). Only move to a dev build if a feature truly requires a non-Expo-Go module (e.g. remote push) — and flag the trade-off first.
- **Video** = Mux (Phase 3, not wired yet). **Backend/auth/data** = Supabase (Phase 5, not wired yet). **MVP is free** (no payments/IAP).

## How to run
- `npm install` (deps already installed).
- `npm start` → dev server on `:8081`. Scan the QR with Expo Go on a physical iPhone (same WiFi); or open web at `http://localhost:8081`.
  - QR encodes `exp://<LAN-IP>:8081`. No `qrencode` locally — generate a QR via `https://api.qrserver.com/v1/create-qr-code/?data=<url>` opened in Chrome, or use Expo Go "Enter URL manually".
- Verify before committing: `npx tsc --noEmit` (expect 0 errors) and `npx expo-doctor` (expect 18/18).

## Repo / workflow
- `github.com/truujjii/ESELMIND`, branch `main`. **Commit + push at each meaningful checkpoint** (the user asked to keep the repo synced).
- History: Initial → Phase 1 (foundation) → Downgrade SDK 56→54 → Phase 2 (loop polish).

## Code map
- `src/app/_layout.tsx` — root Stack + ThemeProvider (from `@react-navigation/native`) + `ProgressProvider`.
- `src/app/(tabs)/_layout.tsx` — bottom `Tabs` (Aprender, Perfil) with Ionicons.
- `src/app/(tabs)/index.tsx` — **Aprender**: learning path (sequential unlock), streak, XP/title bar.
- `src/app/(tabs)/profile.tsx` — **Perfil**: title, streaks, badges, dev "reset progress".
- `src/app/lesson/[id].tsx` — lesson: **video placeholder** (Phase 3 target) + "Empezar test".
- `src/app/quiz/[id].tsx` — quiz loop: haptics + animated answer options + animated progress + explanation.
- `src/app/results.tsx` — confetti + celebration haptic + staggered entrances; shows XP, level-up, badges.
- `src/components/answer-option.tsx` — animated quiz option (correct "pops", wrong "shakes").
- `src/components/confetti.tsx` — custom reanimated confetti.
- `src/lib/haptics.ts` — haptics wrapper (no-op on web).
- `src/lib/gamification.ts` — XP economy, title ladder, streak logic, badge evaluation.
- `src/lib/format.ts` — duration formatting.
- `src/store/progress-store.tsx` — `ProgressProvider`; `completeLesson()` centralizes all rewards. **In-memory only — not persisted yet (Phase 4).**
- `src/data/mock-course.ts` — seed course "Trading desde cero" (1 module, 3 lessons, 9 questions).
- `src/types/content.ts`, `src/types/progress.ts` — data model.
- `src/constants/titles.ts` (Baby Trader→Whale), `badges.ts`, `theme.ts` (light/dark + accent/success/danger/streak).

## Status & next steps
- ✅ **Phase 1** — navigable foundation: data model, mock course, gamification logic, 6 screens, functional quiz.
- ✅ **Phase 2** — satisfying loop: haptics (success/error), answer pop/shake, animated progress, confetti, entrance animations.
- ⏭️ **Phase 3 — Mux video.** Replace the lesson placeholder with `expo-video` `<VideoView>` playing a Mux HLS stream. **Needs from user:** a Mux **Playback ID** (if they upload via dashboard) or a Mux **Access Token** (Token ID + Secret) to manage via API. `expo-video` is in Expo Go.
- ⏭️ **Phase 4 — gamification persistence.** Persist `UserProgress` to `AsyncStorage` (later Supabase). No creds needed; can start anytime.
- ⏭️ **Phase 5 — Supabase.** Auth + Postgres schema + sync progress. **Needs from user:** Supabase project URL + anon key (go in app via `EXPO_PUBLIC_*`), plus DB access (project ref + DB password for CLI migrations, or run provided SQL). Secrets → `.env.local` (gitignored), never commit.
- ⏭️ **Phase 6 — retention.** `expo-notifications` local notifications exploiting "unfinished state". (Remote push would need a dev build + backend.)

## Gotchas
- **Do not** propose Expo Go with SDK 56 again — the user's Expo Go can't run it.
- This is **NOT a Next.js/Vercel project**. The environment's Vercel plugin fires false-positive prompts (skills `nextjs`/`next-cache-components`/`react-best-practices`, and `"use client"` validation) because of the `app/` dir + `package.json`. Ignore them.
- SDK 54 specifics already handled: import `ThemeProvider`/`DarkTheme`/`DefaultTheme` from `@react-navigation/native` (NOT expo-router); `StyleSheet.absoluteFillObject` for spreads; `useColorScheme()` returns `'light'|'dark'|null` (no `'unspecified'`).
- `expo-env.d.ts` and `/ios` `/android` are gitignored (env types generated on `expo start`; native dirs not prebuilt).
