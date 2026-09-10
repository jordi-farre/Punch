import { PackCard } from '@/components/PackCard';
import type { Pack } from '@/lib/types';
import { fireEvent, render, screen } from '@/test-utils/render';
import { paperLightTheme } from '@/theme/paper';

const NOW = new Date(2026, 0, 15); // Jan 15, 2026

function makePack(overrides: Partial<Pack> = {}): Pack {
  return {
    id: 'p1',
    name: 'Coworking',
    totalSessions: 24,
    startDate: '2026-01-01',
    accent: 'teal',
    archived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const noop = () => {};

describe('PackCard', () => {
  it('shows remaining vs total sessions', async () => {
    await render(<PackCard pack={makePack()} remaining={18} onPress={noop} onCheckIn={noop} now={NOW} />);
    expect(screen.getByText('18 / 24 left')).toBeOnTheScreen();
  });

  it('shows no expiry line when the pack has no expiry date', async () => {
    await render(<PackCard pack={makePack()} remaining={18} onPress={noop} onCheckIn={noop} now={NOW} />);
    expect(screen.queryByText(/expires|expired/i)).toBeNull();
  });

  it('shows a neutral "Expires in" line well before expiry', async () => {
    await render(
      <PackCard
        pack={makePack({ expiryDate: '2026-06-01' })}
        remaining={18}
        onPress={noop}
        onCheckIn={noop}
        now={NOW}
      />,
    );
    const label = screen.getByText(/^Expires in /);
    expect(label).toHaveStyle({ color: paperLightTheme.colors.onSurfaceVariant });
  });

  it('highlights the expiry line once inside the expiring-soon window', async () => {
    await render(
      <PackCard
        pack={makePack({ expiryDate: '2026-01-20' })}
        remaining={18}
        onPress={noop}
        onCheckIn={noop}
        now={NOW}
      />,
    );
    const label = screen.getByText(/^Expires in /);
    expect(label).toHaveStyle({ color: paperLightTheme.colors.tertiary });
  });

  it('shows an "Expired" line, in the error color, once the date has passed', async () => {
    await render(
      <PackCard
        pack={makePack({ expiryDate: '2026-01-01' })}
        remaining={5}
        onPress={noop}
        onCheckIn={noop}
        now={NOW}
      />,
    );
    const label = screen.getByText(/^Expired /);
    expect(label).toHaveStyle({ color: paperLightTheme.colors.error });
  });

  it('calls onCheckIn when the swipe-revealed action is pressed', async () => {
    const onCheckIn = jest.fn();
    await render(
      <PackCard pack={makePack()} remaining={18} onPress={noop} onCheckIn={onCheckIn} now={NOW} />,
    );
    await fireEvent.press(screen.getByLabelText('Use a session for Coworking'));
    expect(onCheckIn).toHaveBeenCalledTimes(1);
  });

  it('disables the swipe action once there are no sessions left', async () => {
    const onCheckIn = jest.fn();
    await render(
      <PackCard pack={makePack()} remaining={0} onPress={noop} onCheckIn={onCheckIn} now={NOW} />,
    );
    expect(screen.getByLabelText('Use a session for Coworking')).toBeDisabled();
  });
});
