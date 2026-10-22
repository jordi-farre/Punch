import SettingsScreen from '@/app/settings';
import { render, screen } from '@/test-utils/render';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('expo-constants', () => ({
  expoConfig: { version: '1.2.0', extra: { buildProfile: 'production' } },
}));

describe('viewing the app version', () => {
  it('shows the app version in settings', async () => {
    await render(<SettingsScreen />);
    expect(screen.getByText('Punch 1.2.0')).toBeOnTheScreen();
  });
});
