import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CmsPage from '../page';

// Mock the hooks
vi.mock('@/hooks/admin', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/admin')>();

  const mockFaqsData = [
    { id: 'faq_001', question: 'How do I get started?', answer: 'Sign up and follow the wizard.', category: 'General', isActive: true, displayOrder: 1 },
    { id: 'faq_002', question: 'How do I cancel?', answer: 'Go to settings and click cancel.', category: 'Billing', isActive: true, displayOrder: 2 },
  ];

  const mockTestimonialsData = [
    { id: 'test_001', quote: 'Great product!', authorName: 'John Doe', authorRole: 'CEO', companyName: 'Acme', rating: 5, isActive: true, displayOrder: 1 },
  ];

  const mockPagesData: never[] = [];
  const mockStatisticsData: never[] = [];
  const mockCompaniesData: never[] = [];
  const mockPricingAddOnsData: never[] = [];
  const mockFeatureComparisonsData: never[] = [];

  return {
    ...actual,
    useFaqs: vi.fn(() => ({
      data: mockFaqsData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    })),
    useCreateFaq: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useUpdateFaq: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useDeleteFaq: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useTestimonials: vi.fn(() => ({
      data: mockTestimonialsData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    })),
    useCreateTestimonial: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useUpdateTestimonial: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useDeleteTestimonial: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useCmsPages: vi.fn(() => ({
      data: mockPagesData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    })),
    useCreateCmsPage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useUpdateCmsPage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useDeleteCmsPage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useStatistics: vi.fn(() => ({
      data: mockStatisticsData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    })),
    useUpdateStatistic: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useTrustedCompanies: vi.fn(() => ({
      data: mockCompaniesData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    })),
    useUpdateTrustedCompany: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    usePricingAddOns: vi.fn(() => ({
      data: mockPricingAddOnsData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    })),
    useUpdatePricingAddOn: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useFeatureComparisons: vi.fn(() => ({
      data: mockFeatureComparisonsData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    })),
    useUpdateFeatureComparison: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  };
});

vi.mock('@/lib/admin-mock-data', () => ({
  mockFaqs: [],
  mockTestimonials: [],
}));

describe('CmsPage', () => {
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

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <CmsPage />
      </QueryClientProvider>
    );
  };

  it('renders the CMS page', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Content Management')).toBeInTheDocument();
    });
  });

  it('displays tabs for different content types', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('FAQs')).toBeInTheDocument();
      expect(screen.getByText('Testimonials')).toBeInTheDocument();
    });
  });

  it('displays FAQ list', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('How do I get started?')).toBeInTheDocument();
      expect(screen.getByText('How do I cancel?')).toBeInTheDocument();
    });
  });

  it('displays FAQ categories', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Billing')).toBeInTheDocument();
    });
  });

  it('renders add FAQ button', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add faq/i })).toBeInTheDocument();
    });
  });

  it('renders refresh button', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });
  });

  it('renders edit buttons for FAQs', async () => {
    renderPage();

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: '' });
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });
});
