import PackListScreen from '@/app/index';
import { fireEvent, render, screen } from '@/test-utils/render';
import { usePacks } from '@/store/usePacks';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

function seedPack(totalSessions: number, used = 0) {
  usePacks.setState({
    packs: [
      {
        id: 'p1',
        name: 'Coworking',
        totalSessions,
        startDate: '2026-01-01',
        accent: 'teal',
        archived: false,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    sessions: Array.from({ length: used }, (_, i) => ({
      id: `s${i}`,
      packId: 'p1',
      usedAt: '2026-01-02T00:00:00.000Z',
    })),
    hydrated: true,
  });
}

describe('swiping a pack to check in', () => {
  it('checks in a session via the swipe-revealed action', async () => {
    seedPack(24);
    await render(<PackListScreen />);

    await fireEvent.press(screen.getByLabelText('Use a session for Coworking'));

    expect(screen.getByText('Session used')).toBeOnTheScreen();
    expect(screen.getByText('23 / 24 left')).toBeOnTheScreen();
  });

  it('disables the swipe action once a pack has no sessions left', async () => {
    seedPack(1, 1);
    await render(<PackListScreen />);
    expect(screen.getByLabelText('Use a session for Coworking')).toBeDisabled();
  });
});
