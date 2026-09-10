import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import {
  Appbar,
  Button,
  Dialog,
  Menu,
  Portal,
  ProgressBar,
  Snackbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { RemainingCount } from '@/components/RemainingCount';
import { SessionRow } from '@/components/SessionRow';
import { expiryLabel, expiryStatus } from '@/lib/dates';
import { remainingFor, useSessionsFor, usePacks } from '@/store/usePacks';
import { accentFor } from '@/theme/paper';

export default function PackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const pack = usePacks((state) => state.packs.find((p) => p.id === id));
  const sessions = usePacks((state) => state.sessions);
  const history = useSessionsFor(id);
  const checkIn = usePacks((state) => state.checkIn);
  const undoSession = usePacks((state) => state.undoSession);
  const deletePack = usePacks((state) => state.deletePack);
  const archivePack = usePacks((state) => state.archivePack);

  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [lastEntryId, setLastEntryId] = useState<string | null>(null);

  if (!pack) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Pack not found" />
        </Appbar.Header>
        <EmptyState title="This pack is gone" message="It may have been deleted." />
      </View>
    );
  }

  const remaining = remainingFor(pack, sessions);
  const accent = accentFor(pack.accent);
  const status = expiryStatus(pack.expiryDate);
  const label = expiryLabel(pack.expiryDate);
  const expiryColor =
    status === 'expired'
      ? theme.colors.error
      : status === 'expiring-soon'
        ? theme.colors.tertiary
        : theme.colors.onSurfaceVariant;

  function handleCheckIn() {
    const entry = checkIn(pack!.id);
    if (entry) setLastEntryId(entry.id);
  }

  function handleUndo() {
    if (lastEntryId) undoSession(lastEntryId);
    setLastEntryId(null);
  }

  function handleDelete() {
    setConfirmDeleteVisible(false);
    deletePack(pack!.id);
    router.back();
  }

  function handleArchive() {
    setMenuVisible(false);
    archivePack(pack!.id, true);
    router.back();
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={pack.name} />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={<Appbar.Action icon="dots-vertical" onPress={() => setMenuVisible(true)} />}>
          <Menu.Item
            leadingIcon="pencil-outline"
            title="Edit"
            onPress={() => {
              setMenuVisible(false);
              router.push({ pathname: '/pack/edit', params: { id: pack.id } });
            }}
          />
          <Menu.Item leadingIcon="archive-outline" title="Archive" onPress={handleArchive} />
          <Menu.Item
            leadingIcon="delete-outline"
            title="Delete"
            onPress={() => {
              setMenuVisible(false);
              setConfirmDeleteVisible(true);
            }}
          />
        </Menu>
      </Appbar.Header>

      <FlatList
        data={history}
        keyExtractor={(entry) => entry.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        ListHeaderComponent={
          <View className="items-center gap-md mb-lg">
            <RemainingCount remaining={remaining} total={pack.totalSessions} accentColor={accent.color} />
            <ProgressBar
              progress={pack.totalSessions > 0 ? remaining / pack.totalSessions : 0}
              color={accent.color}
              style={{ width: '100%', height: 8, borderRadius: 4 }}
            />
            {label ? (
              <Text variant="bodyMedium" style={{ color: expiryColor }}>
                {label}
              </Text>
            ) : null}
            <Button
              mode="contained"
              disabled={remaining <= 0}
              onPress={handleCheckIn}
              buttonColor={accent.color}
              textColor={accent.on}
              className="mt-sm">
              Use a session
            </Button>
            <Text variant="titleSmall" className="mt-lg self-start">
              History
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            No sessions used yet.
          </Text>
        }
        renderItem={({ item }) => <SessionRow entry={item} onDelete={undoSession} />}
      />

      <Snackbar
        visible={lastEntryId !== null}
        onDismiss={() => setLastEntryId(null)}
        duration={4000}
        action={{ label: 'Undo', onPress: handleUndo }}>
        Session used
      </Snackbar>

      <Portal>
        <Dialog visible={confirmDeleteVisible} onDismiss={() => setConfirmDeleteVisible(false)}>
          <Dialog.Title>Delete {pack.name}?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This also deletes its session history. This can&apos;t be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDeleteVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete} textColor={theme.colors.error}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
