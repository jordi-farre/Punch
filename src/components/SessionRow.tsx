import { format, parseISO } from 'date-fns';
import { View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

import type { SessionEntry } from '@/lib/types';

type Props = {
  entry: SessionEntry;
  onDelete: (entryId: string) => void;
};

export function SessionRow({ entry, onDelete }: Props) {
  const date = parseISO(entry.usedAt);
  return (
    <View className="flex-row items-center justify-between py-xs">
      <View>
        <Text variant="bodyMedium">{format(date, 'EEE, MMM d, yyyy')}</Text>
        <Text variant="bodySmall">{format(date, 'h:mm a')}</Text>
      </View>
      <IconButton
        icon="delete-outline"
        accessibilityLabel="Delete this session"
        onPress={() => onDelete(entry.id)}
      />
    </View>
  );
}
