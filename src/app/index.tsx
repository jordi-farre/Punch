import { router } from 'expo-router';
import { FlatList, View } from 'react-native';
import { Appbar, FAB, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { PackCard } from '@/components/PackCard';
import { remainingFor, usePacks } from '@/store/usePacks';

export default function PackListScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const packs = usePacks((state) => state.packs);
  const sessions = usePacks((state) => state.sessions);
  const visiblePacks = packs
    .filter((pack) => !pack.archived)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.Content title="Bonus Sessions" />
      </Appbar.Header>

      {visiblePacks.length === 0 ? (
        <EmptyState
          title="No bonus packs yet"
          message="Add a coworking bonus, a gym pack, or anything else you're tracking by sessions."
          actionLabel="Add a pack"
          onAction={() => router.push('/pack/edit')}
        />
      ) : (
        <FlatList
          data={visiblePacks}
          keyExtractor={(pack) => pack.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 96 }}
          renderItem={({ item }) => (
            <PackCard
              pack={item}
              remaining={remainingFor(item, sessions)}
              onPress={() => router.push(`/pack/${item.id}`)}
            />
          )}
        />
      )}

      <FAB
        icon="plus"
        label="Add pack"
        onPress={() => router.push('/pack/edit')}
        style={{ position: 'absolute', right: 16, bottom: insets.bottom + 16 }}
      />
    </View>
  );
}
