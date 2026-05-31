/**
 * Multi-Page Forms Type Definitions
 * Enables splitting long forms into multiple pages/steps
 */

export interface FormPage {
  id: string;
  title: string;
  description?: string;
  order: number;
  fieldIds: string[]; // IDs of fields on this page
  conditionalDisplay?: {
    sourceFieldId: string;
    operator: 'equals' | 'not_equals' | 'contains';
    value: string | number;
  };
}

export interface ProgressStyle {
  type: 'bar' | 'steps' | 'percentage' | 'none';
  showLabels: boolean;
  showNumbers: boolean;
  position: 'top' | 'bottom';
}

export interface MultiPageSettings {
  enabled: boolean;
  pages: FormPage[];
  progressStyle: ProgressStyle;
  allowBackNavigation: boolean;
  saveProgress: boolean;
  showPageTitles: boolean;
  validateOnPageChange: boolean;
}

export const DEFAULT_PROGRESS_STYLE: ProgressStyle = {
  type: 'steps',
  showLabels: true,
  showNumbers: true,
  position: 'top',
};

export const DEFAULT_MULTI_PAGE_SETTINGS: MultiPageSettings = {
  enabled: false,
  pages: [],
  progressStyle: DEFAULT_PROGRESS_STYLE,
  allowBackNavigation: true,
  saveProgress: false,
  showPageTitles: true,
  validateOnPageChange: true,
};

// Helper function to get current page based on field visibility
export const getCurrentPage = (
  pages: FormPage[],
  currentFieldId: string
): FormPage | null => {
  return pages.find(page => page.fieldIds.includes(currentFieldId)) || null;
};

// Helper function to get next page
export const getNextPage = (
  pages: FormPage[],
  currentPage: FormPage
): FormPage | null => {
  const sortedPages = [...pages].sort((a, b) => a.order - b.order);
  const currentIndex = sortedPages.findIndex(p => p.id === currentPage.id);
  return currentIndex < sortedPages.length - 1 ? sortedPages[currentIndex + 1] : null;
};

// Helper function to get previous page
export const getPreviousPage = (
  pages: FormPage[],
  currentPage: FormPage
): FormPage | null => {
  const sortedPages = [...pages].sort((a, b) => a.order - b.order);
  const currentIndex = sortedPages.findIndex(p => p.id === currentPage.id);
  return currentIndex > 0 ? sortedPages[currentIndex - 1] : null;
};

// Calculate form completion percentage
export const calculateProgress = (
  pages: FormPage[],
  currentPageId: string
): number => {
  const sortedPages = [...pages].sort((a, b) => a.order - b.order);
  const currentIndex = sortedPages.findIndex(p => p.id === currentPageId);
  if (currentIndex === -1) return 0;
  return Math.round(((currentIndex + 1) / sortedPages.length) * 100);
};

// Check if page should be displayed based on conditional logic
export const shouldDisplayPage = (
  page: FormPage,
  formValues: { [fieldId: string]: unknown }
): boolean => {
  if (!page.conditionalDisplay) return true;

  const { sourceFieldId, operator, value } = page.conditionalDisplay;
  const fieldValue = formValues[sourceFieldId];

  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'not_equals':
      return fieldValue !== value;
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
    default:
      return true;
  }
};
