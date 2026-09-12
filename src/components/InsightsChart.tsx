"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatMetric, type BenchmarkResult } from "@/lib/leaderboard";

export function InsightsChart({ data }: { data: BenchmarkResult[] }) {
  const [selectedModel, setSelectedModel] = useState("");
  const selected = data.find(result => result.model === selectedModel) ?? data[0];
  if (!selected) return null;
  const domain = Math.max(0.2, Math.ceil(Math.max(...data.flatMap(result => [result.performance.line.recall, result.performance.line.precision])) * 5) / 5);
  const x = (value: number) => 48 + value / domain * 330;
  const y = (value: number) => 250 - value / domain * 225;
  const ticks = Array.from({ length: 5 }, (_, index) => domain * index / 4);
  return (
    <section aria-labelledby="chart-title" className="rounded-xl border border-border p-4 sm:p-5">
      <h3 id="chart-title" className="text-base font-semibold">Precision–recall trade-off</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Line-level context retrieval. Larger bubbles indicate higher Pass@1. Select a model to inspect its scores.</p>
      <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[1.5fr_1fr] lg:items-center">
        <svg viewBox="0 0 400 295" role="group" aria-label="Line recall versus line precision. Each bubble represents one result." className="mx-auto w-full max-w-xl overflow-visible font-sans">
          {ticks.map(tick => <g key={tick}>
            <line x1={x(0)} x2={x(domain)} y1={y(tick)} y2={y(tick)} stroke="var(--border)" />
            <text x={x(0) - 9} y={y(tick) + 4} textAnchor="end" fill="var(--muted-foreground)" className="text-[14px] sm:text-[11px]">{tick.toFixed(2)}</text>
            <text x={x(tick)} y={y(0) + 18} textAnchor="middle" fill="var(--muted-foreground)" className="text-[14px] sm:text-[11px]">{tick.toFixed(2)}</text>
          </g>)}
          <line x1={x(0)} x2={x(domain)} y1={y(0)} y2={y(domain)} stroke="#94a3b8" strokeDasharray="3 5" />
          <text x={x(domain * 0.7)} y={y(domain * 0.85)} fill="var(--muted-foreground)" className="text-[14px] sm:text-[11px]">Precision = recall</text>
          <text x="212" y="291" textAnchor="middle" fill="var(--foreground)" className="text-[16px] sm:text-[12px]">Line recall</text>
          <text transform="translate(13 140) rotate(-90)" textAnchor="middle" fill="var(--foreground)" className="text-[16px] sm:text-[12px]">Line precision</text>
          {[...data.filter(result => result.model !== selected.model), selected].map(result => {
            const active = result.model === selected.model;
            const radius = Math.sqrt(16 + result.performance.pass_at_1 * 320);
            return <g key={result.model} role="button" tabIndex={0} aria-pressed={active} aria-label={`Inspect ${result.model}`} onClick={() => setSelectedModel(result.model)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedModel(result.model); } }} className="group cursor-pointer focus:outline-none">
              <title>{result.model}: recall {result.performance.line.recall.toFixed(3)}, precision {result.performance.line.precision.toFixed(3)}, Pass@1 {formatMetric(result.performance.pass_at_1, "pass_at_1")}</title>
              <circle cx={x(result.performance.line.recall)} cy={y(result.performance.line.precision)} r={Math.max(14, radius + 4)} fill="transparent" stroke="transparent" className="group-focus-visible:stroke-primary" strokeWidth="2" />
              <circle cx={x(result.performance.line.recall)} cy={y(result.performance.line.precision)} r={radius} fill="#3b7cb8" fillOpacity={active ? 0.65 : 0.12} stroke={active ? "#0b2d4d" : "#3b7cb8"} strokeOpacity={active ? 1 : 0.6} strokeWidth={active ? 2 : 1.2} />
              {active && <circle cx={x(result.performance.line.recall)} cy={y(result.performance.line.precision)} r="2.5" fill="white" />}
            </g>;
          })}
        </svg>
        <div className="min-w-0">
          <label className="block text-xs font-medium" htmlFor="chart-model">Inspect model</label>
          <select id="chart-model" value={selected.model} onChange={event => setSelectedModel(event.target.value)} className="mt-2 h-10 w-full min-w-0 rounded-lg border border-border bg-card px-2 text-sm">
            {data.map(result => <option key={result.model}>{result.model}</option>)}
          </select>
          <dl aria-live="polite" aria-label="Selected model metrics" className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-muted p-3 text-xs">
            {[["Recall", selected.performance.line.recall.toFixed(3)], ["Precision", selected.performance.line.precision.toFixed(3)], ["Pass@1", formatMetric(selected.performance.pass_at_1, "pass_at_1")]].map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 font-mono text-base font-semibold tabular-nums">{value}</dd></div>)}
          </dl>
          <ul aria-label="Chart models" className="mt-3 hidden max-h-56 overflow-y-auto text-xs lg:block">
            {data.map(result => <li key={result.model}><button type="button" onClick={() => setSelectedModel(result.model)} aria-pressed={result.model === selected.model} className={cn("flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-muted", result.model === selected.model && "bg-accent font-semibold text-primary")}><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /><span className="min-w-0 flex-1">{result.model}</span><span className="font-mono tabular-nums">{formatMetric(result.performance.pass_at_1, "pass_at_1")}</span></button></li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
