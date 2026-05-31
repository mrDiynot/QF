/**
 * Tests for NotificationPreferencesPanel component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationPreferencesPanel } from '../NotificationPreferencesPanel';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/notification-preferences';
import type { NotificationPreferences } from '@/types/notification-preferences';

describe('NotificationPreferencesPanel', () => {
  const mockOnUpdate = vi.fn();
  const mockOnRequestPushPermission = vi.fn();

  const defaultProps = {
    preferences: DEFAULT_NOTIFICATION_PREFERENCES,
    onUpdate: mockOnUpdate,
    pushPermission: 'default' as NotificationPermission,
    onRequestPushPermission: mockOnRequestPushPermission,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the preferences panel with title', () => {
    render(<NotificationPreferencesPanel {...defaultProps} />);
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    expect(screen.getByText('Configure how and when you receive notifications')).toBeInTheDocument();
  });

  it('renders all three tabs', () => {
    render(<NotificationPreferencesPanel {...defaultProps} />);
    expect(screen.getByRole('tab', { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /categories/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /schedule/i })).toBeInTheDocument();
  });

  it('shows master toggle in general tab', () => {
    render(<NotificationPreferencesPanel {...defaultProps} />);
    expect(screen.getByText('Enable Notifications')).toBeInTheDocument();
    expect(screen.getByText('Master switch for all notifications')).toBeInTheDocument();
  });

  it('calls onUpdate when master toggle is changed', async () => {
    const user = userEvent.setup();
    render(<NotificationPreferencesPanel {...defaultProps} />);

    const masterSwitch = screen.getAllByRole('switch')[0];
    await user.click(masterSwitch);

    expect(mockOnUpdate).toHaveBeenCalledWith({ enabled: false });
  });

  it('shows Enable button when push permission is default', () => {
    render(<NotificationPreferencesPanel {...defaultProps} />);
    expect(screen.getByRole('button', { name: /enable/i })).toBeInTheDocument();
  });

  it('shows Enabled badge when push permission is granted', () => {
    render(<NotificationPreferencesPanel {...defaultProps} pushPermission="granted" />);
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('shows Blocked badge when push permission is denied', () => {
    render(<NotificationPreferencesPanel {...defaultProps} pushPermission="denied" />);
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  it('shows Not Supported badge when push is unsupported', () => {
    render(<NotificationPreferencesPanel {...defaultProps} pushPermission="unsupported" />);
    expect(screen.getByText('Not Supported')).toBeInTheDocument();
  });

  it('calls onRequestPushPermission when Enable button is clicked', async () => {
    const user = userEvent.setup();
    mockOnRequestPushPermission.mockResolvedValue('granted');
    render(<NotificationPreferencesPanel {...defaultProps} />);

    const enableButton = screen.getByRole('button', { name: /enable/i });
    await user.click(enableButton);

    expect(mockOnRequestPushPermission).toHaveBeenCalled();
  });

  it('shows volume slider when sound is enabled', () => {
    render(<NotificationPreferencesPanel {...defaultProps} />);
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('hides volume slider when sound is disabled', () => {
    const prefs: NotificationPreferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      soundEnabled: false,
    };
    render(<NotificationPreferencesPanel {...defaultProps} preferences={prefs} />);
    expect(screen.queryByText('Volume')).not.toBeInTheDocument();
  });

  it('switches to categories tab and shows category list', async () => {
    const user = userEvent.setup();
    render(<NotificationPreferencesPanel {...defaultProps} />);

    const categoriesTab = screen.getByRole('tab', { name: /categories/i });
    await user.click(categoriesTab);

    await waitFor(() => {
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Bookings')).toBeInTheDocument();
    });
  });

  it('switches to schedule tab and shows quiet hours toggle', async () => {
    const user = userEvent.setup();
    render(<NotificationPreferencesPanel {...defaultProps} />);

    const scheduleTab = screen.getByRole('tab', { name: /schedule/i });
    await user.click(scheduleTab);

    await waitFor(() => {
      expect(screen.getByText('Quiet Hours')).toBeInTheDocument();
      expect(screen.getByText('Mute non-urgent notifications during these hours')).toBeInTheDocument();
    });
  });

  it('shows time inputs when quiet hours is enabled', async () => {
    const user = userEvent.setup();
    const prefs: NotificationPreferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      quietHoursEnabled: true,
    };
    render(<NotificationPreferencesPanel {...defaultProps} preferences={prefs} />);

    const scheduleTab = screen.getByRole('tab', { name: /schedule/i });
    await user.click(scheduleTab);

    await waitFor(() => {
      expect(screen.getByText('Start')).toBeInTheDocument();
      expect(screen.getByText('End')).toBeInTheDocument();
    });
  });
});

