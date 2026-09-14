"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Search, X, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { DetailedTable } from "@/components/DetailedTable";
import { InsightsChart } from "@/components/InsightsChart";
import { StatsCards } from "@/components/StatsCards";
import { ResearchSection } from "@/components/ResearchSection";
import { ResearchFooter } from "@/components/ResearchFooter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filterResults, metrics, metricKeys, nextSort, rankResults, systemViews, type BenchmarkResult, type Sort, type SystemType } from "@/lib/leaderboard";
import { submissionRepository } from "@/lib/submissions";
import backboneData from "@/data/backbone_results.json";
import agentData from "@/data/agent_results.json";

export function HomePage({ lastUpdated }: { lastUpdated?: string }) {
  const [systemType, setSystemType] = useState<SystemType>("agent");
  const [sort, setSort] = useState<Sort>({ key: "line_recall", direction: "desc" });
  const [query, setQuery] = useState("");
  const data: BenchmarkResult[] = systemType === "agent" ? agentData : backboneData;
  const rows = useMemo(() => filterResults(rankResults(data, sort), query), [data, sort, query]);
  const visibleData = useMemo(() => rows.map(row => row.result), [rows]);
  const orderLabel = sort.direction === "desc" ? "High to low" : "Low to high";

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Hero />
        <section id="leaderboard" aria-labelledby="leaderboard-title" className="scroll-mt-20 overflow-hidden font-sans rounded-2xl border border-border bg-card shadow-[0_4px_24px_rgba(11,45,77,0.03)]">
          <header className="px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="leaderboard-title" className="font-serif text-2xl tracking-tight sm:text-3xl">Leaderboard</h2>
                {lastUpdated && <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">Results updated <time dateTime={lastUpdated}>{new Date(`${lastUpdated}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</time></p>}
              </div>
              <Button variant="outline" asChild size="sm" className="rounded-full text-xs"><Link href="/submit">Submit result <ArrowUpRight className="hidden h-3.5 w-3.5 sm:block" /></Link></Button>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <ToggleGroup type="single" value={systemType} aria-label="Evaluation setup" onValueChange={value => { if (value === "backbone" || value === "agent") setSystemType(value); }} className="w-full shrink-0 rounded-lg border border-border bg-muted p-1 sm:w-auto">
                {(["agent", "backbone"] as const).map(type => <ToggleGroupItem key={type} value={type} className="h-8 min-w-0 flex-1 rounded-md px-3 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-white sm:flex-none">{systemViews[type].label}</ToggleGroupItem>)}
              </ToggleGroup>
              <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">{systemViews[systemType].description}</p>
            </div>
          </header>
          <StatsCards data={data} systemType={systemType} />
          <Tabs defaultValue="rankings" className="gap-0">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 px-4 py-3 sm:px-5">
              <TabsList aria-label="Result view" className="h-9 w-auto shrink-0">
                <TabsTrigger value="rankings" className="px-2 text-xs sm:px-4">Rankings</TabsTrigger>
                <TabsTrigger value="analysis" className="px-2 text-xs sm:px-4">Analysis</TabsTrigger>
              </TabsList>
              <div className="relative min-w-0">
                <Search aria-hidden="true" className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" aria-label="Search models and agents" placeholder="Search" value={query} onChange={event => setQuery(event.target.value)} className="h-9 border-border bg-card pr-7 pl-8 text-sm shadow-none [&::-webkit-search-cancel-button]:appearance-none" />
                {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="absolute top-1 right-1 rounded p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>}
              </div>
              <div role="group" aria-label="Ranking metric" className="col-span-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Sort by</span>
                {metricKeys.map(key => <Button key={key} type="button" variant={sort.key === key ? "default" : "outline"} size="sm" aria-label={metrics[key].label} aria-pressed={sort.key === key} title={metrics[key].description} className="h-9 rounded-lg px-2 text-xs sm:px-3" onClick={() => setSort(current => nextSort(current, key))}>{metrics[key].shortLabel}</Button>)}
                <Button type="button" variant="outline" size="icon" aria-label={`Sort order: ${orderLabel}. Reverse order`} title={orderLabel} className="h-9 w-9 shrink-0" onClick={() => setSort(current => nextSort(current, current.key))}>{sort.direction === "desc" ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}</Button>
              </div>
            </div>
            <p aria-live="polite" className="sr-only">Sorted by {metrics[sort.key].label}, {orderLabel.toLowerCase()}. {rows.length} matching results.</p>
            {rows.length === 0 ? <div className="px-4 py-12 text-center"><p className="font-medium">No matching results</p><p className="mt-1 text-sm text-muted-foreground">Try a different model or agent name.</p><Button variant="outline" size="sm" onClick={() => setQuery("")} className="mt-4">Clear search</Button></div> : <>
              <TabsContent value="rankings" className="m-0 px-3 sm:px-5"><LeaderboardTable key={systemType} rows={rows} sort={sort} systemType={systemType} onSort={key => setSort(current => nextSort(current, key))} /></TabsContent>
              <TabsContent value="analysis" className="m-0 space-y-4 px-3 sm:px-5"><InsightsChart data={visibleData} /><DetailedTable data={visibleData} systemType={systemType} /></TabsContent>
            </>}
          </Tabs>
          <div className="space-y-2 px-4 py-4 text-xs leading-relaxed text-muted-foreground sm:px-5">
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><p>Showing {rows.length} of {data.length} {systemViews[systemType].countLabel.toLowerCase()} · {metrics[sort.key].direction === "desc" ? "Higher" : "Lower"} {metrics[sort.key].shortLabel} is better.</p><p>— Not reported · Equal scores share a rank</p></div>
            <details className="group border-t border-border pt-2">
              <summary className="cursor-pointer font-medium text-primary">Evaluation notes &amp; result history</summary>
              <div className="mt-2 max-w-3xl space-y-2">
                <p>Dataset totals above describe ContextBench as a whole. Run-specific task coverage, dataset revisions, and configurations are available with submission artifacts when provided; historical entries may not include them.</p>
                <p>Rank numbers reflect performance on the selected metric. Reversing the display order or searching does not change those ranks. Recall and Context F1 use line-level retrieval scores on a 0–1 scale; Pass@1 is shown as a percentage and costs are in USD.</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2"><a className="underline underline-offset-4" href="https://github.com/EuniAI/ContextBench">Evaluation code &amp; documentation</a><a className="underline underline-offset-4" href={`${submissionRepository}/commits/main/src/data`}>Result history</a><Link className="underline underline-offset-4" href="/submit">Submission &amp; review process</Link></div>
              </div>
            </details>
          </div>
        </section>
      </div>
      <div className="container mx-auto mt-12 flex-1 px-4">
        <ResearchSection />
      </div>
      <ResearchFooter />
    </main>
  );
}
