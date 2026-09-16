import { addDays, format } from 'date-fns';

import PackListScreen from '@/app/index';
import { render, screen } from '@/test-utils/render';
import { usePacks } from '@/store/usePacks';
import { paperLightTheme } from '@/theme/paper';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

function isoOffset(days: number): string {
  return format(addDays(new Date(), days), 'yyyy-MM-dd');
}

describe('viewing packs', () => {
  it('shows an empty state with no packs yet', async () => {
    await render(<PackListScreen />);
    expect(screen.getByText('No packs yet')).toBeOnTheScreen();
  });

  it('shows remaining vs total sessions for each pack', async () => {
    usePacks.setState({
      packs: [
        {
          id: 'p1',
          name: 'Coworking',
          totalSessions: 24,
          startDate: '2026-01-01',
          accent: 'teal',
          archived: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      sessions: [{ id: 's1', packId: 'p1', usedAt: '2026-01-02T00:00:00.000Z' }],
      hydrated: true,
    });
    await render(<PackListScreen />);
    expect(screen.getByText('23 / 24 left')).toBeOnTheScreen();
  });

  it('shows no expiry line when a pack has no expiry date', async () => {
    usePacks.setState({
      packs: [
        {
          id: 'p1',
          name: 'Coworking',
          totalSessions: 24,
          startDate: '2026-01-01',
          accent: 'teal',
          archived: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      sessions: [],
      hydrated: true,
    });
    await render(<PackListScreen />);
    expect(screen.queryByText(/expires|expired/i)).toBeNull();
  });

  it('shows a neutral "Expires in" line well before expiry', async () => {
    usePacks.setState({
      packs: [
        {
          id: 'p1',
          name: 'Coworking',
          totalSessions: 24,
          startDate: '2026-01-01',
          expiryDate: isoOffset(90),
          accent: 'teal',
          archived: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      sessions: [],
      hydrated: true,
    });
    await render(<PackListScreen />);
    const label = screen.getByText(/^Expires in /);
    expect(label).toHaveStyle({ color: paperLightTheme.colors.onSurfaceVariant });
  });

  it('highlights the expiry line once inside the expiring-soon window', async () => {
    usePacks.setState({
      packs: [
        {
          id: 'p1',
          name: 'Coworking',
          totalSessions: 24,
          startDate: '2026-01-01',
          expiryDate: isoOffset(5),
          accent: 'teal',
          archived: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      sessions: [],
      hydrated: true,
    });
    await render(<PackListScreen />);
    const label = screen.getByText(/^Expires in /);
    expect(label).toHaveStyle({ color: paperLightTheme.colors.tertiary });
  });

  it('shows an "Expired" line, in the error color, once the date has passed', async () => {
    usePacks.setState({
      packs: [
        {
          id: 'p1',
          name: 'Coworking',
          totalSessions: 24,
          startDate: '2026-01-01',
          expiryDate: isoOffset(-5),
          accent: 'teal',
          archived: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      sessions: [],
      hydrated: true,
    });
    await render(<PackListScreen />);
    const label = screen.getByText(/^Expired /);
    expect(label).toHaveStyle({ color: paperLightTheme.colors.error });
  });

  it('only lists packs that are not archived', async () => {
    usePacks.setState({
      packs: [
        {
          id: 'p1',
          name: 'Coworking',
          totalSessions: 24,
          startDate: '2026-01-01',
          accent: 'teal',
          archived: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'p2',
          name: 'Gym',
          totalSessions: 10,
          startDate: '2026-01-01',
          accent: 'indigo',
          archived: true,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      sessions: [],
      hydrated: true,
    });
    await render(<PackListScreen />);
    expect(screen.getByText('Coworking')).toBeOnTheScreen();
    expect(screen.queryByText('Gym')).toBeNull();
  });
});
