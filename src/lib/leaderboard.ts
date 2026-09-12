export type SystemType = "backbone" | "agent";
export type MetricKey = "pass_at_1" | "line_f1" | "efficiency" | "cost";
export type Sort = { key: MetricKey; direction: "asc" | "desc" };
export type RetrievalMetrics = { recall: number; precision: number; f1: number };

export interface BenchmarkResult {
  model: string;
  submission?: string;
  performance: { file: RetrievalMetrics; block: RetrievalMetrics; line: RetrievalMetrics; pass_at_1: number };
  patterns?: { avg_steps_per_instance?: number; avg_lines_per_step?: number; avg_cost_per_instance?: number };
  dynamics?: { efficiency: number; redundancy: number; usage_drop: number };
}

export const systemViews = {
  backbone: {
    label: "Fixed harness",
    countLabel: "Models",
    description: "Models compared with the same ContextBench-adapted mini SWE-agent harness.",
  },
  agent: {
    label: "Agent systems",
    countLabel: "Systems",
    description: "Agent–model combinations, including mini SWE-agent baselines. Agents use ContextBench-specific adaptations.",
  },
};

export const metricKeys: MetricKey[] = ["pass_at_1", "line_f1", "efficiency", "cost"];
export const metrics: Record<MetricKey, { label: string; shortLabel: string; direction: "asc" | "desc"; description: string }> = {
  pass_at_1: { label: "Pass@1", shortLabel: "Pass@1", direction: "desc", description: "Share of issues resolved in a single attempt. Higher is better." },
  line_f1: { label: "Context F1", shortLabel: "Context F1", direction: "desc", description: "Line-level retrieval F1, balancing precision and recall. Higher is better." },
  efficiency: { label: "Retrieval efficiency", shortLabel: "Efficiency", direction: "desc", description: "Efficiency of context retrieval. Higher is better; unreported values are listed last." },
  cost: { label: "Average cost", shortLabel: "Avg. cost", direction: "asc", description: "Average inference cost per instance in USD. Lower is better; unreported values are listed last." },
};

export function metricValue(result: BenchmarkResult, key: MetricKey): number | undefined {
  const value = key === "pass_at_1" ? result.performance.pass_at_1
    : key === "line_f1" ? result.performance.line.f1
    : key === "efficiency" ? result.dynamics?.efficiency
    : result.patterns?.avg_cost_per_instance;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function formatMetric(value: number | undefined, key: MetricKey): string {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return key === "pass_at_1" ? `${(value * 100).toFixed(1)}%`
    : key === "cost" ? `$${value.toFixed(2)}` : value.toFixed(3);
}

export function nextSort(current: Sort, key: MetricKey): Sort {
  return { key, direction: current.key === key ? (current.direction === "desc" ? "asc" : "desc") : metrics[key].direction };
}

export interface RankedResult { result: BenchmarkResult; rank: number | null }

// Ranks always describe performance on the chosen metric, independent of display
// direction or search. Equal scores share a rank; missing metrics remain unranked.
export function rankResults(data: BenchmarkResult[], sort: Sort): RankedResult[] {
  const compare = (direction: Sort["direction"]) => (a: BenchmarkResult, b: BenchmarkResult) => {
    const av = metricValue(a, sort.key);
    const bv = metricValue(b, sort.key);
    if (av === undefined) return bv === undefined ? a.model.localeCompare(b.model, "en") : 1;
    if (bv === undefined) return -1;
    return (direction === "desc" ? bv - av : av - bv) || a.model.localeCompare(b.model, "en");
  };
  const bestFirst = [...data].sort(compare(metrics[sort.key].direction));
  const ranks = new Map<string, number | null>();
  let previousValue: number | undefined;
  let previousRank = 0;
  bestFirst.forEach((result, index) => {
    const value = metricValue(result, sort.key);
    if (value === undefined) ranks.set(result.model, null);
    else {
      if (value !== previousValue) previousRank = index + 1;
      ranks.set(result.model, previousRank);
      previousValue = value;
    }
  });
  return [...data].sort(compare(sort.direction)).map(result => ({ result, rank: ranks.get(result.model) ?? null }));
}

export function filterResults(rows: RankedResult[], query: string): RankedResult[] {
  const search = query.trim().toLocaleLowerCase("en");
  return rows.filter(({ result }) => result.model.toLocaleLowerCase("en").includes(search));
}
