import { ExternalLink } from "lucide-react";
import { formatMetric, systemViews, type BenchmarkResult, type SystemType } from "@/lib/leaderboard";
import { submissionRepository } from "@/lib/submissions";

export function ResultDetails({ result, systemType }: { result: BenchmarkResult; systemType: SystemType }) {
  const value = (n: number | undefined) => n === undefined ? "—" : n.toFixed(2);
  const runMetrics = [
    ["Pass@1", formatMetric(result.performance.pass_at_1, "pass_at_1")],
    ["Retrieval efficiency", formatMetric(result.dynamics?.efficiency, "efficiency")],
    ["Redundancy", formatMetric(result.dynamics?.redundancy, "efficiency")],
    ["Usage drop", formatMetric(result.dynamics?.usage_drop, "efficiency")],
    ["Steps / instance", value(result.patterns?.avg_steps_per_instance)],
    ["Lines / retrieval step", value(result.patterns?.avg_lines_per_step)],
    ["Cost / instance", formatMetric(result.patterns?.avg_cost_per_instance, "cost")],
  ];
  const source = result.submission && `${submissionRepository}/tree/main/submissions/${encodeURIComponent(result.submission)}`;
  return (
    <div className="space-y-5 bg-muted/50 p-4 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-xs font-semibold text-primary">Context retrieval</h4>
          <table className="w-full text-right text-xs"><caption className="sr-only">Retrieval metrics for {result.model}</caption>
            <thead><tr className="text-muted-foreground"><th className="py-2 text-left font-medium">Level</th><th className="font-medium">Recall</th><th className="font-medium">Precision</th><th className="font-medium">F1</th></tr></thead>
            <tbody>{(["file", "block", "line"] as const).map(level => <tr key={level} className="border-t border-border">
              <th scope="row" className="py-2 text-left font-medium capitalize">{level}</th>
              {(["recall", "precision", "f1"] as const).map(metric => <td key={metric} className="font-mono tabular-nums">{result.performance[level][metric].toFixed(3)}</td>)}
            </tr>)}</tbody>
          </table>
        </div>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-3 text-xs sm:grid-cols-3 lg:grid-cols-2">
          {runMetrics.map(([label, metric]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 font-mono font-medium tabular-nums">{metric}</dd></div>)}
        </dl>
      </div>
      <div className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
        <p>{systemViews[systemType].description}</p>
        {source ? <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          <a className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4" href={source}>Submission &amp; logs <ExternalLink className="h-3 w-3" /></a>
          <a className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4" href={`${submissionRepository}/blob/main/submissions/${encodeURIComponent(result.submission!)}/metadata.json`}>Run configuration <ExternalLink className="h-3 w-3" /></a>
        </div> : <p className="mt-1">Run metadata and logs are not attached to this published entry.</p>}
      </div>
    </div>
  );
}
