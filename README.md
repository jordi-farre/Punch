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
- **Expiry reminders** (optional, on by default, toggle in Settings) — a local notification when a
  pack is falling behind the pace it'd need to use every session before expiry, and a last-chance
  notification a few days out if any are still unused. See [`src/lib/reminders.ts`](src/lib/reminders.ts)
  for the exact rules.
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

- **test** — typecheck, lint, then the Jest suite. Runs on every push and pull request.
- **build-android** — an [EAS Build](https://docs.expo.dev/build/introduction/), gated on `test`
  passing. **Manual only**: trigger it from the repo's Actions tab → CI → Run workflow (branch
  `main`, pick a `profile`) when you actually want a build, e.g. cutting a release — it doesn't run
  on every push. Choose `preview` for an installable APK to test with, or `production` for the
  Play Store `.aab` (bumps the version automatically via `autoIncrement`). iOS isn't wired up yet —
  add an equivalent job once there's an Apple developer account to build with.

The build job needs one-time setup before it'll pass:

1. `npx eas login` (creates a free Expo account if you don't have one), then `npx eas init` from
   the project root — this links the project on expo.dev and writes `extra.eas.projectId` into
   `app.json`.
2. Create an access token at [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)
   and add it as the `EXPO_TOKEN` secret under the repo's Settings → Secrets and variables →
   Actions.

Each build profile in [`eas.json`](eas.json) declares an EAS
[environment](https://docs.expo.dev/eas/environment-variables/) (`development`/`preview`/`production`)
matching its name. The app has no API keys or backend URLs today, so there are no environment
variables to set — this just makes explicit what EAS would otherwise infer from the profile name.
If that changes, add variables per-environment at expo.dev (or via `eas env:create`) rather than
committing them to `eas.json` or `app.json`.

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

## Data safety

There's no account and no backend — everything lives in local `AsyncStorage`, under the key
`punch:v1`. To survive a lost or replaced phone (not live sync across devices — that would need an
account and a backend), the app relies on the OS's own device backup, which is off by default for
this specific library:

- **iOS**: `@react-native-async-storage/async-storage` excludes its own data from iCloud/Finder
  backup by default. Overridden via `ios.infoPlist.RCTAsyncStorageExcludeFromBackup: false` in
  `app.json`.
- **Android**: no such library-level opt-out exists; it just follows the app's own
  `android:allowBackup` manifest flag, which defaults to `true` and we leave that way (set
  explicitly in `app.json` for clarity). Covered by Android's own "Back up to Google Drive"
  (Settings → System → Backup).

Either only helps if the user has that OS backup setting turned on — there's no app-level control
over that, only over not blocking it.

Full privacy policy: [`PRIVACY.md`](PRIVACY.md) (source of record) — also published at
https://claude.ai/artifact/DUpj4dVQj2NVsA7JSHHPWH for the Play Store listing / App Store Connect
"privacy policy URL" field.

## Publishing

- **Android permissions**: `expo config --type introspect` should resolve to just `INTERNET`
  (from the Expo/React Native runtime itself, not anything the app does) — verify that hasn't
  grown before submitting. `android.blockedPermissions` in `app.json` strips the storage
  permissions that `expo-file-system` (a dependency of the core `expo` package, not something we
  can uninstall) declares by default; the app has no file/media features that need them.
  `expo-notifications` (for expiry reminders) similarly brings its own `POST_NOTIFICATIONS`
  permission via its native module's manifest, merged in at build time regardless of the `plugins`
  entry — `expo config --type introspect` won't show it, since that only reflects Expo's own
  permission synthesis, not native manifest merging. Check an actual build's merged manifest
  (`android/app/src/main/AndroidManifest.xml` after `expo prebuild`) if verifying the real
  permission list end to end.
- **Store listing copy**, short description (≤80 chars):
  > Track prepaid session packs — coworking, gym, classes. Swipe to check in.
- **Build and submit**: `eas build --profile production --platform android` (see the CI section
  above for the same thing via GitHub Actions), then `eas submit --platform android`. Google
  requires a closed test with 12 testers opted in for 14 continuous days before a new personal
  developer account's first app can go to production — budget for that if this account hasn't
  published before.
