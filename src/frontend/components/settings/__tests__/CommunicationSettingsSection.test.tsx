import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommunicationSettingsSection } from '../CommunicationSettingsSection';
import * as communicationSettingsService from '@/services/api/communication-settings.service';

// Mock the service
vi.mock('@/services/api/communication-settings.service');

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('CommunicationSettingsSection', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <CommunicationSettingsSection />
      </QueryClientProvider>
    );
  };

  it('renders loading spinner initially', () => {
    vi.mocked(communicationSettingsService.communicationSettingsService.get).mockImplementation(
      () => new Promise(() => {})
    );

    renderComponent();
    // Component shows a spinner (svg) during loading, not text
    expect(document.querySelector('svg.animate-spin')).toBeInTheDocument();
  });

  it('renders communication settings form when data is loaded', async () => {
    const mockSettings = {
      email: {
        senderName: 'Qualiflow AI Support',
        replyToEmail: 'support@qualiflow.ai',
        signature: 'Best regards',
      },
      sms: {
        defaultSender: '+12025551234',
        optOutMessage: 'Reply STOP to unsubscribe',
        enableAutoReply: true,
      },
      voice: {
        businessHours: '9 AM - 5 PM EST',
        voicemailEnabled: true,
        callForwardingNumber: '+12025555678',
      },
      updatedAt: '2025-12-09T19:00:00Z',
    };

    vi.mocked(communicationSettingsService.communicationSettingsService.get).mockResolvedValue(
      mockSettings
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Qualiflow AI Support')).toBeInTheDocument();
      expect(screen.getByDisplayValue('support@qualiflow.ai')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+12025551234')).toBeInTheDocument();
    });
  });

  it('updates email settings successfully', async () => {
    const user = userEvent.setup();
    const mockSettings = {
      email: {
        senderName: 'Qualiflow AI',
        replyToEmail: 'noreply@qualiflow.ai',
        signature: '',
      },
      sms: { defaultSender: '', optOutMessage: '', enableAutoReply: false },
      voice: { businessHours: '', voicemailEnabled: false, callForwardingNumber: undefined },
      updatedAt: '2025-12-09T19:00:00Z',
    };

    vi.mocked(communicationSettingsService.communicationSettingsService.get).mockResolvedValue(
      mockSettings
    );
    vi.mocked(communicationSettingsService.communicationSettingsService.update).mockResolvedValue(
      mockSettings
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Qualiflow AI')).toBeInTheDocument();
    });

    const senderNameInput = screen.getByDisplayValue('Qualiflow AI');
    await user.clear(senderNameInput);
    await user.type(senderNameInput, 'Qualiflow AI Support Team');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(communicationSettingsService.communicationSettingsService.update).toHaveBeenCalled();
    });
  });

  it('renders form when loading fails (with empty defaults)', async () => {
    // The component doesn't show an error state, it just renders with empty defaults
    vi.mocked(communicationSettingsService.communicationSettingsService.get).mockRejectedValue(
      new Error('Failed to load settings')
    );

    renderComponent();

    // Component renders with empty form fields when loading fails
    await waitFor(() => {
      expect(screen.getByLabelText(/sender name/i)).toBeInTheDocument();
    });
  });

  it('calls update mutation when save button is clicked', async () => {
    const user = userEvent.setup();
    const mockSettings = {
      email: { senderName: 'Test', replyToEmail: 'test@example.com', signature: 'Best' },
      sms: { defaultSender: '+12025551234', optOutMessage: 'STOP', enableAutoReply: false },
      voice: { businessHours: '9-5', voicemailEnabled: false, callForwardingNumber: undefined },
      updatedAt: '2025-12-09T19:00:00Z',
    };

    vi.mocked(communicationSettingsService.communicationSettingsService.get).mockResolvedValue(
      mockSettings
    );
    vi.mocked(communicationSettingsService.communicationSettingsService.update).mockResolvedValue(
      mockSettings
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/reply-to email/i)).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(communicationSettingsService.communicationSettingsService.update).toHaveBeenCalled();
    });
  });
});

