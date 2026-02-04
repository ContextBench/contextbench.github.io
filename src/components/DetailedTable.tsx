"use client";

import React, { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { cn } from "@/lib/utils";
import resultsData from "@/data/results.json";

export type BenchmarkResult = typeof resultsData[0];

const MetricCell = ({ value, isBold = false, colorClass = "" }: { value: number | string, isBold?: boolean, colorClass?: string }) => (
  <span className={cn(
    "font-mono text-[11px] tabular-nums",
    isBold ? "font-bold" : "text-muted-foreground",
    colorClass
  )}>
    {typeof value === 'number' ? value.toFixed(3) : value}
  </span>
);

const columns: ColumnDef<BenchmarkResult>[] = [
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => <span className="font-bold text-xs sticky left-0 bg-background/80 backdrop-blur z-10 px-2 py-1 rounded">{row.getValue("model")}</span>,
  },
  // File-Level Group
  {
    id: "file_level",
    header: () => <div className="text-center py-1 bg-slate-100/50 rounded text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">File Level</div>,
    columns: [
      { accessorKey: "performance.file.recall", header: "Rec.", cell: ({ row }) => <MetricCell value={row.original.performance.file.recall} /> },
      { accessorKey: "performance.file.precision", header: "Pre.", cell: ({ row }) => <MetricCell value={row.original.performance.file.precision} /> },
      { accessorKey: "performance.file.f1", header: "F1", cell: ({ row }) => <MetricCell value={row.original.performance.file.f1} isBold colorClass="text-slate-700" /> },
    ],
  },
  // Block-Level Group
  {
    id: "block_level",
    header: () => <div className="text-center py-1 bg-indigo-100/50 rounded text-[9px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Block Level</div>,
    columns: [
      { accessorKey: "performance.block.recall", header: "Rec.", cell: ({ row }) => <MetricCell value={row.original.performance.block.recall} /> },
      { accessorKey: "performance.block.precision", header: "Pre.", cell: ({ row }) => <MetricCell value={row.original.performance.block.precision} /> },
      { accessorKey: "performance.block.f1", header: "F1", cell: ({ row }) => <MetricCell value={row.original.performance.block.f1} isBold colorClass="text-indigo-700" /> },
    ],
  },
  // Line-Level Group
  {
    id: "line_level",
    header: () => <div className="text-center py-1 bg-blue-100/50 rounded text-[9px] font-bold uppercase tracking-widest text-blue-500 mb-1">Line Level</div>,
    columns: [
      { accessorKey: "performance.line.recall", header: "Rec.", cell: ({ row }) => <MetricCell value={row.original.performance.line.recall} /> },
      { accessorKey: "performance.line.precision", header: "Pre.", cell: ({ row }) => <MetricCell value={row.original.performance.line.precision} /> },
      { accessorKey: "performance.line.f1", header: "F1", cell: ({ row }) => <MetricCell value={row.original.performance.line.f1} isBold colorClass="text-blue-700" /> },
    ],
  },
  // End-to-End Group
  {
    id: "e2e",
    header: () => <div className="text-center py-1 bg-emerald-100/50 rounded text-[9px] font-bold uppercase tracking-widest text-emerald-500 mb-1">End-to-End</div>,
    columns: [
      { accessorKey: "performance.pass_at_1", header: "Pass@1", cell: ({ row }) => <span className="font-mono text-xs font-bold text-emerald-700">{(row.original.performance.pass_at_1 * 100).toFixed(1)}%</span> },
    ],
  },
  // Dynamics Group
  {
    id: "dynamics",
    header: () => <div className="text-center py-1 bg-amber-100/50 rounded text-[9px] font-bold uppercase tracking-widest text-amber-500 mb-1">Dynamics & Cost</div>,
    columns: [
      { accessorKey: "patterns.avg_steps_per_instance", header: "Steps", cell: ({ row }) => <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{row.original.patterns.avg_steps_per_instance}</span> },
      { accessorKey: "patterns.avg_lines_per_step", header: "Lines", cell: ({ row }) => <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{row.original.patterns.avg_lines_per_step}</span> },
      { accessorKey: "dynamics.efficiency", header: "Eff.", cell: ({ row }) => <MetricCell value={row.original.dynamics.efficiency} /> },
      { accessorKey: "dynamics.redundancy", header: "Red.", cell: ({ row }) => <MetricCell value={row.original.dynamics.redundancy} colorClass="text-red-400" /> },
      { accessorKey: "patterns.avg_cost_per_instance", header: "Cost", cell: ({ row }) => <span className="font-mono text-[11px] font-bold text-amber-600">${row.original.patterns.avg_cost_per_instance.toFixed(2)}</span> },
    ],
  },
];

export const DetailedTable = () => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "e2e_performance_pass_at_1", desc: true }
  ]);

  const table = useReactTable({
    data: resultsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="rounded-2xl border border-muted/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-muted/10 border-b border-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b-0">
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id} 
                      colSpan={header.colSpan}
                      className={cn(
                        "px-3 text-center align-bottom h-10",
                        header.id === "model" && "sticky left-0 bg-background/95 backdrop-blur z-20"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-b border-muted/30 last:border-0 hover:bg-muted/10 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      className={cn(
                        "py-3 px-3 text-center",
                        cell.column.id === "model" && "sticky left-0 bg-background/95 backdrop-blur z-10 text-left border-r border-muted/20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="p-4 bg-muted/10 rounded-xl border border-muted/30 flex flex-wrap gap-x-8 gap-y-2 justify-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300" /> File Level Metrics</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-300" /> Block Level Metrics</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-300" /> Line Level Metrics</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-300" /> Success Metrics</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-300" /> Agent Dynamics</div>
      </div>
    </div>
  );
};
