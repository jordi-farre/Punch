import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Appbar, Icon, Snackbar, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
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
        <Appbar.Action
          icon="archive-outline"
          accessibilityLabel="Archived packs"
          onPress={() => router.push('/archived')}
        />
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

      {/*
        A hand-built icon-only FAB rather than Paper's <FAB icon label>: the extended (icon+label)
        version clipped its label to "Add" instead of "Add pack" on a real Android device, tracing
        back to Paper's FAB fixing its content box at a hardcoded 56px height with the label
        unconstrained (no numberOfLines). Dropping the label sidesteps the whole class of bug
        rather than working around it — there's nothing left to clip. Rounded square, not a full
        circle: Material 3 moved FABs away from perfect circles, and Paper's own MD3 FAB shape
        computation (getFabStyle in FAB/utils.ts) works out to `4 * theme.roundness` for the
        standard 56px size — reusing that keeps this consistent with the same rounding language
        the rest of the app's cards and dialogs already use, rather than introducing a one-off
        circular shape.
      */}
      <Surface
        elevation={3}
        style={{
          position: 'absolute',
          right: 16,
          bottom: insets.bottom + 16,
          width: 56,
          height: 56,
          borderRadius: 4 * theme.roundness,
        }}>
        <TouchableRipple
          onPress={() => router.push('/pack/edit')}
          borderless
          style={{ borderRadius: 4 * theme.roundness }}
          accessibilityRole="button"
          accessibilityLabel="Add pack">
          <View
            className="items-center justify-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: 4 * theme.roundness,
              backgroundColor: theme.colors.primaryContainer,
            }}>
            <Icon source="plus" size={28} color={theme.colors.onPrimaryContainer} />
          </View>
        </TouchableRipple>
      </Surface>

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
