import { execFileSync } from "node:child_process";
import { HomePage } from "@/components/HomePage";

export default function Home() {
  // Static export: use the last score-data commit, not the website build date.
  // Omit the date if history is unavailable rather than infer it from the deploy.
  let lastUpdated: string | undefined;
  try {
    const shallow = execFileSync("git", ["rev-parse", "--is-shallow-repository"], { encoding: "utf8", timeout: 2000 }).trim();
    if (shallow === "false") {
      const date = execFileSync("git", ["log", "-1", "--format=%cs", "--", "src/data/backbone_results.json", "src/data/agent_results.json"], { encoding: "utf8", timeout: 2000 }).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) lastUpdated = date;
    }
  } catch { /* Source archives can be built without Git history. */ }
  return <HomePage lastUpdated={lastUpdated} />;
}
