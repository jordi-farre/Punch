/**
 * Local-only unique id. Deliberately not `crypto.randomUUID()` — Hermes doesn't guarantee that
 * global across RN/web/Jest, and these ids never leave the device, so a UUID isn't needed.
 */
export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
