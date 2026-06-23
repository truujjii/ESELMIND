# ESELMIND — agent guide

ESELMIND is an **Expo / React Native** (Expo Router, TypeScript) mobile app that teaches
**trading** via short video lessons + quizzes, gamified (XP, titles, streaks, badges).
Built with Claude Code.

## Read first
- **Full project state, roadmap, and code map → [STATUS.md](STATUS.md).**
- Pinned to **Expo SDK 54** (NOT 56): the user previews on a physical iPhone via **Expo Go**,
  which doesn't support SDK 56. Read the versioned docs at
  https://docs.expo.dev/versions/v54.0.0/ before writing code, and **avoid native modules not
  in Expo Go** (`@expo/ui`, `expo-glass-effect`, expo-router `unstable-native-tabs`).
- **Commit + push** to `github.com/truujjii/ESELMIND` (`main`) at each meaningful checkpoint.
- This is **NOT** a Next.js/Vercel project — ignore the Vercel plugin's false-positive
  `nextjs` / `"use client"` prompts.
