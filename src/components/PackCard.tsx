import { useRef } from 'react';
import { Pressable, View } from 'react-native';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Card, Icon, ProgressBar, Text, useTheme } from 'react-native-paper';

import { expiryLabel, expiryStatus } from '@/lib/dates';
import type { Pack } from '@/lib/types';
import { accentFor } from '@/theme/paper';

type Props = {
  pack: Pack;
  remaining: number;
  onPress: () => void;
  /** Swipe-to-check-in: called when the revealed action is tapped. */
  onCheckIn: () => void;
  /** Overrides "today" for expiry math — a testing hook. Defaults to the real current time. */
  now?: Date;
};

const ACTION_WIDTH = 88;

export function PackCard({ pack, remaining, onPress, onCheckIn, now }: Props) {
  const theme = useTheme();
  const swipeableRef = useRef<SwipeableMethods>(null);
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
  const canCheckIn = remaining > 0;

  function handleSwipeCheckIn() {
    swipeableRef.current?.close();
    onCheckIn();
  }

  function renderRightActions() {
    return (
      <View style={{ width: ACTION_WIDTH, marginBottom: 16, paddingLeft: 8 }}>
        <Pressable
          onPress={handleSwipeCheckIn}
          disabled={!canCheckIn}
          accessibilityRole="button"
          accessibilityLabel={`Use a session for ${pack.name}`}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            borderRadius: 12,
            backgroundColor: canCheckIn ? accent.color : theme.colors.surfaceDisabled,
          }}>
          <Icon
            source="check-bold"
            size={22}
            color={canCheckIn ? accent.on : theme.colors.onSurfaceDisabled}
          />
          <Text style={{ color: canCheckIn ? accent.on : theme.colors.onSurfaceDisabled, fontSize: 12 }}>
            Use
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      enabled={canCheckIn}
      rightThreshold={ACTION_WIDTH / 2}>
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
    </ReanimatedSwipeable>
  );
}
