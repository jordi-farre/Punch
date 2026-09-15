import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Appbar, Icon, Snackbar, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { PackCard } from '@/components/PackCard';
import { remainingFor, usePacks } from '@/store/usePacks';
import { radii } from '@/theme/tokens';

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

      {/*
        A hand-built extended FAB rather than Paper's <FAB icon label>: on a real Android device
        the label rendered as just "Add" instead of "Add pack" — Paper's FAB fixes its content
        box at a hardcoded 56px height with the label unconstrained (no numberOfLines), so
        anything that pushes the label to wrap gets silently clipped by that fixed height. Capping
        labelMaxFontSizeMultiplier didn't fix it, which means the wrap isn't only a font-scale
        thing. Building it from Surface + TouchableRipple avoids the whole class of bug: nothing
        here has a fixed height, so there's nothing for a wrapped line to clip against, and
        numberOfLines={1} makes any real overflow show up as an honest "…" instead of vanishing.
      */}
      <Surface
        elevation={3}
        style={{
          position: 'absolute',
          right: 16,
          bottom: insets.bottom + 16,
          borderRadius: radii.xl,
        }}>
        <TouchableRipple
          onPress={() => router.push('/pack/edit')}
          borderless
          style={{ borderRadius: radii.xl }}
          accessibilityRole="button"
          accessibilityLabel="Add pack">
          <View
            className="flex-row items-center gap-sm"
            style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderRadius: radii.xl,
              backgroundColor: theme.colors.primaryContainer,
            }}>
            <Icon source="plus" size={24} color={theme.colors.onPrimaryContainer} />
            <Text
              variant="labelLarge"
              numberOfLines={1}
              style={{ color: theme.colors.onPrimaryContainer }}>
              Add pack
            </Text>
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
