"use client"

/**
 * Conversations Table Component with DashCode Styling
 *
 * Displays conversations in a sortable, filterable table format.
 * Alternative view to the messaging-style layout.
 */

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MessageCircle, MoreHorizontal, Mail, Phone, MessageSquare, Globe, Instagram } from "lucide-react"

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

// Conversation type matching the conversations page data structure
export type Conversation = {
  id: string
  initials: string
  name: string
  channelType: string
  message: string
  time: string
  status: string
  unread: number
  aiAssigned: boolean
}

// Channel icon mapping
const channelIcons: Record<string, React.ReactNode> = {
  sms: <MessageSquare className="h-4 w-4" />,
  voice: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  whatsapp: <MessageCircle className="h-4 w-4" />,
  webchat: <Globe className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
}

// Channel color mapping
const channelColors: Record<string, string> = {
  sms: "bg-muted/50 text-info border-border",
  voice: "bg-green-100 text-green-700 border-green-200",
  email: "bg-primary/10 text-primary border-primary/20",
  whatsapp: "bg-emerald-100 text-emerald-700 border-emerald-200",
  webchat: "bg-orange-100 text-orange-700 border-orange-200",
  instagram: "bg-muted/50 text-foreground border-border",
}

/**
 * Column definitions for the conversations table
 */
export const conversationColumns: ColumnDef<Conversation>[] = [
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
      const unread = row.original.unread

      return (
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {unread > 0 && (
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{unread}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{name}</span>
            <span className="text-xs text-muted-foreground">{row.original.message}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "channelType",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          Channel
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const channel = row.getValue("channelType") as string
      const icon = channelIcons[channel] || channelIcons.sms
      const colorClass = channelColors[channel] || channelColors.sms

      return (
        <Badge
          variant="outline"
          className={cn("capitalize gap-1.5", colorClass)}
        >
          {icon}
          {channel}
        </Badge>
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

      return (
        <Badge
          variant={status === "active" ? "default" : "secondary"}
          className={cn(
            "capitalize",
            status === "active" && "bg-green-500 hover:bg-green-600",
            status === "closed" && "bg-muted/200 hover:bg-gray-600",
            status === "pending" && "bg-yellow-500 hover:bg-yellow-600"
          )}
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "aiAssigned",
    header: "Handler",
    cell: ({ row }) => {
      const aiAssigned = row.getValue("aiAssigned") as boolean

      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5",
            aiAssigned
              ? "bg-primary/5 text-primary border-primary/20"
              : "bg-muted/30 text-info border-border"
          )}
        >
          <span className="text-xs">
            {aiAssigned ? "🤖 AI Agent" : "👤 Human"}
          </span>
        </Badge>
      )
    },
  },
  {
    accessorKey: "unread",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          Unread
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const unread = row.getValue("unread") as number

      if (unread === 0) {
        return <span className="text-sm text-muted-foreground">—</span>
      }

      return (
        <Badge variant="destructive" className="font-semibold">
          {unread}
        </Badge>
      )
    },
  },
  {
    accessorKey: "time",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          Last Activity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const time = row.getValue("time") as string

      return <span className="text-sm text-muted-foreground">{time}</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const _conversation = row.original

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
            <DropdownMenuItem>
              <MessageCircle className="mr-2 h-4 w-4" />
              Open conversation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Mark as read
            </DropdownMenuItem>
            <DropdownMenuItem>
              Assign to human
            </DropdownMenuItem>
            <DropdownMenuItem>
              Close conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface ConversationsTableProps {
  data: Conversation[]
  onRowClick?: (conversation: Conversation) => void
}

/**
 * Conversations Table Component
 *
 * Renders conversations in a table format using DashCode DataTable.
 */
export function ConversationsTable({ data, onRowClick }: ConversationsTableProps) {
  return (
    <DataTable
      columns={conversationColumns}
      data={data}
      searchPlaceholder="Search conversations..."
      searchKey="name"
      onRowClick={onRowClick}
      enableRowSelection={false}
      enableColumnVisibility={true}
      enablePagination={true}
      pageSize={15}
    />
  )
}
