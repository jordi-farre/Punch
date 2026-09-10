<p align="center">
  <img src="./assets/images/icon.png" width="96" height="96" alt="Punch icon" />
</p>

<h1 align="center">Punch</h1>

<p align="center">Track prepaid session packs — coworking, gym, classes, anything sold as a bundle of visits.</p>

## What it does

You buy a pack of sessions (a 24-visit coworking pass, a 10-class gym card, whatever). Punch keeps
track of how many are left, when the pack expires, and logs every check-in.

- **Session packs** — name, total sessions, start date (defaults to today), an optional expiry
  date, and a color.
- **Check in two ways**: tap **Use a session** on a pack's detail screen, or swipe a pack in the
  list — Gmail-style, the swipe itself completes the check-in once it passes the threshold, with
  an **Undo** snackbar right after.
- **Expiry tracking** — a pack's card and detail screen show "Expires in 12 days" / "Expired 3 days
  ago"; packs expiring within 30 days are called out visually. Setting an expiry date is a single
  dropdown with quick presets (1 week / 1 month / 3 months / 1 year, relative to the start date),
  "No expiry", or a custom date.
- **History** — every check-in is logged with a timestamp; delete a stray entry from the list.
- **Guard rails** — can't check in past zero remaining; can't lower a pack's total below the
  sessions already used.
- Local-only persistence (no account, no server) — light/dark mode, one Material 3 palette driving
  both the native components and the Tailwind utility classes.

## Getting started

```bash
npm install
npm start
```

Scan the QR code with [Expo Go](https://expo.dev/go) on your phone. `npm run web` opens it in a
browser instead (no native build tooling required for that).

## Scripts

| Command              | What it does                          |
| --------------------- | -------------------------------------- |
| `npm start`           | Start the Metro bundler / dev server   |
| `npm run web`         | Run in a browser via Expo web          |
| `npm run ios` / `android` | Run on a simulator/emulator (needs Xcode / Android Studio) |
| `npm test`            | Run the Jest test suite                |
| `npm run test:watch`  | Jest in watch mode                     |
| `npm run typecheck`   | `tsc --noEmit`                         |
| `npm run lint`        | ESLint via `expo lint`                 |

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push and pull request:

- **test** — typecheck, lint, then the Jest suite.
- **build-android** — an [EAS Build](https://docs.expo.dev/build/introduction/) of an installable
  preview APK, gated on `test` passing. Runs on pushes to `main` and manual triggers, not on every
  PR (EAS build minutes are limited on the free tier). iOS isn't wired up yet — add an equivalent
  job once there's an Apple developer account to build with.

The build job needs one-time setup before it'll pass:

1. `npx eas login` (creates a free Expo account if you don't have one), then `npx eas init` from
   the project root — this links the project on expo.dev and writes `extra.eas.projectId` into
   `app.json`.
2. Create an access token at [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)
   and add it as the `EXPO_TOKEN` secret under the repo's Settings → Secrets and variables →
   Actions.

## Tech stack

- [Expo](https://expo.dev) / [Expo Router](https://docs.expo.dev/router/introduction/) (file-based
  routing, `src/app/`)
- [React Native Paper](https://callstack.github.io/react-native-paper/) for Material Design 3
  components, laid out with [NativeWind](https://www.nativewind.dev/) (Tailwind for React Native) —
  both driven by one token file so they can't drift apart, see
  [`src/theme/tokens.js`](src/theme/tokens.js)
- [Zustand](https://zustand.docs.pmnd.rs/) for state, persisted to
  [`AsyncStorage`](https://react-native-async-storage.github.io/async-storage/) as a single JSON
  blob (see [`src/lib/storage.ts`](src/lib/storage.ts))
- [`react-native-gesture-handler`](https://docs.swmansion.com/react-native-gesture-handler/) +
  [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/) for the
  swipe-to-check-in gesture
- [Jest](https://jestjs.io/) + [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
  for tests, run via the `jest-expo` preset

## Project structure

```
src/
  app/            expo-router screens: pack list, pack detail, add/edit form
  app-tests/      tests for the screens above (kept out of src/app/ so the router
                  doesn't try to treat *.test.tsx files as routes)
  components/     PackCard, RemainingCount, AccentPicker, EmptyState, SessionRow
  lib/            pure logic: dates/expiry math, local id generation, AsyncStorage I/O, types
  store/          the zustand store (packs, sessions, check-in/undo, guard rails)
  theme/          MD3 + Tailwind tokens, the Paper theme built from them, NativeWind interop
  test-utils/     a Testing Library `render` wrapper (PaperProvider + SafeAreaProvider)
```

## Data model

Packs and session entries are stored as flat lists (not a counter on the pack), so "sessions
remaining" is always `totalSessions - count of entries for that pack`. That's what makes undo,
editing, and deleting a single history row fall out for free — see
[`src/store/usePacks.ts`](src/store/usePacks.ts).
