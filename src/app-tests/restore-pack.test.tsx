import ArchivedPacksScreen from '@/app/archived';
import PackListScreen from '@/app/index';
import { usePacks } from '@/store/usePacks';
import { fireEvent, render, screen } from '@/test-utils/render';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn() } }));

function seedArchivedPack() {
  usePacks.setState({
    packs: [
      {
        id: 'p1',
        name: 'Coworking',
        totalSessions: 24,
        startDate: '2026-01-01',
        accent: 'teal',
        archived: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    sessions: [],
    hydrated: true,
  });
}

describe('restoring an archived pack', () => {
  it('shows archived packs with a way to restore them', async () => {
    seedArchivedPack();
    await render(<ArchivedPacksScreen />);
    expect(screen.getByText('Coworking')).toBeOnTheScreen();
  });

  it('restoring brings the pack back to the main list', async () => {
    seedArchivedPack();
    await render(<ArchivedPacksScreen />);

    await fireEvent.press(screen.getByLabelText('Restore Coworking'));

    expect(usePacks.getState().packs[0].archived).toBe(false);

    await render(<PackListScreen />);
    expect(screen.getByText('Coworking')).toBeOnTheScreen();
  });

  it('shows an empty state when there are no archived packs', async () => {
    usePacks.setState({ packs: [], sessions: [], hydrated: true });
    await render(<ArchivedPacksScreen />);
    expect(screen.getByText('No archived packs')).toBeOnTheScreen();
  });
});
