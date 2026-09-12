"use client";

import { Fragment, useId, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMetric, metricKeys, metrics, metricValue, type RankedResult, type Sort, type SystemType, type MetricKey } from "@/lib/leaderboard";
import { ResultDetails } from "@/components/ResultDetails";
import { submissionRepository } from "@/lib/submissions";

function Rank({ rank }: { rank: number | null }) {
  return <span aria-label={rank === null ? "Unranked: metric not reported" : `Rank ${rank}`} className={cn("inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 font-mono text-xs tabular-nums", rank === 1 ? "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200" : "text-muted-foreground")}>{rank ?? "—"}</span>;
}

interface Props {
  rows: RankedResult[];
  sort: Sort;
  systemType: SystemType;
  onSort: (key: MetricKey) => void;
}

export const LeaderboardTable = ({ rows, sort, systemType, onSort }: Props) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const id = useId();
  const toggle = (model: string) => setExpanded(previous => {
    const next = new Set(previous);
    if (next.has(model)) next.delete(model); else next.add(model);
    return next;
  });

  return (
    <>
      <div className="hidden md:block">
        <div role="region" aria-label="Leaderboard results" tabIndex={0} className="max-h-[640px] overflow-auto rounded-xl border border-border focus-visible:outline-2 focus-visible:outline-ring">
          <table className="w-full min-w-[800px] border-separate border-spacing-0 text-sm">
            <caption className="sr-only">{systemType === "backbone" ? "Fixed harness model" : "Agent system"} rankings by {metrics[sort.key].label}. Ranks are preserved when reversing order or searching. Equal scores share a rank.</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky top-0 left-0 z-30 w-12 min-w-12 max-w-12 border-b border-border bg-muted px-2 py-3 text-center text-xs font-medium text-muted-foreground">Rank</th>
                <th scope="col" className="sticky top-0 left-12 z-30 min-w-56 border-b border-border bg-muted px-3 py-3 text-left text-xs font-medium text-muted-foreground">{systemType === "backbone" ? "Model" : "Agent + model"}</th>
                {metricKeys.map(key => {
                  const selected = sort.key === key;
                  const Arrow = selected ? (sort.direction === "desc" ? ArrowDown : ArrowUp) : ArrowUpDown;
                  return <th key={key} scope="col" aria-sort={selected ? (sort.direction === "desc" ? "descending" : "ascending") : "none"} className={cn("sticky top-0 z-20 border-b border-border bg-muted px-4 py-3 text-right text-xs font-medium whitespace-nowrap", selected && "bg-[#eaf2fa] text-primary")}>
                    <button type="button" title={metrics[key].description} aria-label={`Sort by ${metrics[key].label}`} onClick={() => onSort(key)} className="ml-auto flex items-center gap-1.5 rounded hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">{metrics[key].shortLabel}<Arrow className="h-3.5 w-3.5" /></button>
                  </th>;
                })}
                <th scope="col" className="sticky top-0 z-20 w-12 border-b border-border bg-muted"><span className="sr-only">Details</span></th>
              </tr>
            </thead>
            <tbody>{rows.map(({ result, rank }, index) => {
              const open = expanded.has(result.model);
              const panel = `${id}-desktop-${index}`;
              return <Fragment key={result.model}>
                <tr data-model={result.model} className="group">
                  <td className="sticky left-0 z-10 w-12 min-w-12 max-w-12 border-b border-border/70 bg-card px-2 py-3 text-center group-hover:bg-muted"><Rank rank={rank} /></td>
                  <th scope="row" className="sticky left-12 z-10 max-w-80 border-b border-border/70 bg-card px-3 py-3 text-left font-medium group-hover:bg-muted">
                    <span className="block break-words">{result.model}</span>
                    {result.submission && <a href={`${submissionRepository}/tree/main/submissions/${encodeURIComponent(result.submission)}`} className="mt-0.5 inline-block text-xs font-normal text-brand underline underline-offset-4">Submission &amp; logs</a>}
                  </th>
                  {metricKeys.map(key => <td key={key} data-metric={key} title={metricValue(result, key) === undefined ? "Not reported" : undefined} className={cn("border-b border-border/70 px-4 py-3 text-right font-mono tabular-nums", sort.key === key ? "bg-[#f0f6fc] font-semibold text-primary" : "group-hover:bg-muted/60", metricValue(result, key) === undefined && "text-muted-foreground")}>
                    {formatMetric(metricValue(result, key), key)}
                  </td>)}
                  <td className="border-b border-border/70 px-2 py-2 text-center group-hover:bg-muted/60"><button type="button" aria-label={`Details for ${result.model}`} aria-expanded={open} aria-controls={panel} onClick={() => toggle(result.model)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"><ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} /></button></td>
                </tr>
                {open && <tr><td colSpan={7} className="border-b border-border"><div id={panel}><ResultDetails result={result} systemType={systemType} /></div></td></tr>}
              </Fragment>;
            })}</tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border md:hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted px-3 py-2.5 text-xs text-muted-foreground"><span>{systemType === "backbone" ? "Model" : "Agent + model"}</span><span>{metrics[sort.key].shortLabel} {sort.direction === "desc" ? "↓" : "↑"}</span></div>
        <ol aria-label="Leaderboard results" className="divide-y divide-border">
          {rows.map(({ result, rank }, index) => {
            const open = expanded.has(result.model);
            const secondary = sort.key === "pass_at_1" ? "line_f1" : "pass_at_1";
            const panel = `${id}-mobile-${index}`;
            return <li key={result.model} data-model={result.model}>
              <button type="button" aria-label={`Details for ${result.model}`} aria-expanded={open} aria-controls={panel} onClick={() => toggle(result.model)} className="grid w-full grid-cols-[24px_minmax(0,1fr)_auto] items-start gap-2.5 px-3 py-3.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                <Rank rank={rank} />
                <span className="min-w-0"><span className="block text-sm leading-5 font-medium break-words">{result.model}</span><span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">{result.submission ? "Run details & logs" : "Details"}<ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} /></span></span>
                <span className="text-right"><span data-metric={sort.key} className="block font-mono text-base font-semibold tabular-nums text-primary">{formatMetric(metricValue(result, sort.key), sort.key)}</span><span className="mt-1 block text-[10px] whitespace-nowrap text-muted-foreground">{metrics[secondary].shortLabel} {formatMetric(metricValue(result, secondary), secondary)}</span></span>
              </button>
              {open && <div id={panel}><ResultDetails result={result} systemType={systemType} /></div>}
            </li>;
          })}
        </ol>
      </div>
    </>
  );
};
