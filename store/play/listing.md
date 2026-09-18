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

- [`screenshots/`](screenshots/) — real phone screenshots (Expo Go, ~1344×2700, PNG, no alpha):
  - [`01-list.png`](screenshots/01-list.png) — the pack list
  - [`02-detail.png`](screenshots/02-detail.png) — a pack's detail screen with history
  - [`03-add-pack.png`](screenshots/03-add-pack.png) — the add/edit pack form
  - [`04-empty.png`](screenshots/04-empty.png) — the empty state
  - **Missing**: the swipe-to-check-in reveal — add as `05-swipe.png` if you grab one later.
    (These replace an earlier html2canvas-based attempt: that method re-implements layout and text
    rendering from scratch rather than taking a real screenshot, and it showed — clipped text, a
    garbled button, broken flex-wrap. Not worth fighting; a real device is the only reliable path,
    which is what these are.)
- [`feature-graphic.png`](feature-graphic.png) — 1024×500, PNG, no alpha channel. Generated from
  [`feature-graphic.svg`](feature-graphic.svg) (pure SVG, no screenshot involved — edit the SVG and
  re-render with `sharp` if it needs to change).
- [`icon-512.png`](icon-512.png) — 512×512, PNG, for the Play Console app icon upload slot (it
  specifically wants exactly 512×512, unlike the app's own 1024×1024
  [`assets/images/icon.png`](../../assets/images/icon.png) this was resized from)
