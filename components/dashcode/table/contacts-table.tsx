"use client"

/**
 * Contacts Table Component with DashCode Styling
 *
 * Displays CRM contacts in a sortable, filterable table format.
 * Replaces the card-based layout with a more data-dense table view.
 */

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Mail, Phone, Calendar, Eye, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DataTable } from "./data-table"
import { cn } from "@/lib/utils"

// Contact type matching the CRM page data structure
export type Contact = {
  id: string
  initials: string
  name: string
  email: string
  phone: string
  score: number
  status: string
  tags: string[]
  aiAssigned: boolean
  manuallyAssigned: boolean
  date: string
}

/**
 * Column definitions for the contacts table
 */
export const contactColumns: ColumnDef<Contact>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent pl-0"
        >
          Contact
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const initials = row.original.initials
      const name = row.getValue("name") as string
      const email = row.original.email

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{name}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const score = row.original.score

      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={
              status === "hot"
                ? "destructive"
                : status === "warm"
                ? "default"
                : "secondary"
            }
            className={cn(
              "capitalize",
              status === "hot" && "bg-red-500 hover:bg-red-600",
              status === "warm" && "bg-orange-500 hover:bg-orange-600",
              status === "cold" && "bg-muted/300 hover:bg-info"
            )}
          >
            {status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Score: <span className="font-medium text-foreground">{score}</span>
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string
      return (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          {phone || "—"}
        </div>
      )
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[]

      return (
        <div className="flex flex-wrap gap-1">
          {tags.length > 0 ? (
            tags.slice(0, 2).map((tag, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="text-xs bg-muted/30 text-info border-border"
              >
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dateStr = row.getValue("date") as string
      if (!dateStr) return <span className="text-sm text-muted-foreground">—</span>

      try {
        const date = new Date(dateStr)
        return (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {format(date, "MMM d, yyyy")}
          </div>
        )
      } catch {
        return <span className="text-sm text-muted-foreground">—</span>
      }
    },
  },
  {
    accessorKey: "assignment",
    header: "Assignment",
    cell: ({ row }) => {
      const aiAssigned = row.original.aiAssigned
      const manuallyAssigned = row.original.manuallyAssigned

      return (
        <div className="flex items-center gap-1">
          {aiAssigned && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              AI
            </Badge>
          )}
          {manuallyAssigned && (
            <Badge variant="outline" className="text-xs bg-muted/30 text-cyan-700 border-cyan-200">
              Manual
            </Badge>
          )}
          {!aiAssigned && !manuallyAssigned && (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contact = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(contact.email)}
            >
              <Mail className="mr-2 h-4 w-4" />
              Copy email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Send email
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Phone className="mr-2 h-4 w-4" />
              Call contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface ContactsTableProps {
  data: Contact[]
  onRowClick?: (contact: Contact) => void
}

/**
 * Contacts Table Component
 *
 * Renders contacts in a table format using DashCode DataTable.
 */
export function ContactsTable({ data, onRowClick }: ContactsTableProps) {
  return (
    <DataTable
      columns={contactColumns}
      data={data}
      searchPlaceholder="Search contacts by name or email..."
      searchKey="name"
      onRowClick={onRowClick}
      enableRowSelection={false}
      enableColumnVisibility={true}
      enablePagination={true}
      pageSize={10}
    />
  )
}
