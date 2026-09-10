import { act, render as rtlRender, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { usePacks } from '@/store/usePacks';
import { paperLightTheme } from '@/theme/paper';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

/** Resets the zustand store to a hydrated, empty state — call at the top of a test that needs a
 * clean slate beyond what the global `afterEach` in jest.setup.ts already gives it. */
export function resetPacksStore() {
  usePacks.setState({ packs: [], sessions: [], hydrated: true });
}

// RNTL v14's `render` is async (it awaits an initial `act()` flush) — this wrapper is async too,
// so callers must `await render(...)`, same as they would `@testing-library/react-native`'s own.
export async function render(ui: ReactElement, options?: RenderOptions) {
  return rtlRender(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <PaperProvider theme={paperLightTheme}>{ui}</PaperProvider>
    </SafeAreaProvider>,
    options,
  );
}

/**
 * Paper's Portal-based components (Menu, Dialog, Snackbar) run a one-off mount/open/close
 * animation via RN's `Animated`, completed via a real timer in the RN jest mock. Left alone, that
 * timer can resolve after a test has already finished, leaking a state update into the next one
 * ("PortalManager" / act warnings). Draining real timers inside `act()` keeps it contained within
 * the test that triggered it — call after opening/closing a Menu, Dialog, or Snackbar.
 */
export async function flushAnimations() {
  // The RN jest preset's Animated mock resolves each animation via a real `setTimeout(..., 16)`
  // (one frame), not a 0ms tick — so a 0ms wait here raced it and was flaky (reliable on an idle
  // machine, intermittent under CI's scheduling jitter). Wait comfortably past that.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
}

export * from '@testing-library/react-native';
