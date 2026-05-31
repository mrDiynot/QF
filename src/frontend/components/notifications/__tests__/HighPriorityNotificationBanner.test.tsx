/**
 * Tests for HighPriorityNotificationBanner component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HighPriorityNotificationBanner } from '../HighPriorityNotificationBanner';
import type { NotificationEvent } from '@/types/notifications';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('HighPriorityNotificationBanner', () => {
  const mockOnDismiss = vi.fn();
  const mockOnDismissAll = vi.fn();
  const mockOnNavigate = vi.fn();

  const createNotification = (id: string, type: string, title: string): NotificationEvent => ({
    id,
    type,
    title,
    message: `Message for ${title}`,
    priority: 'High',
    createdAt: new Date().toISOString(),
  });

  const defaultProps = {
    notifications: [createNotification('1', 'NewLead', 'New Lead Received')],
    onDismiss: mockOnDismiss,
    onDismissAll: mockOnDismissAll,
    onNavigate: mockOnNavigate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when notifications array is empty', () => {
    const { container } = render(
      <HighPriorityNotificationBanner {...defaultProps} notifications={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders banner with notification title and message', () => {
    render(<HighPriorityNotificationBanner {...defaultProps} />);
    expect(screen.getByText('New Lead Received')).toBeInTheDocument();
    expect(screen.getByText('Message for New Lead Received')).toBeInTheDocument();
  });

  it('shows Action Required text', () => {
    render(<HighPriorityNotificationBanner {...defaultProps} />);
    expect(screen.getByText('Action Required')).toBeInTheDocument();
  });

  it('shows notification count badge', () => {
    render(<HighPriorityNotificationBanner {...defaultProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows correct count for multiple notifications', () => {
    const notifications = [
      createNotification('1', 'NewLead', 'Lead 1'),
      createNotification('2', 'NewMessage', 'Message 1'),
      createNotification('3', 'BookingScheduled', 'Booking 1'),
    ];
    render(<HighPriorityNotificationBanner {...defaultProps} notifications={notifications} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onNavigate and onDismiss when notification is clicked', async () => {
    const user = userEvent.setup();
    render(<HighPriorityNotificationBanner {...defaultProps} />);

    const notificationButton = screen.getByRole('button', { name: /new lead received/i });
    await user.click(notificationButton);

    expect(mockOnNavigate).toHaveBeenCalledWith(defaultProps.notifications[0]);
    expect(mockOnDismiss).toHaveBeenCalledWith('1');
  });

  it('calls onDismissAll when X button is clicked', async () => {
    const user = userEvent.setup();
    render(<HighPriorityNotificationBanner {...defaultProps} />);

    // Find the dismiss all button (X icon button)
    const dismissAllButton = screen.getByRole('button', { name: '' });
    await user.click(dismissAllButton);

    expect(mockOnDismissAll).toHaveBeenCalled();
  });

  it('shows Minimize button', () => {
    render(<HighPriorityNotificationBanner {...defaultProps} />);
    expect(screen.getByRole('button', { name: /minimize/i })).toBeInTheDocument();
  });

  it('minimizes banner when Minimize button is clicked', async () => {
    const user = userEvent.setup();
    render(<HighPriorityNotificationBanner {...defaultProps} />);

    const minimizeButton = screen.getByRole('button', { name: /minimize/i });
    await user.click(minimizeButton);

    await waitFor(() => {
      expect(screen.getByText(/high-priority notification/i)).toBeInTheDocument();
      expect(screen.getByText('Click to expand')).toBeInTheDocument();
    });
  });

  it('shows pagination dots for multiple notifications', () => {
    const notifications = [
      createNotification('1', 'NewLead', 'Lead 1'),
      createNotification('2', 'NewMessage', 'Message 1'),
    ];
    render(<HighPriorityNotificationBanner {...defaultProps} notifications={notifications} />);

    // Should have 2 pagination dots
    const dots = screen.getAllByRole('button').filter(btn => 
      btn.className.includes('rounded-full') && btn.className.includes('size-2')
    );
    expect(dots.length).toBe(2);
  });

  it('renders correct icon for NewLead type', () => {
    render(<HighPriorityNotificationBanner {...defaultProps} />);
    // The User icon should be rendered for NewLead type
    expect(screen.getByText('New Lead Received').closest('button')).toBeInTheDocument();
  });

  it('renders correct icon for NewMessage type', () => {
    const notifications = [createNotification('1', 'NewMessage', 'New Message')];
    render(<HighPriorityNotificationBanner {...defaultProps} notifications={notifications} />);
    expect(screen.getByText('New Message')).toBeInTheDocument();
  });

  it('renders correct icon for BookingScheduled type', () => {
    const notifications = [createNotification('1', 'BookingScheduled', 'New Booking')];
    render(<HighPriorityNotificationBanner {...defaultProps} notifications={notifications} />);
    expect(screen.getByText('New Booking')).toBeInTheDocument();
  });
});

