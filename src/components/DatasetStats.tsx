"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import statsData from "@/data/dataset_stats.json";

export const DatasetStats = () => {
  return (
    <div className="mt-20 mb-24 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h2 className="text-3xl font-bold tracking-tight">Dataset Statistics</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          A repository-level benchmark spanning 8 programming languages and introducing human-verified gold contexts to expose intermediate context retrieval signals missing from final task resolution rate evaluation.
        </p>
      </div>

      <div className="rounded-2xl border border-muted/50 bg-card overflow-hidden shadow-sm max-w-4xl mx-auto">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent border-b border-muted/50">
              <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-foreground">Language</TableHead>
              <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-foreground text-right">#Repo</TableHead>
              <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-foreground text-right">#Task</TableHead>
              <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-foreground text-right">#File</TableHead>
              <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-foreground text-right">#Block</TableHead>
              <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-foreground text-right">#Line</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statsData.map((row, i) => (
              <TableRow 
                key={i} 
                className={cn(
                  "border-b border-muted/30 last:border-0 hover:bg-muted/5 transition-colors",
                  row.isTotal && "bg-primary/[0.02] font-bold"
                )}
              >
                <TableCell className="py-3 px-6 text-sm font-semibold">{row.language}</TableCell>
                <TableCell className="py-3 px-6 text-sm font-mono text-right tabular-nums">{row.repo.toLocaleString()}</TableCell>
                <TableCell className="py-3 px-6 text-sm font-mono text-right tabular-nums">{row.task.toLocaleString()}</TableCell>
                <TableCell className="py-3 px-6 text-sm font-mono text-right tabular-nums text-muted-foreground">{row.file.toLocaleString()}</TableCell>
                <TableCell className="py-3 px-6 text-sm font-mono text-right tabular-nums text-muted-foreground">{row.block.toLocaleString()}</TableCell>
                <TableCell className="py-3 px-6 text-sm font-mono text-right tabular-nums text-muted-foreground">{row.line.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
