import { format, parseISO } from 'date-fns';
import { forwardRef } from 'react';
import { View } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';

import type { Pack, SessionEntry } from '@/lib/types';
import { accentFor } from '@/theme/paper';
import { colors } from '@/theme/tokens';

type Props = {
  pack: Pack;
  remaining: number;
  expiryLabel: string | null;
  history: SessionEntry[];
};

const CARD_WIDTH = 360;

/**
 * Off-screen-only card rendered purely to be captured as an image (see the pack detail screen's
 * share action) — never shown on screen itself. Deliberately its own fixed-theme layout rather
 * than reusing the live detail screen: a shared image needs to look right regardless of the
 * viewer's device theme (always the light palette), and doesn't need any of the interactive
 * chrome (buttons, delete icons, app bar) the real screen has — just the numbers and history
 * someone would actually want to show.
 */
export const SharePackCard = forwardRef<View, Props>(function SharePackCard(
  { pack, remaining, expiryLabel, history },
  ref,
) {
  const accent = accentFor(pack.accent);
  const progress = pack.totalSessions > 0 ? remaining / pack.totalSessions : 0;
  const palette = colors.light;

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        width: CARD_WIDTH,
        backgroundColor: palette.surface,
        borderRadius: 24,
        padding: 24,
        gap: 16,
        borderLeftWidth: 6,
        borderLeftColor: accent.color,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            backgroundColor: palette.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ color: palette.onPrimary, fontSize: 13, fontWeight: '700' }}>P</Text>
        </View>
        <Text style={{ color: palette.onSurfaceVariant, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 }}>
          PUNCH
        </Text>
      </View>

      <Text style={{ color: palette.onSurface, fontSize: 24, fontWeight: '700' }}>{pack.name}</Text>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <Text style={{ color: accent.color, fontSize: 40, fontWeight: '700' }}>{remaining}</Text>
        <Text style={{ color: palette.onSurfaceVariant, fontSize: 18 }}>/ {pack.totalSessions} left</Text>
      </View>

      <View style={{ height: 8 }}>
        <ProgressBar progress={progress} color={accent.color} style={{ borderRadius: 4 }} />
      </View>

      {expiryLabel ? (
        <Text style={{ color: palette.onSurfaceVariant, fontSize: 15 }}>{expiryLabel}</Text>
      ) : null}

      {history.length > 0 ? (
        <View style={{ gap: 4, marginTop: 8 }}>
          <Text
            style={{
              color: palette.onSurfaceVariant,
              fontSize: 12,
              fontWeight: '600',
              letterSpacing: 0.5,
              marginBottom: 4,
            }}>
            HISTORY
          </Text>
          {history.map((entry, index) => {
            const date = parseISO(entry.usedAt);
            return (
              <View
                key={entry.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: palette.outlineVariant,
                }}>
                <Text style={{ color: palette.onSurface, fontSize: 15 }}>{format(date, 'EEE, MMM d, yyyy')}</Text>
                <Text style={{ color: palette.onSurfaceVariant, fontSize: 15 }}>{format(date, 'h:mm a')}</Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
});
