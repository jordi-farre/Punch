import EditPackScreen from '@/app/pack/edit';
import { usePacks } from '@/store/usePacks';
import { fireEvent, render, screen } from '@/test-utils/render';

const mockBack = jest.fn();
const mockUseLocalSearchParams = jest.fn();

jest.mock('expo-router', () => ({
  router: { back: () => mockBack(), push: jest.fn() },
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

describe('add/edit pack screen', () => {
  it('creates a pack and lands it in the store', async () => {
    mockUseLocalSearchParams.mockReturnValue({});
    await render(<EditPackScreen />);

    await fireEvent.changeText(screen.getByLabelText('Name'), 'Gym');
    await fireEvent.changeText(screen.getByLabelText('Total sessions'), '10');
    await fireEvent.press(screen.getByLabelText('Save'));

    expect(mockBack).toHaveBeenCalled();
    expect(usePacks.getState().packs).toHaveLength(1);
    expect(usePacks.getState().packs[0]).toMatchObject({ name: 'Gym', totalSessions: 10 });
  });

  it('rejects a total below the sessions already used when editing', async () => {
    usePacks.setState({
      packs: [
        {
          id: 'p1',
          name: 'Coworking',
          totalSessions: 3,
          startDate: '2026-01-01',
          accent: 'teal',
          archived: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      sessions: [
        { id: 's1', packId: 'p1', usedAt: '2026-01-02T00:00:00.000Z' },
        { id: 's2', packId: 'p1', usedAt: '2026-01-03T00:00:00.000Z' },
      ],
      hydrated: true,
    });
    mockUseLocalSearchParams.mockReturnValue({ id: 'p1' });
    await render(<EditPackScreen />);

    await fireEvent.changeText(screen.getByLabelText('Total sessions'), '1');

    expect(
      screen.getByText(/can.t be less than the 2 session\(s\) already used/i),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Save')).toBeDisabled();

    await fireEvent.press(screen.getByLabelText('Save'));
    expect(usePacks.getState().packs[0].totalSessions).toBe(3);
  });
});
