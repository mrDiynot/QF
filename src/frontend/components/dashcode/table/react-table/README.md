# DashCode React-Table Components

Advanced data table components extracted from DashCode template, featuring sorting, filtering, pagination, and row selection powered by @tanstack/react-table v8.

## Overview

This directory contains two fully-featured table examples extracted from the DashCode template and adapted for Qualiflow AI:

- **Example 1**: Dropdown menu actions - traditional dropdown menu for row actions
- **Example 2**: Tooltip icon actions - modern tooltip-based icon buttons for row actions

Both examples include:
- Column sorting (ascending/descending)
- Real-time filtering by status
- Pagination with numbered page buttons
- Row selection with checkboxes
- Responsive table design
- Avatar images using placeholder service
- Status badges with color coding

## Features

### Core Table Features
- ✅ **Sorting**: Click column headers to sort ascending/descending
- ✅ **Filtering**: Real-time text-based filtering by status
- ✅ **Pagination**: Navigate through data with numbered page buttons
- ✅ **Row Selection**: Select individual rows or all rows at once
- ✅ **Responsive Design**: Works on mobile, tablet, and desktop

### UI Components Used
- Table (shadcn/ui)
- Avatar (shadcn/ui)
- Badge (shadcn/ui)
- Button (shadcn/ui)
- Checkbox (shadcn/ui)
- Input (shadcn/ui)
- DropdownMenu (shadcn/ui) - Example 1
- Tooltip (shadcn/ui) - Example 2

## Installation

### Dependencies

```bash
npm install @tanstack/react-table@^8.20.5 --legacy-peer-deps
```

All UI components are already available in Qualiflow AI.

### Files Structure

```
components/dashcode/table/react-table/
├── example1/               # Dropdown menu actions
│   ├── index.tsx          # Main table component
│   ├── columns.tsx        # Column definitions
│   ├── table-pagination.tsx # Pagination component
│   └── data.ts            # Sample data (50 rows)
├── example2/               # Tooltip icon actions
│   ├── index.tsx          # Main table component
│   ├── columns.tsx        # Column definitions
│   ├── table-pagination.tsx # Pagination component
│   └── data.ts            # Sample data (50 rows)
└── README.md              # This file
```

## Usage

### Example 1: Dropdown Menu Actions

```tsx
import ExampleOne from "@/components/dashcode/table/react-table/example1";

export default function MyPage() {
  return (
    <div className="container">
      <ExampleOne />
    </div>
  );
}
```

**Features:**
- Dropdown menu with View, Edit, Delete actions
- More traditional UI pattern
- Better for mobile devices (easier to tap)

### Example 2: Tooltip Icon Actions

```tsx
import ExampleTwo from "@/components/dashcode/table/react-table/example2";

export default function MyPage() {
  return (
    <div className="container">
      <ExampleTwo />
    </div>
  );
}
```

**Features:**
- Individual icon buttons with tooltips
- More modern, compact UI
- Better for desktop (visible at a glance)

## Customization Guide

### Using Your Own Data

Replace the imported data with your own:

```tsx
// Instead of:
import { data } from "./data"

// Use your own data:
const data = [
  {
    id: 1,
    order: 123,
    customer: {
      name: "John Doe",
      image: "https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff&size=128"
    },
    date: "2025-01-15",
    quantity: 5,
    amount: "$599.99",
    status: "paid",
    action: null
  },
  // ...more rows
];
```

### Customizing Columns

Edit `columns.tsx` to add/remove/modify columns:

```tsx
export const columns: ColumnDef<DataProps>[] = [
  // ... existing columns ...

  // Add a new column:
  {
    accessorKey: "newField",
    header: "New Field",
    cell: ({ row }) => {
      return <span>{row.getValue("newField")}</span>
    }
  }
];
```

### Changing Avatar Service

By default, avatars use ui-avatars.com. To use your own images:

