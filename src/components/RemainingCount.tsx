import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Text } from 'react-native-paper';

type Props = {
  remaining: number;
  total: number;
  accentColor: string;
};

export function RemainingCount({ remaining, total, accentColor }: Props) {
  const scale = useSharedValue(1);
  const previous = useRef(remaining);

  useEffect(() => {
    if (previous.current !== remaining) {
      scale.value = withSequence(withTiming(1.15, { duration: 120 }), withTiming(1, { duration: 180 }));
      previous.current = remaining;
    }
  }, [remaining, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View className="items-center">
      <Animated.View style={animatedStyle}>
        <Text variant="displayLarge" style={{ color: accentColor }} accessibilityLabel={`${remaining} sessions remaining`}>
          {remaining}
        </Text>
      </Animated.View>
      <Text variant="bodyLarge">of {total} sessions left</Text>
    </View>
  );
}
