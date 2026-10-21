# Play Store listing — Punch

Copy-paste source for the Play Console store listing. Keep this in sync if the listing changes.

## App name (store title)

_Max 30 characters. Currently 30._ Only the store title; the home-screen name stays "Punch".
Plain "Punch" competes with boxing apps and work time clocks ("punch in"), so the title also
carries the words people actually search for.

```
Punch: Class Pass & Punch Card
```

## Short description

_Max 80 characters. Currently 74._

```
Punch card tracker for gym, class and coworking passes. Swipe to check in.
```

## Full description

_Max 4000 characters. Currently ~1730._

```
Punch is a simple punch card tracker for the prepaid passes you actually pay for: a 10-class yoga card, a gym pass, a pilates or climbing bundle, a 24-visit coworking pass, a punch card at your favorite café. Punch counts every visit so you always know how many sessions are left, and reminds you before a pass expires with classes unused.

WHAT IT DOES
• Add a pass in seconds: a name, how many sessions or visits it includes, an optional expiry date, and a color
• Check in two ways: tap Use a session, or swipe the pass in the list (Gmail-style, with an Undo right after)
• See sessions left and days to expiry at a glance, right on each card
• Every check-in is logged with its date, so you can review your visit history or remove a stray tap
• Expiry reminders let you know if a pass looks likely to expire with sessions unused, so you don't pay for classes you never take
• Archive finished passes to keep your list clean
• Back up your passes and visit history to a file, and restore them on a new phone
• Light and dark theme

WORKS FOR ANY PREPAID PASS
Gym visits, fitness classes, yoga, pilates, spinning, CrossFit, climbing, swimming, dance or martial arts classes, personal training sessions, coworking day passes, car wash or coffee punch cards, tutoring, physio or massage bundles. If you bought it as a pack of sessions, Punch can count it.

PRIVATE BY DESIGN
No account, no sign-in, no ads, no server. Everything you enter stays on your phone. Punch has nothing to sync and nothing to sell. Full privacy policy: https://claude.ai/artifact/DUpj4dVQj2NVsA7JSHHPWH

Punch is a small, independent app built by one person to solve one problem: knowing how many sessions are actually left on a class pass or punch card.
```

## Other listing fields

| Field | Value |
| --- | --- |
| App name | See [App name](#app-name-store-title) |
| Category | Health & Fitness. Gym and class passes are the main use, and it is a less crowded search space than Productivity |
| Contact email | Set directly in Play Console — Google requires a real one there regardless of what's written here, so it isn't repeated in this file |
| Privacy policy URL | https://claude.ai/artifact/DUpj4dVQj2NVsA7JSHHPWH — a styled version of [`PRIVACY.md`](../../PRIVACY.md), source at [`privacy-policy.html`](privacy-policy.html) |
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