```tsx
// In data.ts, replace:
image: "https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff&size=128"

// With your own image URL:
image: "/uploads/avatars/john-doe.jpg"
```

### Customizing Status Colors

Edit the `statusColors` object in `columns.tsx`:

```tsx
const statusColors: Record<string, string> = {
  paid: "bg-success/20 text-success",
  due: "bg-warning/20 text-warning",
  canceled: "bg-destructive/20 text-destructive",
  // Add new status:
  pending: "bg-blue-500/20 text-blue-500"
};
```

### Modifying Pagination

Edit `table-pagination.tsx` to customize pagination:

```tsx
// Change items per page (in index.tsx):
const table = useReactTable({
  // ... other options ...
  initialState: {
    pagination: {
      pageSize: 20, // Default is 10
    },
  },
});
```

## Compatibility Matrix

| Technology | Version | Status |
|-----------|---------|--------|
| React | 19.1.0 | ✅ Compatible |
| Next.js | 16.1.1 | ✅ Compatible |
| @tanstack/react-table | 8.20.5+ | ✅ Compatible |
| Lucide React | Latest | ✅ Compatible |
| TypeScript | 5.x | ✅ Compatible |

## Modifications from DashCode

The following changes were made to adapt DashCode components for Qualiflow AI:

### 1. Avatar Images
- **Original**: Static image paths (`/images/avatar/avatar-1.png`)
- **Modified**: Dynamic placeholder service (`https://ui-avatars.com/api/?name=...`)

### 2. Color Classes
- `text-default-600` → `text-muted-foreground`
- `text-default-800` → `text-foreground`
- `text-default-900` → `text-foreground`
- `text-default-700` → `text-muted-foreground`
- `text-default-400` → `text-muted-foreground`
- `border-default-200` → `border-border`
- `bg-default-200` → `bg-secondary`

### 3. Component Compatibility
- All DashCode UI components already exist in Qualiflow AI
- No icon mapping needed (both use Lucide React)

## Known Issues

None - all features working as expected with React 19 and Next.js 16.

## Testing

Visit the test page to verify all features:

```
http://localhost:3000/test-react-table
```

### Manual Test Checklist

- [ ] Both table examples render without errors
- [ ] Sorting works (click column headers)
- [ ] Filtering works (type in status filter input)
- [ ] Pagination navigates through pages correctly
- [ ] Row selection works (checkboxes functional)
- [ ] Select all checkbox toggles all rows
- [ ] Example 1: Action dropdown menu displays
- [ ] Example 2: Tooltip icons display on hover
- [ ] Avatars display correctly
- [ ] Status badges show correct colors
- [ ] Responsive layout works
- [ ] No console errors or warnings

## API Reference

### DataProps Type

```typescript
export type DataProps = {
  id: string | number;
  order: number;
  customer: {
    name: string;
    image: string;
  };
  date: string;
  quantity: number;
  amount: string;
  status: "paid" | "due" | "canceled";
  action: React.ReactNode;
}
```

## Performance Tips

1. **Large Datasets**: Consider implementing server-side pagination for datasets > 1000 rows
2. **Virtual Scrolling**: For very large tables, consider using @tanstack/react-virtual
3. **Memoization**: Use React.memo for custom cell renderers if performance issues occur

## Future Enhancements

Potential improvements for future iterations:

- [ ] Add column visibility toggle
- [ ] Add column resizing
- [ ] Add column reordering (drag & drop)
- [ ] Add export to CSV/Excel
- [ ] Add advanced filtering (multiple columns, operators)
- [ ] Add server-side pagination
- [ ] Add bulk actions for selected rows
- [ ] Add row expansion for details

## Support

For issues or questions:
- Check the test page: `/test-react-table`
- Review @tanstack/react-table docs: https://tanstack.com/table/latest
- Check Qualiflow AI UI components documentation

## License

Extracted from DashCode template - see DashCode license for original component licensing.
