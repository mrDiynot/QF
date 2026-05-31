# Admin UI Component Library - Standardized Design System

## Overview

This is the **complete standardized design system** for the QualiFlow AI Admin Portal. Every component uses consistent spacing, colors, typography, and interaction patterns to ensure a polished, professional experience across all pages.

## 🎨 Design Principles

### 1. **Zero Deviations**
- All components use CSS variables from `globals.css` admin theme
- No hardcoded colors, spacing, or typography values
- Consistent hover, focus, and active states

### 2. **Theme-Aware**
- Full support for light and dark themes
- System theme detection
- Smooth transitions (200ms)

### 3. **Accessibility First**
- WCAG AAA compliance
- Keyboard navigation
- Screen reader support
- Proper focus management

### 4. **Production Ready**
- TypeScript support
- Proper error handling
- Loading states
- Empty states

---

## 📦 Core Components

### DataTable

The **single standardized component** for all data tables in the admin portal.

```tsx
import { DataTable, type DataTableColumn } from '@/components/admin/ui';

// Define columns
const columns: DataTableColumn<YourDataType>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    render: (row) => <span>{row.name}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <StatusBadge status={row.status} variant="success" />,
  },
  {
    key: 'actions',
    label: 'Actions',
    align: 'right',
    render: (row) => <RowActionsMenu actions={getActions(row)} />,
  },
];

// Use in component
<DataTable
  data={items}
  columns={columns}
  getRowKey={(row) => row.id}
  loading={isLoading}
  selectable
  selectedRows={selectedRows}
  onSelectionChange={setSelectedRows}
  sortBy={sortBy}
  sortDirection={sortDirection}
  onSortChange={handleSortChange}
  emptyState={<AdminEmptyState {...emptyProps} />}
/>
```

**Features:**
- ✅ Sorting (clickable column headers)
- ✅ Row selection (checkboxes)
- ✅ Loading state (skeleton)
- ✅ Empty state
- ✅ Mobile responsive
- ✅ Theme-aware
- ✅ Hover effects
- ✅ Custom cell rendering

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `data` | `T[]` | Array of data items |
| `columns` | `DataTableColumn<T>[]` | Column definitions |
| `getRowKey` | `(row: T) => string \| number` | Unique key extractor |
| `loading` | `boolean` | Show loading skeleton |
| `selectable` | `boolean` | Enable row selection |
| `selectedRows` | `Set<string \| number>` | Selected row keys |
| `onSelectionChange` | `(keys: Set) => void` | Selection handler |
| `sortBy` | `string` | Current sort column |
| `sortDirection` | `'asc' \| 'desc'` | Sort direction |
| `onSortChange` | `(col, dir) => void` | Sort handler |
| `onRowClick` | `(row: T) => void` | Row click handler |
| `emptyState` | `ReactNode` | Custom empty state |

---

### Pagination

Advanced pagination with page numbers and size selector.

```tsx
import { Pagination } from '@/components/admin/ui';

<Pagination
  currentPage={page}
  totalPages={totalPages}
  totalItems={totalCount}
  pageSize={pageSize}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  pageSizeOptions={[10, 20, 50, 100]}
/>
```

**Features:**
- ✅ Page number buttons (with ellipsis for many pages)
- ✅ First/Last page buttons
- ✅ Previous/Next buttons
- ✅ Items per page selector
- ✅ "Showing X-Y of Z" indicator
- ✅ Theme-aware
- ✅ Disabled states

---

### FilterBar

Unified filter and search component.

```tsx
import { FilterBar } from '@/components/admin/ui';

const filters = [
  {
    key: 'status',
    label: 'Status',
    value: statusFilter,
    onChange: setStatusFilter,
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
    ],
  },
];

<FilterBar
  searchValue={search}
  onSearchChange={setSearch}
  searchPlaceholder="Search..."
  filters={filters}
  actions={<Button>Create</Button>}
/>
```

