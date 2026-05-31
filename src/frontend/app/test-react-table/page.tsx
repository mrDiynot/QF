"use client";

import ExampleOne from "@/components/dashcode/table/react-table/example1";
import ExampleTwo from "@/components/dashcode/table/react-table/example2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TestReactTablePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">DashCode React-Table Test Page</h1>
          <p className="text-muted-foreground">
            Testing advanced data tables with sorting, filtering, pagination, and row selection
          </p>
        </div>

        <Separator />

        {/* Test Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
            <CardDescription>
              Use this page to verify all React-Table features are working correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Manual Testing Checklist:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>✅ Both table examples render without errors</li>
                <li>✅ Sorting works (click column headers)</li>
                <li>✅ Filtering works (type in status filter input)</li>
                <li>✅ Pagination navigates through pages correctly</li>
                <li>✅ Row selection works (checkboxes functional)</li>
                <li>✅ Select all checkbox toggles all rows</li>
                <li>✅ Example 1: Action dropdown menu displays</li>
                <li>✅ Example 2: Tooltip icons display on hover</li>
                <li>✅ Avatars display correctly using placeholder service</li>
                <li>✅ Status badges show correct colors (paid=green, due=yellow, canceled=red)</li>
                <li>✅ Responsive layout on mobile/tablet/desktop</li>
                <li>✅ No console errors or warnings</li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Key Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>@tanstack/react-table v8 integration</li>
                <li>Column sorting (ascending/descending)</li>
                <li>Real-time filtering by status</li>
                <li>Pagination with numbered page buttons</li>
                <li>Row selection with checkboxes</li>
                <li>Two action patterns: Dropdown menu and Tooltip icons</li>
                <li>Avatar images using ui-avatars.com placeholder service</li>
                <li>Responsive table design</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Example 1: Dropdown Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Example 1: Dropdown Menu Actions</CardTitle>
            <CardDescription>
              Table with dropdown menu for row actions (View, Edit, Delete)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExampleOne />
          </CardContent>
        </Card>

        {/* Example 2: Tooltip Icon Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Example 2: Tooltip Icon Actions</CardTitle>
            <CardDescription>
              Table with tooltip-based icon buttons for row actions (View, Edit, Delete)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExampleTwo />
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
            <CardDescription>
              Implementation notes and component details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Component Structure:</h3>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                {`components/dashcode/table/react-table/
├── example1/               # Dropdown menu actions
│   ├── index.tsx          # Main table component
│   ├── columns.tsx        # Column definitions
│   ├── table-pagination.tsx # Pagination component
│   └── data.ts            # Sample data (50 rows)
└── example2/               # Tooltip icon actions
    ├── index.tsx          # Main table component
    ├── columns.tsx        # Column definitions
    ├── table-pagination.tsx # Pagination component
    └── data.ts            # Sample data (50 rows)`}
              </pre>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Dependencies:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>@tanstack/react-table@^8.20.5 (React 19 compatible)</li>
                <li>Lucide React icons (native compatibility)</li>
                <li>Qualiflow AI UI components (Table, Avatar, Badge, Button, Checkbox, Input, DropdownMenu, Tooltip)</li>
                <li>ui-avatars.com for placeholder avatar images</li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Modifications from DashCode:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>✅ Updated avatar image paths to use ui-avatars.com placeholder service</li>
                <li>✅ Mapped color classes to Qualiflow AI theme (text-default-* → text-muted-foreground/foreground)</li>
                <li>✅ Mapped border classes to Qualiflow AI theme (border-default-* → border-border)</li>
                <li>✅ Changed bg-default-200 to bg-secondary for table header</li>
                <li>✅ All features working with React 19 and Next.js 16</li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Known Issues:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>None - all features working as expected</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Related Test Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a href="/test-sidebar" className="text-primary hover:underline block">
                → Test DashCode Sidebar Components
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
