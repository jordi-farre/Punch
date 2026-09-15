import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Appbar, FAB, Snackbar, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { PackCard } from '@/components/PackCard';
import { remainingFor, usePacks } from '@/store/usePacks';

export default function PackListScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const packs = usePacks((state) => state.packs);
  const sessions = usePacks((state) => state.sessions);
  const checkIn = usePacks((state) => state.checkIn);
  const undoSession = usePacks((state) => state.undoSession);
  const visiblePacks = packs
    .filter((pack) => !pack.archived)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const [lastEntryId, setLastEntryId] = useState<string | null>(null);

  function handleSwipeCheckIn(packId: string) {
    const entry = checkIn(packId);
    if (entry) setLastEntryId(entry.id);
  }

  function handleUndo() {
    if (lastEntryId) undoSession(lastEntryId);
    setLastEntryId(null);
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.Content title="Session Packs" />
      </Appbar.Header>

      {visiblePacks.length > 0 ? (
        <Text
          variant="bodySmall"
          className="px-md pb-xs"
          style={{ color: theme.colors.onSurfaceVariant }}>
          Swipe a pack to log a session
        </Text>
      ) : null}

      {visiblePacks.length === 0 ? (
        <EmptyState
          title="No packs yet"
          message="Add a coworking pack, a gym pack, or anything else you're tracking by sessions."
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
              onCheckIn={() => handleSwipeCheckIn(item.id)}
            />
          )}
        />
      )}

      <FAB
        icon="plus"
        label="Add pack"
        onPress={() => router.push('/pack/edit')}
        // Paper's extended FAB label has no `numberOfLines` and sits in a fixed-height,
        // clipped container — at a larger Android system font scale "Add pack" can wrap to a
        // second line that's invisibly cut off, showing only "Add". Cap how far the label can
        // scale so it always fits on one line; it can still grow a bit for accessibility.
        labelMaxFontSizeMultiplier={1.2}
        style={{ position: 'absolute', right: 16, bottom: insets.bottom + 16 }}
      />

      <Snackbar
        visible={lastEntryId !== null}
        onDismiss={() => setLastEntryId(null)}
        duration={4000}
        action={{ label: 'Undo', onPress: handleUndo }}>
        Session used
      </Snackbar>
    </View>
  );
}
