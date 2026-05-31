"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  MoreVertical,
  Eye,
  Copy,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface WebhookEvent {
  id: string;
  direction: 'inbound' | 'outbound';
  type: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  status: number;
  duration: number;
  timestamp: Date;
  headers: Record<string, string>;
  payload: object;
  response?: object;
}

const getStatusColor = (status: number) => {
  if (status < 300) return 'bg-emerald-500/20 text-emerald-400';
  if (status < 400) return 'bg-amber-500/20 text-amber-400';
  return 'bg-red-500/20 text-red-400';
};

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET':
      return 'bg-blue-500/20 text-blue-400';
    case 'POST':
      return 'bg-green-500/20 text-green-400';
    case 'PUT':
      return 'bg-amber-500/20 text-amber-400';
    case 'PATCH':
      return 'bg-violet-500/20 text-violet-400';
    case 'DELETE':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-slate-500/20 text-slate-400';
  }
};

export const columns: ColumnDef<WebhookEvent>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "direction",
    header: "Direction",
    cell: ({ row }) => {
      const direction = row.getValue("direction") as string;
      return (
        <div className="flex items-center gap-2">
          {direction === 'inbound' ? (
            <ArrowDownLeft className="w-4 h-4 text-blue-400" />
          ) : (
            <ArrowUpRight className="w-4 h-4 text-violet-400" />
          )}
          <span className="capitalize">{direction}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant="secondary" className="text-[10px] font-mono">
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "method",
    header: "Method",
    cell: ({ row }) => {
      const method = row.getValue("method") as string;
      return (
        <Badge className={cn("text-[10px] font-mono", getMethodColor(method))}>
          {method}
        </Badge>
      );
    },
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => {
      const url = row.getValue("url") as string;
      return (
        <span className="font-mono text-xs truncate max-w-[300px] block">
          {url}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as number;
      return (
        <Badge className={cn("text-xs font-mono", getStatusColor(status))}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Duration
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number;
      return (
        <span className="text-xs font-mono tabular-nums">
          {duration}ms
        </span>
      );
    },
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const timestamp = row.getValue("timestamp") as Date;
      return (
        <span className="text-xs text-slate-400">
          {timestamp.toLocaleTimeString()}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const event = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
            <DropdownMenuItem
              className="cursor-pointer focus:bg-slate-700"
              onClick={() => console.log("View details:", event.id)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer focus:bg-slate-700"
              onClick={() => navigator.clipboard.writeText(event.url)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-400 focus:bg-slate-700 focus:text-red-400"
              onClick={() => console.log("Delete:", event.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
