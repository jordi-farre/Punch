import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

import SettingsScreen from '@/app/settings';
import { parseBackup, serializeBackup } from '@/lib/backup';
import type { PersistedState } from '@/lib/types';
import { usePacks } from '@/store/usePacks';
import { fireEvent, render, screen } from '@/test-utils/render';

const mockFiles: Record<string, string> = {};

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-file-system', () => {
  class File {
    uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map((part) => (typeof part === 'string' ? part : part.uri)).join('/');
    }
    create() {}
    write(content: string) {
      mockFiles[this.uri] = content;
    }
    async text() {
      if (!(this.uri in mockFiles)) throw new Error('missing file');
      return mockFiles[this.uri];
    }
  }
  return { File, Paths: { cache: { uri: 'cache' } } };
});

const backup: PersistedState = {
  version: 1,
  packs: [
    {
      id: 'imported',
      name: 'Imported pack',
      totalSessions: 10,
      startDate: '2026-01-01',
      accent: 'teal',
      archived: false,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  sessions: [{ id: 's1', packId: 'imported', usedAt: '2026-01-02T00:00:00.000Z' }],
};

function seedCurrentData() {
  usePacks.setState({
    packs: [
      {
        id: 'current',
        name: 'Current pack',
        totalSessions: 5,
        startDate: '2026-02-01',
        accent: 'indigo',
        archived: false,
        createdAt: '2026-02-01T00:00:00.000Z',
      },
    ],
    sessions: [],
    hydrated: true,
  });
}

function pickFile(uri: string) {
  (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri }] });
}

beforeEach(() => {
  Object.keys(mockFiles).forEach((key) => delete mockFiles[key]);
  jest.clearAllMocks();
  (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
});

describe('exporting a backup', () => {
  it('writes the current packs and history to a file and shares it', async () => {
    seedCurrentData();
    await render(<SettingsScreen />);

    await fireEvent.press(screen.getByLabelText('Export backup'));

    const [uri, options] = (Sharing.shareAsync as jest.Mock).mock.calls[0];
    expect(uri).toMatch(/punch-backup-\d{4}-\d{2}-\d{2}\.json$/);
    expect(options).toMatchObject({ mimeType: 'application/json' });
    const written = parseBackup(mockFiles[uri]);
    expect(written?.packs.map((pack) => pack.name)).toEqual(['Current pack']);
  });

  it('says so when sharing is not available', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);
    seedCurrentData();
    await render(<SettingsScreen />);

    await fireEvent.press(screen.getByLabelText('Export backup'));

    expect(await screen.findByText("Sharing isn't available on this device")).toBeOnTheScreen();
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });
});

describe('importing a backup', () => {
  it('replaces the current data after confirming', async () => {
    seedCurrentData();
    mockFiles['picked.json'] = serializeBackup(backup);
    pickFile('picked.json');
    await render(<SettingsScreen />);

    await fireEvent.press(screen.getByLabelText('Import backup'));
    expect(await screen.findByText('Replace your data?')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Replace'));

    expect(usePacks.getState().packs.map((pack) => pack.name)).toEqual(['Imported pack']);
    expect(usePacks.getState().sessions).toHaveLength(1);
    expect(await screen.findByText('Backup restored')).toBeOnTheScreen();
  });

  it('keeps the current data when the confirmation is cancelled', async () => {
    seedCurrentData();
    mockFiles['picked.json'] = serializeBackup(backup);
    pickFile('picked.json');
    await render(<SettingsScreen />);

    await fireEvent.press(screen.getByLabelText('Import backup'));
    await fireEvent.press(await screen.findByText('Cancel'));

    expect(usePacks.getState().packs.map((pack) => pack.name)).toEqual(['Current pack']);
  });

  it('rejects a file that is not a Punch backup and keeps the current data', async () => {
    seedCurrentData();
    mockFiles['picked.json'] = 'definitely not a backup';
    pickFile('picked.json');
    await render(<SettingsScreen />);

    await fireEvent.press(screen.getByLabelText('Import backup'));

    expect(await screen.findByText("That file isn't a valid Punch backup")).toBeOnTheScreen();
    expect(usePacks.getState().packs.map((pack) => pack.name)).toEqual(['Current pack']);
  });

  it('does nothing when the file picker is dismissed', async () => {
    seedCurrentData();
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: null });
    await render(<SettingsScreen />);

    await fireEvent.press(screen.getByLabelText('Import backup'));

    expect(screen.queryByText('Replace your data?')).toBeNull();
    expect(usePacks.getState().packs.map((pack) => pack.name)).toEqual(['Current pack']);
  });
});
