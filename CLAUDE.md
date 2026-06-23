# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

The import above carries the project's hard constraints (Expo SDK 54 pin, Expo Go device
previews, commit/push cadence, "not a Next.js project"). **Read [STATUS.md](STATUS.md) for the
full project state, phase roadmap, and per-file code map.** The notes below cover the commands
and architecture conventions those two files don't spell out.

## Commands

```bash
npm install            # deps (already installed)
npm start              # Expo dev server on :8081 — scan QR with Expo Go, or open localhost:8081 (web)
npm run ios            # expo start --ios
npm run web            # expo start --web
npm run lint           # expo lint (eslint-config-expo)
npx tsc --noEmit       # typecheck — must be 0 errors before committing
npx expo-doctor        # dependency/config health — expect 18/18 before committing
npm run sync-mux       # regenerate src/data/mux-library.generated.ts from your Mux account
```

There is **no test runner** in this project (no Jest/Vitest); "verify before commit" means
`tsc --noEmit` + `expo-doctor`, not a test suite. Don't invent test commands.

## Architecture

**Routing is file-based** (Expo Router). The route tree lives under `src/app/`, not a top-level
`app/`. `app.json` sets the router root to `./src/app`. Screens map to files: `(tabs)/` is the
tab group, `lesson/[id].tsx` and `quiz/[id].tsx` are dynamic routes, `results.tsx` is a modal-ish
result screen. Navigate with `expo-router` (`useRouter`, `<Link>`), not React Navigation directly.

**All game state flows through one store.** `src/store/progress-store.tsx` exposes
`ProgressProvider` (mounted in `src/app/_layout.tsx`) and the `useProgress()` hook. The single
`completeLesson()` action is the *only* place rewards are applied — it computes XP, advances the
streak, re-evaluates badges, and detects title level-ups in one transaction, then stashes a
`lastResult` for the results screen to read. **State is in-memory only** (resets on reload);
AsyncStorage persistence is Phase 4. When adding a reward or progression rule, put the pure logic
in `src/lib/gamification.ts` and wire it through `completeLesson()` — don't recompute derived
values (title, badges) in components.

**Pure rules vs. wiring.** `src/lib/gamification.ts` holds the entire reward economy as pure
functions (XP curve in the `XP` const, `titleForXp`, `advanceStreak`, `evaluateEarnedBadges`).
Tunable constants live in `src/constants/` (`titles.ts` Baby Trader→Whale, `badges.ts`,
`theme.ts`). Content is seeded from `src/data/mock-course.ts`; the data model is in `src/types/`.

**Path aliases** (`tsconfig.json`): import app code as `@/*` → `src/*` and assets as
`@/assets/*` → `assets/*`. Use these, not deep relative paths.

**Video is Mux, and the API token never ships.** Lessons stream a Mux HLS URL via `expo-video`
in `src/components/mux-video.tsx`; URL builders live in `src/lib/mux.ts`. The mapping from lesson
to video runs through `src/data/mux-library.generated.ts` — **auto-generated, don't hand-edit.**
`npm run sync-mux` (`scripts/sync-mux.mjs`) reads a Mux *Read* token from `.env.local` (gitignored,
see `.env.example`), lists ready public-playback assets, and writes that file; `playbackIdForLesson()`
matches a video to a lesson by Mux `passthrough` == lesson id (else the lesson shows a placeholder).
The token is a build-time script secret only — **never put it in `EXPO_PUBLIC_*`** or it ships in
the bundle. Only public playback ids reach the app.

**Experiments are on** (`app.json`): `reactCompiler` (the React Compiler auto-memoizes — don't add
manual `memo`/`useMemo` for perf unless profiling says so) and `typedRoutes` (route strings are
type-checked, so navigate with the generated typed hrefs).

**Platform-split files.** Web vs. native variants use Expo's extension resolution:
`foo.tsx` (native) + `foo.web.tsx` (web), e.g. `src/hooks/use-color-scheme.ts` /
`use-color-scheme.web.ts` and `src/components/animated-icon.tsx` / `animated-icon.web.tsx`.
Keep web-incompatible APIs (e.g. haptics) behind a no-op web path — see `src/lib/haptics.ts`.

**Theming.** Colors come from `src/constants/theme.ts` (light/dark + accent/success/danger/streak);
read them via `src/hooks/use-theme.ts`. The root layout wraps the app in `ThemeProvider` imported
from `@react-navigation/native` (an SDK 54 detail — see the STATUS.md "Gotchas").
