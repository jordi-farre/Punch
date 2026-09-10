import PackDetailScreen from '@/app/pack/[id]';
import { usePacks } from '@/store/usePacks';
import { fireEvent, render, screen } from '@/test-utils/render';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  router: { back: () => mockBack(), push: jest.fn() },
  useLocalSearchParams: () => ({ id: 'p1' }),
}));

function seedPack(totalSessions: number) {
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
    sessions: [],
    hydrated: true,
  });
}

describe('pack detail screen', () => {
  it('checks in a session, shows the undo snackbar, and undo restores it', async () => {
    seedPack(2);
    await render(<PackDetailScreen />);
    expect(screen.getByText('2')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: /use a session/i }));
    expect(screen.getByText('Session used')).toBeOnTheScreen();
    expect(screen.getByText('1')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Undo'));
    expect(screen.getByText('2')).toBeOnTheScreen();
  });

  it('disables "Use a session" once there are no sessions left', async () => {
    seedPack(1);
    await render(<PackDetailScreen />);

    await fireEvent.press(screen.getByRole('button', { name: /use a session/i }));
    expect(screen.getByText('Session used')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /use a session/i })).toBeDisabled();
  });
});