---

### BulkActionsToolbar

Sticky toolbar for bulk operations.

```tsx
import { BulkActionsToolbar } from '@/components/admin/ui';

const bulkActions = [
  {
    label: 'Export',
    icon: Download,
    onClick: () => console.log('Export'),
  },
  {
    label: 'Delete',
    icon: Trash2,
    onClick: () => console.log('Delete'),
    variant: 'destructive',
  },
];

<BulkActionsToolbar
  selectedCount={selectedRows.size}
  onClearSelection={() => setSelectedRows(new Set())}
  actions={bulkActions}
/>
```

---

### RowActionsMenu

Dropdown menu for row-level actions.

```tsx
import { RowActionsMenu, type RowAction } from '@/components/admin/ui';

const actions: RowAction[] = [
  {
    label: 'View Details',
    icon: ExternalLink,
    onClick: () => navigate(`/details/${row.id}`),
  },
  {
    label: 'Delete',
    icon: Trash2,
    onClick: () => handleDelete(row),
    variant: 'destructive',
    separator: true, // Add separator before this item
  },
];

<RowActionsMenu actions={actions} />
```

---

### StatusBadge

Semantic status badges with consistent colors.

```tsx
import { StatusBadge, BusinessStatusBadge } from '@/components/admin/ui';

// Generic status badge
<StatusBadge status="Active" variant="success" icon={CheckCircle} />

// Pre-configured badge for businesses
<BusinessStatusBadge status="active" />

// Pre-configured badge for subscriptions
<SubscriptionStatusBadge status="trialing" />

// Pre-configured badge for tickets
<TicketStatusBadge status="open" />
<TicketPriorityBadge priority="high" />
```

**Variant Colors (Fixed System):**

| Variant | Background | Text Color | Use Case |
|---------|------------|------------|----------|
| `success` | `bg-success-10` | `text-admin-success` | Active, completed |
| `warning` | `bg-warning-10` | `text-admin-warning` | Trial, pending |
| `error` | `bg-danger-10` | `text-admin-error` | Suspended, failed |
| `info` | `bg-info-10` | `text-admin-info` | Info messages |
| `neutral` | `bg-admin-muted` | `text-admin-muted-foreground` | Canceled, inactive |

**RULE:** Use semantic variants only. No custom badge colors.

---

### PageHeader

Standardized page header with title, description, and actions.

```tsx
import { PageHeader } from '@/components/admin/ui';

<PageHeader
  title="Businesses"
  description="Manage all businesses on the platform"
  isError={isError}
  errorMessage="API Error"
  onRefresh={refetch}
  isRefreshing={isRefetching}
  actions={<Button>Create Business</Button>}
/>
```

---

### EmptyState

Consistent empty state component.

```tsx
import { AdminEmptyState } from '@/components/admin/ui/EmptyState';

<AdminEmptyState
  icon={Inbox}
  title="No businesses found"
  description="Try adjusting your filters or create a new business"
  action={{
    label: "Create Business",
    icon: Plus,
    onClick: handleCreate,
  }}
  secondaryAction={{
    label: "Clear Filters",
    onClick: handleClearFilters,
  }}
  size="lg"
/>
```

---

### LoadingTable

Skeleton loader for tables.

```tsx
import { LoadingTable } from '@/components/admin/ui';

// Used automatically in DataTable when loading={true}
// Or use directly:
<LoadingTable rows={10} columns={6} />
```

---

## 🎯 Standard Page Template

Every list page should follow this exact structure:

