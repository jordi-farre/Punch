import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Appbar, Button, Card, Dialog, IconButton, Portal, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { remainingFor, usePacks } from '@/store/usePacks';
import { accentFor } from '@/theme/paper';
import type { Pack } from '@/lib/types';

export default function ArchivedPacksScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const packs = usePacks((state) => state.packs);
  const sessions = usePacks((state) => state.sessions);
  const archivePack = usePacks((state) => state.archivePack);
  const deletePack = usePacks((state) => state.deletePack);

  const [packPendingDelete, setPackPendingDelete] = useState<Pack | null>(null);

  const archivedPacks = packs
    .filter((pack) => pack.archived)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function handleRestore(id: string) {
    archivePack(id, false);
  }

  function handleDelete() {
    if (packPendingDelete) deletePack(packPendingDelete.id);
    setPackPendingDelete(null);
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Archived packs" />
      </Appbar.Header>

      {archivedPacks.length === 0 ? (
        <EmptyState
          icon="archive-outline"
          title="No archived packs"
          message="Packs you archive from their detail screen show up here, so you can restore or delete them later."
        />
      ) : (
        <FlatList
          data={archivedPacks}
          keyExtractor={(pack) => pack.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
          renderItem={({ item }) => {
            const remaining = remainingFor(item, sessions);
            const accent = accentFor(item.accent);
            return (
              <Card mode="elevated" className="mb-lg" style={{ borderLeftWidth: 4, borderLeftColor: accent.color }}>
                <Card.Content className="gap-xs">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text variant="titleMedium">{item.name}</Text>
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {remaining} / {item.totalSessions} left
                      </Text>
                    </View>
                    <IconButton
                      icon="delete-outline"
                      accessibilityLabel={`Delete ${item.name} permanently`}
                      onPress={() => setPackPendingDelete(item)}
                    />
                    <IconButton
                      icon="backup-restore"
                      accessibilityLabel={`Restore ${item.name}`}
                      containerColor={theme.colors.secondaryContainer}
                      iconColor={theme.colors.onSecondaryContainer}
                      onPress={() => handleRestore(item.id)}
                    />
                  </View>
                </Card.Content>
              </Card>
            );
          }}
        />
      )}

      <Portal>
        <Dialog visible={packPendingDelete !== null} onDismiss={() => setPackPendingDelete(null)}>
          <Dialog.Title>Delete {packPendingDelete?.name}?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This also deletes its session history. This can&apos;t be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPackPendingDelete(null)}>Cancel</Button>
            <Button onPress={handleDelete} textColor={theme.colors.error}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
