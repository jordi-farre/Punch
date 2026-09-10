import { View } from 'react-native';
import { Card, ProgressBar, Text, useTheme } from 'react-native-paper';

import { expiryLabel, expiryStatus } from '@/lib/dates';
import type { Pack } from '@/lib/types';
import { accentFor } from '@/theme/paper';

type Props = {
  pack: Pack;
  remaining: number;
  onPress: () => void;
  /** Overrides "today" for expiry math — a testing hook. Defaults to the real current time. */
  now?: Date;
};

export function PackCard({ pack, remaining, onPress, now }: Props) {
  const theme = useTheme();
  const accent = accentFor(pack.accent);
  const status = expiryStatus(pack.expiryDate, now);
  const label = expiryLabel(pack.expiryDate, now);
  const progress = pack.totalSessions > 0 ? remaining / pack.totalSessions : 0;
  const expiryColor =
    status === 'expired'
      ? theme.colors.error
      : status === 'expiring-soon'
        ? theme.colors.tertiary
        : theme.colors.onSurfaceVariant;

  return (
    <Card
      mode="elevated"
      onPress={onPress}
      className="mb-md"
      style={{ borderLeftWidth: 4, borderLeftColor: accent.color }}
      accessibilityLabel={`${pack.name}, ${remaining} of ${pack.totalSessions} sessions left`}>
      <Card.Content className="gap-xs">
        <View className="flex-row items-baseline justify-between">
          <Text variant="titleMedium">{pack.name}</Text>
          <Text variant="titleMedium" style={{ color: accent.color }}>
            {remaining}
            <Text variant="bodyMedium"> / {pack.totalSessions} left</Text>
          </Text>
        </View>
        <ProgressBar progress={progress} color={accent.color} />
        {label ? (
          <Text variant="bodySmall" style={{ color: expiryColor }}>
            {label}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );
}