```tsx
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DataTable,
  type DataTableColumn,
  Pagination,
  PageHeader,
  FilterBar,
  StatusBadge,
  BulkActionsToolbar,
  RowActionsMenu,
} from '@/components/admin/ui';

export default function YourPage() {
  // 1. State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 2. Data fetching
  const { data, isLoading, refetch, isRefetching } = useYourDataHook({
    search,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    pageSize,
  });

  const items = data?.items || [];
  const totalCount = data?.totalItems || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // 3. Columns definition
  const columns: DataTableColumn<YourType>[] = useMemo(() => [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => <span className="text-admin-foreground">{row.name}</span>,
    },
    // ... more columns
  ], []);

  // 4. Filters
  const filters = [
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [/* ... */],
    },
  ];

  // 5. Bulk actions
  const bulkActions = [
    {
      label: 'Export',
      icon: Download,
      onClick: () => console.log('Export'),
    },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Your Page"
        description="Description"
        onRefresh={refetch}
        isRefreshing={isRefreshing}
        actions={<Button>Create</Button>}
      />

      {/* Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        filters={filters}
      />

      {/* Bulk Actions */}
      <BulkActionsToolbar
        selectedCount={selectedRows.size}
        onClearSelection={() => setSelectedRows(new Set())}
        actions={bulkActions}
      />

      {/* Data Table */}
      <Card className="shadow-base bg-admin-card border-admin-border">
        <CardHeader>
          <CardTitle className="heading-3 text-admin-foreground">
            {totalCount} Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={items}
            columns={columns}
            getRowKey={(row) => row.id}
            loading={isLoading}
            selectable
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={(col, dir) => {
              setSortBy(col);
              setSortDirection(dir);
            }}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🎨 Design System Rules

### Spacing (4px Base Grid)

```tsx
// ✅ CORRECT - Use Tailwind spacing scale
<div className="p-6">      // 24px padding
<div className="gap-4">    // 16px gap
<div className="mt-8">     // 32px margin

// ❌ WRONG - No arbitrary values
<div className="p-[20px]">
<div className="gap-[15px]">
```

**Standard Spacing Values:**
- `1` = 4px - Tiny gaps (icon to text)
- `2` = 8px - Small gaps
- `4` = 16px - Standard gaps
- `6` = 24px - Card padding, sections
- `8` = 32px - Page padding
- `12` = 48px - Large sections
- `16` = 64px - XL spacing

---

### Typography

```tsx
// ✅ CORRECT - Use utility classes
<h1 className="display-2">Main Page Title</h1>
<h2 className="heading-1">Section Title</h2>
<h3 className="heading-2">Subsection</h3>
<h4 className="heading-3">Card Title</h4>
<p className="body-text">Standard text</p>
<p className="small-text">Secondary text</p>

// ❌ WRONG - Arbitrary sizes
<h1 className="text-3xl font-semibold">
<p className="text-[15px]">
```

---

### Colors

```tsx
// ✅ CORRECT - Admin CSS variables
className="bg-admin-card text-admin-foreground border-admin-border"
className="text-admin-primary"
className="hover:bg-admin-muted"

// ❌ WRONG - Hardcoded colors
className="bg-slate-800 text-white border-slate-700"
className="text-orange-500"
```

**Complete Color Variable List:**

| Variable | Use Case |
|----------|----------|
| `--admin-background` | Page background |
| `--admin-card` | Card backgrounds |
| `--admin-foreground` | Primary text |
| `--admin-muted-foreground` | Secondary text |
| `--admin-primary` | Orange brand (CTAs, links) |
| `--admin-accent` | Purple brand (accents) |
| `--admin-success` | Green (active, success) |
| `--admin-warning` | Amber (trial, warnings) |
| `--admin-error` | Red (errors, suspended) |
| `--admin-info` | Blue (info messages) |
| `--admin-border` | All borders |
| `--admin-muted` | Subtle backgrounds |
| `--admin-ring` | Focus ring (orange) |

---

### Shadows

```tsx
// ✅ CORRECT - Dashcode shadow utilities
<Card className="shadow-base">        // Subtle elevation
<Modal className="shadow-base2">      // Medium elevation
<Dropdown className="shadow-dropdown"> // Floating elements

