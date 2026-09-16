import EditPackScreen from '@/app/pack/edit';
import { daysUntil } from '@/lib/dates';
import { usePacks } from '@/store/usePacks';
import { fireEvent, render, screen } from '@/test-utils/render';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  router: { back: () => mockBack(), push: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

describe('adding a pack', () => {
  it('creates a pack and lands it in the store', async () => {
    await render(<EditPackScreen />);

    await fireEvent.changeText(screen.getByLabelText('Name'), 'Gym');
    await fireEvent.changeText(screen.getByLabelText('Total sessions'), '10');
    await fireEvent.press(screen.getByLabelText('Save'));

    expect(mockBack).toHaveBeenCalled();
    expect(usePacks.getState().packs).toHaveLength(1);
    expect(usePacks.getState().packs[0]).toMatchObject({ name: 'Gym', totalSessions: 10 });
  });

  it('defaults the start date to today', async () => {
    await render(<EditPackScreen />);

    await fireEvent.changeText(screen.getByLabelText('Name'), 'Gym');
    await fireEvent.changeText(screen.getByLabelText('Total sessions'), '10');
    await fireEvent.press(screen.getByLabelText('Save'));

    expect(daysUntil(usePacks.getState().packs[0].startDate)).toBe(0);
  });
});
