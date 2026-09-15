# Punch Privacy Policy

**Effective 2026-09-15**

Punch doesn't have an account, a server, or an analytics kit — so there isn't much of a policy to
write. Here's the whole thing.

## What we collect

Nothing. Punch doesn't collect, transmit, sell, or share any personal data, usage data, or
analytics — from you or anyone else who uses the app. There's no sign-in, no user ID, no
advertising SDK, no crash-reporting service reading your data.

## Where your data lives

On your device, only your device. The pack names, session counts, and check-in history you enter
are saved with your phone's operating system under the key `punch:v1` (see
[`src/lib/storage.ts`](src/lib/storage.ts)), and never leave it. Uninstalling the app deletes that
data permanently — there's no copy anywhere else for us to hold.

## Backing up a lost phone

Handled entirely by your phone, not by us. Punch opts in to your device's own backup system —
iCloud Backup on iOS, "Back up to Google Drive" on Android — the same mechanism that backs up your
photos and messages. If you have that turned on, your packs are included; if it's off, they
aren't. We never see that backup, and can't turn the setting on or off for you. (See the [Data
safety](README.md#data-safety) section of the README for the implementation details.)

## Network access

The app doesn't call home. Android shows Punch requesting internet access, which comes from the
app framework itself (Expo/React Native), not from any code in this app. Punch never opens a
network connection to send or fetch data of its own.

## Children's privacy

Not directed at children, and it wouldn't matter if it were — since nothing is collected from
anyone, there's nothing collected from children either.

## Changes

If Punch ever changes in a way that touches this policy — say, a future sync feature that
genuinely needs a server — this file will say so, with a new effective date, before that version
reaches you. Check the git history of this file for exactly what changed and when.

## Questions

[jordifr@gmail.com](mailto:jordifr@gmail.com) · [github.com/jordi-farre/Punch](https://github.com/jordi-farre/Punch)

Punch is an independent, single-developer app. This policy covers Punch only.

---

A styled version of this same policy is published at
https://claude.ai/artifact/DUpj4dVQj2NVsA7JSHHPWH — that's the link to use for the Play Store /
App Store Connect "privacy policy URL" field. This file is the source-controlled copy of record;
if the two ever drift, this one wins.
