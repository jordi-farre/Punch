import { useRef } from 'react';
import { Pressable, View } from 'react-native';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Card, Icon, ProgressBar, Text, useTheme } from 'react-native-paper';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { expiryLabel, expiryStatus } from '@/lib/dates';
import type { Pack } from '@/lib/types';
import { accentFor } from '@/theme/paper';

type Props = {
  pack: Pack;
  remaining: number;
  onPress: () => void;
  /** Swipe-to-check-in, Gmail-style: called once the swipe gesture completes. */
  onCheckIn: () => void;
  /** Overrides "today" for expiry math — a testing hook. Defaults to the real current time. */
  now?: Date;
};

const ACTION_WIDTH = 120;

type SwipeActionProps = {
  progress: SharedValue<number>;
  packName: string;
  canCheckIn: boolean;
  color: string;
  onColor: string;
  disabledColor: string;
  onDisabledColor: string;
  onPress: () => void;
};

/**
 * The panel revealed behind a swiped card. Broken out into its own component (rather than an
 * inline closure) so `useAnimatedStyle` is a proper hook call on a proper component, not a hook
 * invoked from a plain render-prop callback. The icon/label scale and fade in as the swipe
 * progresses, so the action feels "pushed" into place by the gesture, not just popped in.
 */
function SwipeCheckInAction({
  progress,
  packName,
  canCheckIn,
  color,
  onColor,
  disabledColor,
  onDisabledColor,
  onPress,
}: SwipeActionProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const revealed = Math.min(Math.max(progress.value, 0), 1);
    return {
      opacity: revealed,
      transform: [{ scale: 0.6 + revealed * 0.4 }],
    };
  });

  return (
    <View
      style={{
        width: ACTION_WIDTH,
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: canCheckIn ? color : disabledColor,
      }}>
      <Pressable
        onPress={onPress}
        disabled={!canCheckIn}
        accessibilityRole="button"
        accessibilityLabel={`Use a session for ${packName}`}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[{ alignItems: 'center', gap: 4 }, animatedStyle]}>
          <Icon source="check-bold" size={26} color={canCheckIn ? onColor : onDisabledColor} />
          <Text style={{ color: canCheckIn ? onColor : onDisabledColor, fontSize: 12 }}>Use</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

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

  function handleCheckIn() {
    onCheckIn();
    swipeableRef.current?.close();
  }

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={(swipeProgress) => (
        <SwipeCheckInAction
          progress={swipeProgress}
          packName={pack.name}
          canCheckIn={canCheckIn}
          color={accent.color}
          onColor={accent.on}
          disabledColor={theme.colors.surfaceDisabled}
          onDisabledColor={theme.colors.onSurfaceDisabled}
          onPress={handleCheckIn}
        />
      )}
      overshootRight={false}
      enabled={canCheckIn}
      rightThreshold={ACTION_WIDTH / 2}
      onSwipeableOpen={handleCheckIn}>
      <Card
        mode="elevated"
        onPress={onPress}
        className="mb-lg"
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
