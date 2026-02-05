"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  ChevronDown, 
  ArrowUpDown, 
  Search,
  CheckCircle2,
  Zap,
  DollarSign,
  TrendingUp,
  HelpCircle,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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

const PerformanceBar = ({ value, max, color }: { value: number; max: number; color?: string }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="absolute inset-0 -z-10 opacity-[0.08] pointer-events-none overflow-hidden">
      <div 
        className={cn("h-full transition-all duration-700 ease-out", color || "bg-primary")} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const HeaderWithTooltip = ({ label, tooltip, column, icon: Icon }: { label: string; tooltip: string; column: any; icon?: any }) => (
  <TooltipProvider>
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <button
          className="flex items-center gap-2 hover:text-foreground transition-colors group text-xs font-bold uppercase tracking-widest"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {Icon && <Icon className="h-3.5 w-3.5 opacity-50" />}
          {label}
          <HelpCircle className="h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface LeaderboardTableProps {
  primaryMetric: string;
  systemType: string;
}

export const LeaderboardTable = ({ primaryMetric, systemType }: LeaderboardTableProps) => {
  const data = useMemo<BenchmarkResult[]>(() => {
    const rawData = systemType === "agent" ? agentData : backboneData;
    return rawData.map(r => ({
      ...r,
      model: systemType === "agent" && !agentData.find(ad => ad.model === r.model) 
        ? `cmini-swe-agent + ${r.model}` 
        : r.model
    })) as BenchmarkResult[];
  }, [systemType]);

  const [sorting, setSorting] = useState<SortingState>([
    { id: primaryMetric, desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSorting([{ id: primaryMetric, desc: true }]);
  }, [primaryMetric]);

  const maxPass = useMemo(() => Math.max(...data.map(r => r.performance.pass_at_1)), [data]);
  const maxLineF1 = useMemo(() => Math.max(...data.map(r => r.performance.line.f1)), [data]);
  const maxEfficiency = useMemo(() => {
    const efficiencies = data.map(r => r.dynamics?.efficiency).filter((v): v is number => v !== undefined);
    return efficiencies.length > 0 ? Math.max(...efficiencies) : 1;
  }, [data]);

  const columns = useMemo<ColumnDef<BenchmarkResult>[]>(() => [
    {
      id: "rank",
      header: "Rank",
      cell: ({ row, table }) => {
        const sortedRows = table.getSortedRowModel().rows;
        const rank = sortedRows.findIndex(r => r.id === row.id) + 1;
        const podiumColors = [
          "bg-yellow-100/50 text-yellow-700 border-yellow-200",
          "bg-slate-100/50 text-slate-700 border-slate-200",
          "bg-orange-100/50 text-orange-700 border-orange-200"
        ];
        return (
          <div className="flex items-center justify-center">
            {rank <= 3 ? (
              <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold tabular-nums shadow-sm", podiumColors[rank-1])}>
                <Trophy className="h-3.5 w-3.5" /> {rank}
              </div>
            ) : (
              <span className="font-mono text-muted-foreground/70 font-medium text-sm tabular-nums w-10 text-center">#{rank}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "model",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors text-xs font-bold uppercase tracking-widest"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Model / System
          <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-bold text-foreground tracking-tight text-base group-hover:text-primary transition-colors">
          {row.original.model}
        </span>
      ),
    },
    {
      id: "performance_pass_at_1",
      accessorKey: "performance.pass_at_1",
      header: ({ column }) => (
        <HeaderWithTooltip 
          label="Pass@1" 
          tooltip="Success rate in resolving issues. This is the primary ranking metric." 
          column={column}
          icon={CheckCircle2}
        />
      ),
      cell: ({ row }) => {
        const val = row.original.performance.pass_at_1;
        const isMax = val === maxPass;
        const isSelected = primaryMetric === "performance_pass_at_1";
        return (
          <div className={cn("relative flex items-center gap-2 h-full py-3 px-6", isSelected && "bg-blue-50/30")}>
            <PerformanceBar value={val} max={maxPass} color="bg-blue-400" />
            <span className={cn("font-mono font-bold text-base tabular-nums", isMax || isSelected ? "text-blue-700" : "text-foreground")}>
              {(val * 100).toFixed(1)}%
            </span>
          </div>
        );
      },
    },
    {
      id: "performance_line_f1",
      accessorKey: "performance.line.f1",
      header: ({ column }) => (
        <HeaderWithTooltip 
          label="Context F1" 
          tooltip="Accuracy of the retrieved context at the line level." 
          column={column} 
          icon={Zap}
        />
      ),
      cell: ({ row }) => {
        const val = row.original.performance.line.f1;
        const isMax = val === maxLineF1;
        const isSelected = primaryMetric === "performance_line_f1";
        return (
          <div className={cn("relative h-full flex items-center px-6", isSelected && "bg-indigo-50/30")}>
             <PerformanceBar value={val} max={maxLineF1} color="bg-indigo-400" />
             <span className={cn("font-mono text-base tabular-nums", isMax || isSelected ? "text-indigo-700 font-bold" : "text-muted-foreground")}>
               {val.toFixed(3)}
             </span>
          </div>
        );
      },
    },
    {
      id: "dynamics_efficiency",
      accessorKey: "dynamics.efficiency",
      header: ({ column }) => (
        <HeaderWithTooltip 
          label="Efficiency" 
          tooltip="Retrieval efficiency score (useful context per step)." 
          column={column} 
          icon={TrendingUp}
        />
      ),
      cell: ({ row }) => {
        const val = row.original.dynamics?.efficiency;
        if (val === undefined) return <span className="font-mono text-muted-foreground/30 px-6">--</span>;
        const isMax = val === maxEfficiency;
        const isSelected = primaryMetric === "dynamics_efficiency";
        return (
          <div className={cn("relative h-full flex items-center px-6", isSelected && "bg-emerald-50/30")}>
             <PerformanceBar value={val} max={maxEfficiency} color="bg-emerald-400" />
             <span className={cn("font-mono text-base tabular-nums", isMax || isSelected ? "text-emerald-700 font-bold" : "text-muted-foreground")}>
               {val.toFixed(3)}
             </span>
          </div>
        );
      },
    },
    {
      id: "cost",
      accessorKey: "patterns.avg_cost_per_instance",
      header: ({ column }) => (
        <HeaderWithTooltip 
          label="Avg. Cost" 
          tooltip="Average inference cost per instance (USD)." 
          column={column} 
          icon={DollarSign}
        />
      ),
      cell: ({ row }) => {
        const val = row.original.patterns?.avg_cost_per_instance;
        if (val === undefined) return <span className="font-mono text-muted-foreground/30 px-6">--</span>;
        return (
          <div className="relative h-full flex items-center px-6 bg-teal-50/20">
            <span className="font-mono text-sm tabular-nums text-teal-700 font-bold">
              ${val.toFixed(2)}
            </span>
          </div>
        );
      },
    },
  ], [maxPass, maxLineF1, maxEfficiency, primaryMetric]);

  const toggleRow = (id: string) => {
    const row = table.getRow(id);
    if (!row.original.patterns && !row.original.dynamics) return;
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center relative max-w-sm group">
        <Search className="absolute left-3.5 h-4.5 w-4.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Search models..."
          value={(table.getColumn("model")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("model")?.setFilterValue(event.target.value)}
          className="pl-11 h-12 text-base bg-muted/20 border-muted/50 rounded-xl shadow-none focus-visible:ring-2 focus-visible:ring-primary/10 transition-all"
        />
      </div>

      <div className="rounded-2xl border border-muted/50 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/10 border-b border-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-16 px-6">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    className={cn(
                      "group cursor-pointer transition-all duration-200 border-b border-muted/30 last:border-0",
                      expandedRows[row.id] ? "bg-muted/40" : "hover:bg-muted/20"
                    )}
                    onClick={() => toggleRow(row.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="h-20 px-6 relative">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                    <TableCell className="px-6 text-center">
                      <div className="flex justify-center">
                        {(row.original.patterns || row.original.dynamics) ? (
                          <motion.div
                            animate={{ rotate: expandedRows[row.id] ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-1.5 rounded-full bg-muted/50 text-muted-foreground/40 group-hover:text-primary group-hover:bg-primary/10 transition-all"
                          >
                            <ChevronDown className="h-5 w-5" />
                          </motion.div>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  <AnimatePresence>
                    {expandedRows[row.id] && (
                      <TableRow className="hover:bg-transparent border-b border-muted/30">
                        <TableCell colSpan={columns.length + 1} className="p-0">
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-12 py-10 bg-muted/10">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="bg-background p-8 rounded-2xl border border-muted/50 shadow-sm">
                                  <div className="flex items-center gap-2.5 mb-8 text-primary">
                                    <TrendingUp className="h-5 w-5" />
                                    <h4 className="text-xs font-bold uppercase tracking-widest">Retrieval Efficiency</h4>
                                  </div>
                                  <div className="space-y-5">
                                    {[
                                      { label: "Efficiency Score", value: row.original.dynamics?.efficiency?.toFixed(3) || "--" },
                                      { label: "Redundancy Index", value: row.original.dynamics?.redundancy?.toFixed(3) || "--", color: "text-red-500/70" },
                                      { label: "Information Usage Drop", value: row.original.dynamics?.usage_drop?.toFixed(3) || "--", color: "text-amber-500/70" }
                                    ].map((item, i) => (
                                      <div key={i} className="flex justify-between items-center py-3 border-b border-muted/20 last:border-0">
                                        <span className="text-sm text-muted-foreground">{item.label}</span>
                                        <span className={cn("font-mono font-bold text-sm tabular-nums", item.color)}>
                                          {item.value}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="bg-background p-8 rounded-2xl border border-muted/50 shadow-sm">
                                  <div className="flex items-center gap-2.5 mb-8 text-indigo-500">
                                    <Zap className="h-5 w-5" />
                                    <h4 className="text-xs font-bold uppercase tracking-widest">Scale & Steps</h4>
                                  </div>
                                  <div className="space-y-5">
                                    {[
                                      { label: "Average Steps", value: row.original.patterns?.avg_steps_per_instance || "--" },
                                      { label: "Lines per Retrieval Step", value: row.original.patterns?.avg_lines_per_step || "--" },
                                      { label: "Execution Cost", value: row.original.patterns?.avg_cost_per_instance ? `$${row.original.patterns.avg_cost_per_instance}` : "--", highlight: true }
                                    ].map((item, i) => (
                                      <div key={i} className="flex justify-between items-center py-3 border-b border-muted/20 last:border-0">
                                        <span className="text-sm text-muted-foreground">{item.label}</span>
                                        <span className={cn("font-mono font-bold text-sm tabular-nums", item.highlight && "text-primary")}>
                                          {item.value}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-48 text-center text-muted-foreground text-base italic">
                  No matching models found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
