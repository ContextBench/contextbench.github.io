"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ResultDetails } from "@/components/ResultDetails";
import { formatMetric, type BenchmarkResult, type SystemType } from "@/lib/leaderboard";

const levels = ["file", "block", "line"] as const;
const retrievalMetrics = ["recall", "precision", "f1"] as const;
const number = (value: number | undefined) => value === undefined ? "—" : value.toFixed(2);

export function DetailedTable({ data, systemType }: { data: BenchmarkResult[]; systemType: SystemType }) {
  const [level, setLevel] = useState<(typeof levels)[number]>("line");
  return (
    <section aria-labelledby="detailed-title" className="min-w-0 rounded-xl border border-border">
      <div className="p-4 sm:p-5"><h3 id="detailed-title" className="text-base font-semibold">Detailed metrics</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">File, block, and line retrieval, plus run statistics. Uses the search and ordering above.</p></div>
      <div role="region" aria-label="Detailed metrics table, scroll for more columns" tabIndex={0} className="hidden max-h-[600px] overflow-auto md:block">
        <table className="w-full min-w-[1400px] border-separate border-spacing-0 text-right text-xs">
          <caption className="sr-only">All retrieval and run metrics, in the selected leaderboard order</caption>
          <thead className="sticky top-0 z-20 bg-muted">
            <tr><th rowSpan={2} scope="col" className="sticky left-0 z-30 min-w-60 border-b border-border bg-muted px-4 py-3 text-left">{systemType === "backbone" ? "Model" : "Agent + model"}</th>
              {levels.map(group => <th key={group} colSpan={3} scope="colgroup" className="border-b border-l border-border px-3 py-2 text-center capitalize">{group} retrieval</th>)}
              <th rowSpan={2} scope="col" className="border-b border-l border-border px-3">Pass@1</th><th colSpan={3} scope="colgroup" className="border-b border-l border-border px-3 py-2 text-center">Context dynamics</th><th colSpan={3} scope="colgroup" className="border-b border-l border-border px-3 py-2 text-center">Run averages</th>
            </tr>
            <tr>{levels.flatMap(group => retrievalMetrics.map(metric => <th key={`${group}-${metric}`} scope="col" className="border-b border-border px-3 py-2 font-medium capitalize text-muted-foreground">{metric === "f1" ? "F1" : metric}</th>))}{["Efficiency", "Redundancy", "Usage drop", "Steps / task", "Lines / step", "Cost / task"].map(label => <th key={label} scope="col" className="border-b border-border px-3 py-2 font-medium">{label}</th>)}</tr>
          </thead>
          <tbody>{data.map(result => <tr key={result.model} className="group">
            <th scope="row" className="sticky left-0 z-10 border-b border-border bg-card px-4 py-3 text-left font-medium group-hover:bg-muted">{result.model}</th>
            {levels.flatMap(group => retrievalMetrics.map(metric => <td key={`${group}-${metric}`} className={`border-b border-border px-3 py-3 font-mono tabular-nums group-hover:bg-muted/50 ${metric === "f1" ? "font-semibold" : "text-muted-foreground"}`}>{result.performance[group][metric].toFixed(3)}</td>))}
            {[formatMetric(result.performance.pass_at_1, "pass_at_1"), formatMetric(result.dynamics?.efficiency, "efficiency"), formatMetric(result.dynamics?.redundancy, "efficiency"), formatMetric(result.dynamics?.usage_drop, "efficiency"), number(result.patterns?.avg_steps_per_instance), number(result.patterns?.avg_lines_per_step), formatMetric(result.patterns?.avg_cost_per_instance, "cost")].map((value, index) => <td key={index} className="border-b border-border px-3 py-3 font-mono tabular-nums group-hover:bg-muted/50">{value}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
      <div className="md:hidden">
        <label className="mx-4 mb-4 flex items-center justify-between gap-3 text-xs">Retrieval level<select aria-label="Retrieval level" value={level} onChange={event => setLevel(event.target.value as typeof level)} className="h-9 rounded-lg border border-border bg-card px-3 text-sm">{levels.map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
        {data.map(result => <details key={result.model} className="group border-t border-border">
          <summary className="list-none cursor-pointer p-4 [&::-webkit-details-marker]:hidden"><span className="flex items-start justify-between gap-3 text-sm font-medium">{result.model}<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground group-open:rotate-180" /></span><span className="mt-3 grid grid-cols-3 gap-2 text-xs">{retrievalMetrics.map(metric => <span key={metric}><span className="block capitalize text-muted-foreground">{metric === "f1" ? "F1" : metric}</span><span className="mt-1 block font-mono tabular-nums">{result.performance[level][metric].toFixed(3)}</span></span>)}</span><span className="sr-only">Show all metrics</span></summary>
          <ResultDetails result={result} systemType={systemType} />
        </details>)}
      </div>
    </section>
  );
}
