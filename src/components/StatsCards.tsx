import { formatMetric, metricValue, systemViews, type BenchmarkResult, type SystemType } from "@/lib/leaderboard";

export const StatsCards = ({ data, systemType }: { data: BenchmarkResult[]; systemType: SystemType }) => {
  const best = (key: "pass_at_1" | "line_f1") => data.reduce<BenchmarkResult | undefined>((current, row) => !current || metricValue(row, key)! > metricValue(current, key)! ? row : current, undefined);
  const pass = best("pass_at_1");
  const f1 = best("line_f1");
  const stats = [
    { label: systemViews[systemType].countLabel, value: String(data.length), description: systemViews[systemType].label },
    { label: "Best Pass@1", value: formatMetric(pass?.performance.pass_at_1, "pass_at_1"), description: pass?.model },
    { label: "Best context F1", value: formatMetric(f1?.performance.line.f1, "line_f1"), description: f1?.model },
  ];
  return (
    <dl aria-label={`${systemViews[systemType].label} summary`} className="grid grid-cols-3 divide-x divide-border border-y border-border bg-muted/40">
      {stats.map(stat => <div key={stat.label} className="min-w-0 px-3 py-3 sm:px-5">
        <dt className="text-[11px] font-medium text-muted-foreground sm:text-xs">{stat.label}</dt>
        <dd className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-3"><span className="text-lg font-semibold tabular-nums text-primary">{stat.value}</span><span title={stat.description} className="hidden truncate text-xs text-muted-foreground lg:block">{stat.description}</span></dd>
      </div>)}
    </dl>
  );
};
