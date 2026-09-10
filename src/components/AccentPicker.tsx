import { Pressable, View } from 'react-native';
import { Icon } from 'react-native-paper';

import { accentOrder, accents, type AccentKey } from '@/theme/paper';

type Props = {
  value: AccentKey;
  onChange: (accent: AccentKey) => void;
};

export function AccentPicker({ value, onChange }: Props) {
  return (
    <View className="flex-row flex-wrap gap-sm" accessibilityRole="radiogroup">
      {accentOrder.map((key) => {
        const accent = accents[key];
        const selected = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${key} accent color`}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: accent.color,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: selected ? 3 : 0,
              borderColor: accent.on,
            }}>
            {selected ? <Icon source="check" size={18} color={accent.on} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
