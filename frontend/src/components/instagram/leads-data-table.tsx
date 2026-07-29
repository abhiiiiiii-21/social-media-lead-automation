"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrapedLead } from "@/lib/types/instagram";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Mail, MapPin, Phone, Search, Download, Send, Globe, Trash2, ArrowUpDown } from "lucide-react";

interface LeadsDataTableProps {
  data: ScrapedLead[];
}

export function LeadsDataTable({ data }: LeadsDataTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<ScrapedLead>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "username",
      header: "Profile",
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex items-center gap-3 w-[200px]">
            <Avatar className="h-8 w-8 border border-border/50">
              <AvatarImage src={lead.avatarUrl} alt={lead.username} />
              <AvatarFallback className="bg-muted text-[10px]">
                {lead.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-1 truncate">
                {lead.username}
                {lead.isVerified && <CheckCircle2 className="h-3 w-3 text-blue-500 shrink-0" />}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {lead.fullName}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "qualityScore",
      header: ({ column }) => {
        return (
          <Button variant="ghost" className="-ml-4 h-8 text-xs font-medium" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Score <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const score = row.original.qualityScore;
        let color = "text-muted-foreground";
        if (score >= 80) color = "text-emerald-500 font-bold";
        else if (score >= 60) color = "text-amber-500 font-semibold";
        return <span className={`text-xs ${color}`}>{score}</span>;
      },
    },
    {
      accessorKey: "followers",
      header: ({ column }) => {
        return (
          <Button variant="ghost" className="-ml-4 h-8 text-xs font-medium" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Followers <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => <span className="text-xs font-mono">{row.original.followers.toLocaleString()}</span>,
    },
    {
      accessorKey: "following",
      header: "Following",
      cell: ({ row }) => <span className="text-xs font-mono">{row.original.following.toLocaleString()}</span>,
    },
    {
      id: "contact",
      header: "Contact Details",
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex flex-col gap-1.5 text-[11px] w-[180px]">
            {lead.email && (
              <span className="flex items-center gap-1.5 text-foreground truncate">
                <Mail className="h-3 w-3 text-muted-foreground shrink-0" /> {lead.email}
              </span>
            )}
            {lead.phone && (
              <span className="flex items-center gap-1.5 text-foreground truncate">
                <Phone className="h-3 w-3 text-muted-foreground shrink-0" /> {lead.phone}
              </span>
            )}
            {lead.website && (
              <span className="flex items-center gap-1.5 text-blue-500 truncate hover:underline cursor-pointer">
                <Globe className="h-3 w-3 text-blue-500 shrink-0" /> {lead.website.replace(/^https?:\/\//, '')}
              </span>
            )}
            {!lead.email && !lead.phone && !lead.website && (
              <span className="text-muted-foreground/50 italic">No contact info</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Business & Location",
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex flex-col gap-1 text-[11px] w-[150px]">
            {lead.category && (
              <span className="font-medium text-foreground truncate">{lead.category}</span>
            )}
            {lead.location && (
              <span className="flex items-center gap-1 text-muted-foreground truncate">
                <MapPin className="h-3 w-3 shrink-0" /> {lead.location}
              </span>
            )}
            {lead.isBusiness && (
              <Badge variant="outline" className="w-fit text-[9px] py-0 h-4 mt-0.5 bg-muted/30">Business Acc.</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant="outline" className="bg-muted/50 border-border/50 text-[10px] font-medium">
            {status}
          </Badge>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      rowSelection,
      sorting,
    },
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter scraped leads..."
              className="pl-8 h-9 text-sm bg-background border-border/50 shadow-sm"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {selectedCount > 0 && (
            <>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 font-medium border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span> ({selectedCount})
              </Button>
              <Button size="sm" className="h-9 gap-1.5 font-medium px-4">
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Create Outreach</span> ({selectedCount})
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" className="h-9 gap-1.5 font-medium px-4 bg-background">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-background overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-medium text-xs h-10 py-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/10 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="text-xs text-muted-foreground font-medium">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