// ❌ WRONG - Custom shadows
<Card className="shadow-lg">
<Modal className="shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
```

---

### Border Radius

```tsx
// ✅ CORRECT - Consistent radius
<Card className="rounded-xl">      // 12px - Cards, modals
<Button className="rounded-lg">    // 8px - Buttons, inputs
<Badge className="rounded-md">     // 6px - Badges

// ❌ WRONG - Arbitrary radius
<Card className="rounded-[10px]">
<Button className="rounded-2xl">
```

---

### Transitions

```tsx
// ✅ CORRECT - All components use 200ms
className="transition-all duration-200"
className="transition-colors duration-200"

// ❌ WRONG - Different durations
className="transition-all duration-300"
className="transition-colors duration-150"
```

**RULE:** All interactive elements use 200ms ease-in-out.

---

## 🌗 Theme System

### Using Theme Toggle

The AdminThemeToggle component is already integrated in the AdminHeader:

```tsx
import { AdminThemeToggle } from '@/components/admin/AdminThemeToggle';

// Already in AdminHeader - no need to add
<AdminThemeToggle />
```

### Using Theme Context

```tsx
import { useAdminTheme } from '@/contexts/AdminThemeContext';

function MyComponent() {
  const { theme, resolvedTheme, setTheme } = useAdminTheme();
  
  // theme: 'system' | 'light' | 'dark' (user preference)
  // resolvedTheme: 'light' | 'dark' (actual applied theme)
  
  return (
    <div>
      Current theme: {theme}
      Resolved theme: {resolvedTheme}
    </div>
  );
}
```

---

## ✅ Consistency Checklist

Before creating any new component or page:

- [ ] **Colors:** All colors use CSS variables (no hardcoded colors)
- [ ] **Spacing:** All spacing uses 4px grid (no arbitrary values)
- [ ] **Typography:** All text uses utility classes (no arbitrary sizes)
- [ ] **Buttons:** Uses standard variants (no custom styling)
- [ ] **Cards:** Uses standard styling (rounded-xl, p-6, shadow-base)
- [ ] **Badges:** Uses semantic colors (no custom colors)
- [ ] **Tables:** Uses DataTable component (no custom tables)
- [ ] **Pagination:** Uses Pagination component (no custom pagination)
- [ ] **Empty States:** Uses EmptyState component
- [ ] **Loading States:** Uses LoadingTable component
- [ ] **Hover:** Uses background color change only
- [ ] **Focus:** Uses orange ring (--admin-ring)
- [ ] **Transitions:** Uses 200ms ease-in-out
- [ ] **Theme:** Tested in both light and dark themes

---

## 🚀 Quick Start

1. **Import components:**
   ```tsx
   import {
     DataTable,
     Pagination,
     FilterBar,
     StatusBadge,
     PageHeader,
     BulkActionsToolbar,
     RowActionsMenu,
   } from '@/components/admin/ui';
   ```

2. **Follow the standard page template** (see above)

3. **Use CSS variables** for all colors

4. **Test in both themes** (light/dark)

5. **Check the consistency checklist**

---

## 📚 Examples

See the refactored **Businesses page** (`/admin/businesses/page.tsx`) for a complete reference implementation.

---

## 🎯 Goals

- ✅ **Zero visual deviations** - All pages look like the same product
- ✅ **Predictable behavior** - Same action always looks/behaves the same
- ✅ **Smooth interactions** - All transitions smooth and consistent
- ✅ **Theme-perfect** - Both light and dark themes look professional
- ✅ **Accessible** - WCAG AAA compliance
- ✅ **Production-ready** - No placeholder text, no debug styles

---

## 🤝 Contributing

When adding new components:

1. Use admin CSS variables for all colors
2. Follow the 4px spacing grid
3. Use typography utility classes
4. Support both light and dark themes
5. Include loading and empty states
6. Add to this documentation
7. Update the exports in `index.ts`
