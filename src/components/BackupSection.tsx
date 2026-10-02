import { useState } from 'react';
import { View } from 'react-native';
import { Button, Dialog, Portal, Snackbar, Text, useTheme } from 'react-native-paper';

import { exportBackupFile, pickBackupFile } from '@/lib/backupFile';
import type { PersistedState } from '@/lib/types';
import { usePacks } from '@/store/usePacks';

export function BackupSection() {
  const theme = useTheme();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<PersistedState | null>(null);

  async function handleExport() {
    const { packs, sessions } = usePacks.getState();
    const outcome = await exportBackupFile({ version: 1, packs, sessions });
    if (outcome === 'unavailable') setMessage("Sharing isn't available on this device");
  }

  async function handleImport() {
    const result = await pickBackupFile();
    if (result.status === 'invalid') setMessage("That file isn't a valid Punch backup");
    if (result.status === 'ok') setPendingImport(result.state);
  }

  function handleConfirmImport() {
    if (pendingImport) usePacks.getState().replaceAll(pendingImport);
    setPendingImport(null);
    setMessage('Backup restored');
  }

  return (
    <View className="gap-sm mt-lg">
      <Text variant="labelLarge">Backup</Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        Save your packs and history to a file, or restore them from one.
      </Text>
      <View className="flex-row gap-sm">
        <Button mode="outlined" icon="export" className="flex-1" accessibilityLabel="Export backup" onPress={handleExport}>
          Export
        </Button>
        <Button mode="outlined" icon="import" className="flex-1" accessibilityLabel="Import backup" onPress={handleImport}>
          Import
        </Button>
      </View>

      <Portal>
        <Dialog visible={pendingImport !== null} onDismiss={() => setPendingImport(null)}>
          <Dialog.Title>Replace your data?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This replaces everything in Punch with the backup: {pendingImport?.packs.length ?? 0} packs and{' '}
              {pendingImport?.sessions.length ?? 0} check-ins. This can&apos;t be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPendingImport(null)}>Cancel</Button>
            <Button onPress={handleConfirmImport} textColor={theme.colors.error}>
              Replace
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={4000}>
          {message}
        </Snackbar>
      </Portal>
    </View>
  );
}
