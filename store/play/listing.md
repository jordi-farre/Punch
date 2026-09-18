# Play Store listing — Punch

Copy-paste source for the Play Console store listing. Keep this in sync if the listing changes.

## Short description

_Max 80 characters. Currently 73._

```
Track prepaid session packs — coworking, gym, classes. Swipe to check in.
```

## Full description

_Max 4000 characters. Currently ~840._

```
Track the prepaid session packs you actually pay for — a 24-visit coworking pass, a 10-class gym card, a punch card at your favorite spot. Punch keeps count so you don't have to.

WHAT IT DOES
• Add a pack: a name, how many sessions it includes, an optional expiry date, and a color
• Check in two ways — tap Use a session, or swipe the pack in the list (Gmail-style: the swipe itself logs it, with an Undo right after)
• See what's expiring soon at a glance, right on the card
• Every check-in is logged, so you can review or undo a stray tap

PRIVATE BY DESIGN
No account, no sign-in, no server. Everything you enter stays on your phone — Punch has nothing to sync and nothing to sell. Full privacy policy: https://claude.ai/artifact/DUpj4dVQj2NVsA7JSHHPWH

Punch is a small, independent app built by one person to solve one problem: knowing how many sessions are actually left.
```

## Other listing fields

| Field | Value |
| --- | --- |
| App name | Punch |
| Category | Productivity (or Lifestyle / Tools — pick at listing time) |
| Contact email | jordifr@gmail.com |
| Privacy policy URL | https://claude.ai/artifact/DUpj4dVQj2NVsA7JSHHPWH (source: [`PRIVACY.md`](../../PRIVACY.md)) |
| Content rating | No content concerns — a personal tracking tool with no user-generated content shared with others |
| Data safety form | Collects: nothing. Shares: nothing. See [`PRIVACY.md`](../../PRIVACY.md) |

## Assets

- `screenshots/` — phone screenshots, 1080×1920 (9:16), PNG. **Not started.** These need to come
  from a real device or Expo Go — there's no reliable way to generate them from the web preview.
  (An earlier attempt captured the web preview via html2canvas; the images looked visibly wrong
  next to the real app — clipped text, a garbled button, misplaced elements — because html2canvas
  is a from-scratch re-implementation of layout and text rendering, not a real screenshot, and
  diverges from actual rendering in exactly the ways that showed up. `react-native-view-shot`,
  used elsewhere in this app for the pack-sharing feature, hits the same wall on web — its web
  implementation is html2canvas too; only its native iOS/Android implementation is a true capture.)
  Good shots: the pack list, a pack's detail screen with some history, the swipe-to-check-in
  reveal, and the add/edit pack form.
- [`feature-graphic.png`](feature-graphic.png) — 1024×500, PNG, no alpha channel. Generated from
  [`feature-graphic.svg`](feature-graphic.svg) (pure SVG, no screenshot involved — edit the SVG and
  re-render with `sharp` if it needs to change).
- [`icon-512.png`](icon-512.png) — 512×512, PNG, for the Play Console app icon upload slot (it
  specifically wants exactly 512×512, unlike the app's own 1024×1024
  [`assets/images/icon.png`](../../assets/images/icon.png) this was resized from)
