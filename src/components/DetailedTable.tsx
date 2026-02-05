"use client";

import React, { useState, useMemo } from 'react';
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
import backboneData from "@/data/backbone_results.json";
import agentData from "@/data/agent_results.json";

// Define a unified interface for the table data
export interface BenchmarkResult {
  model: string;
  performance: {
    file: { recall: number; precision: number; f1: number };
    block: { recall: number; precision: number; f1: number };
    line: { recall: number; precision: number; f1: number };
    pass_at_1: number;
  };
  patterns?: {
    avg_steps_per_instance: number;
    avg_lines_per_step: number;
    avg_cost_per_instance: number;
  };
  dynamics?: {
    efficiency: number;
    redundancy: number;
    usage_drop: number;
  };
}

const MetricCell = ({ value, isBold = false, colorClass = "" }: { value: number | string | undefined, isBold?: boolean, colorClass?: string }) => {
  if (value === undefined) return <span className="font-mono text-[11px] text-muted-foreground/30">--</span>;
  return (
    <span className={cn(
      "font-mono text-[13px] tabular-nums",
      isBold ? "font-bold text-sm" : "text-muted-foreground",
      colorClass
    )}>
      {typeof value === 'number' ? value.toFixed(3) : value}
    </span>
  );
};

interface DetailedTableProps {
  systemType: string;
}

export const DetailedTable = ({ systemType }: DetailedTableProps) => {
  const data = useMemo<BenchmarkResult[]>(() => {
    return systemType === "agent" ? (agentData as BenchmarkResult[]) : (backboneData as BenchmarkResult[]);
  }, [systemType]);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "performance_pass_at_1", desc: true }
  ]);

  const columns = useMemo<ColumnDef<BenchmarkResult>[]>(() => [
    {
      accessorKey: "model",
      header: "Model",
      cell: ({ row }) => (
        <span className="font-bold text-sm sticky left-0 bg-background/80 backdrop-blur z-10 px-3 py-1.5 rounded border border-muted/20">
          {row.original.model}
        </span>
      ),
    },
    {
      id: "file_level",
      header: () => <div className="text-center py-1.5 bg-slate-100/50 rounded-md text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 border border-slate-200/50">File Level</div>,
      columns: [
        { accessorKey: "performance.file.recall", header: "Rec.", cell: ({ row }) => <MetricCell value={row.original.performance.file.recall} /> },
        { accessorKey: "performance.file.precision", header: "Pre.", cell: ({ row }) => <MetricCell value={row.original.performance.file.precision} /> },
        { accessorKey: "performance.file.f1", header: "F1", cell: ({ row }) => <MetricCell value={row.original.performance.file.f1} isBold colorClass="text-slate-700" /> },
      ],
    },
    {
      id: "block_level",
      header: () => <div className="text-center py-1.5 bg-indigo-100/50 rounded-md text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1.5 border border-indigo-200/50">Block Level</div>,
      columns: [
        { accessorKey: "performance.block.recall", header: "Rec.", cell: ({ row }) => <MetricCell value={row.original.performance.block.recall} /> },
        { accessorKey: "performance.block.precision", header: "Pre.", cell: ({ row }) => <MetricCell value={row.original.performance.block.precision} /> },
        { accessorKey: "performance.block.f1", header: "F1", cell: ({ row }) => <MetricCell value={row.original.performance.block.f1} isBold colorClass="text-indigo-700" /> },
      ],
    },
    {
      id: "line_level",
      header: () => <div className="text-center py-1.5 bg-blue-100/50 rounded-md text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1.5 border border-blue-200/50">Line Level</div>,
      columns: [
        { accessorKey: "performance.line.recall", header: "Rec.", cell: ({ row }) => <MetricCell value={row.original.performance.line.recall} /> },
        { accessorKey: "performance.line.precision", header: "Pre.", cell: ({ row }) => <MetricCell value={row.original.performance.line.precision} /> },
        { accessorKey: "performance.line.f1", header: "F1", cell: ({ row }) => <MetricCell value={row.original.performance.line.f1} isBold colorClass="text-blue-700" /> },
      ],
    },
    {
      id: "e2e",
      header: () => <div className="text-center py-1.5 bg-emerald-100/50 rounded-md text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1.5 border border-emerald-200/50">End-to-End</div>,
      columns: [
        { id: "performance_pass_at_1", accessorKey: "performance.pass_at_1", header: "Pass@1", cell: ({ row }) => <span className="font-mono text-[13px] font-bold text-emerald-700">{(row.original.performance.pass_at_1 * 100).toFixed(1)}%</span> },
      ],
    },
    {
      id: "dynamics",
      header: () => <div className="text-center py-1.5 bg-amber-100/50 rounded-md text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1.5 border border-amber-200/50">Dynamics & Cost</div>,
      columns: [
        { accessorKey: "patterns.avg_steps_per_instance", header: "Steps", cell: ({ row }) => <MetricCell value={row.original.patterns?.avg_steps_per_instance} /> },
        { accessorKey: "patterns.avg_lines_per_step", header: "Lines", cell: ({ row }) => <MetricCell value={row.original.patterns?.avg_lines_per_step} /> },
        { accessorKey: "dynamics.efficiency", header: "Eff.", cell: ({ row }) => <MetricCell value={row.original.dynamics?.efficiency} /> },
        { accessorKey: "dynamics.redundancy", header: "Red.", cell: ({ row }) => <MetricCell value={row.original.dynamics?.redundancy} colorClass="text-red-400" /> },
        { accessorKey: "patterns.avg_cost_per_instance", header: "Cost", cell: ({ row }) => <span className="font-mono text-[13px] font-bold text-amber-600">{row.original.patterns?.avg_cost_per_instance ? `$${row.original.patterns.avg_cost_per_instance.toFixed(2)}` : "--"}</span> },
      ],
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return (
    <div className="w-full space-y-6">
      <div className="rounded-2xl border border-muted/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader className="bg-muted/10 border-b border-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b-0">
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id} 
                      colSpan={header.colSpan}
                      className={cn(
                        "px-4 text-center align-bottom h-14",
                        header.id === "model" && "sticky left-0 bg-background/95 backdrop-blur z-20"
                      )}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                        "py-4 px-4 text-center",
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
    </div>
  );
};
