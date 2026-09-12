import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ClipboardCheck, FileArchive, GitPullRequest } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { submissionCompare, submissionGuide, submissionRepository, submissionTemplate } from "@/lib/submissions";

export const metadata: Metadata = {
  title: "Submit a result | ContextBench",
  description: "Submit ContextBench evaluation results and logs through a GitHub pull request for maintainer review.",
};

const steps = [
  { icon: FileArchive, title: "Prepare your results", text: "Run ContextBench and save your evaluation outputs, execution logs, and agent trajectories. Record the model, dataset revision, evaluated instances, and reproduction commands." },
  { icon: GitPullRequest, title: "Open a pull request", text: "Fork the leaderboard repository, copy the submission template, and add your results and logs. Run the format check, then open a PR against main using the submission checklist." },
  { icon: ClipboardCheck, title: "Review and publication", text: "Maintainers review the evaluation setup, logs, and reported scores. Once approved, they add your result to the leaderboard and merge the update." },
];

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to leaderboard
        </Link>
        <header className="mt-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Contribute to ContextBench</p>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl tracking-tight">Submit a result</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Share your system&apos;s performance with the community. Submit results and logs to our GitHub repository for review before they appear on the leaderboard.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild className="rounded-full"><a href={submissionGuide}>Read the submission guide <ArrowUpRight className="h-4 w-4" /></a></Button>
            <Button variant="outline" asChild className="rounded-full"><a href={submissionTemplate}>Get the template <ArrowUpRight className="h-4 w-4" /></a></Button>
          </div>
        </header>

        <ol className="my-12 grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="rounded-2xl border border-muted/60 bg-card p-6">
              <div className="mb-5 flex items-center justify-between text-brand"><Icon className="h-6 w-6" /><span className="font-mono text-sm text-muted-foreground">0{index + 1}</span></div>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>

        <section className="rounded-3xl border border-muted/60 bg-card p-6 md:p-8" aria-labelledby="submission-files">
          <h2 id="submission-files" className="font-serif text-2xl">What to include</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Create one folder per system and evaluation run. Include failed attempts and disclose any retries or task filtering so reviewers can check coverage and reproduce the scores.</p>
          <pre className="my-6 overflow-x-auto rounded-xl bg-muted/40 p-5 text-xs sm:text-sm leading-7"><code>{`submissions/YYYY-MM-DD_system-name/
  metadata.json   # system, submitter, evaluation setup
  results.json    # reported leaderboard metrics
  README.md       # method and reproduction instructions
  logs/          # raw evaluation outputs and execution logs
  trajectories/  # recorded agent interactions per instance`}</code></pre>
          <p className="text-sm leading-relaxed text-muted-foreground">Choose <strong className="text-foreground">Backbone Only</strong> for a model evaluated with the benchmark&apos;s adapted mini SWE-agent, or <strong className="text-foreground">Agent + Backbone</strong> for an agent and model combination. Use fractions between 0 and 1 for Pass@1 and retrieval scores; omit optional metrics that were not evaluated.</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Keep artifacts in your submission folder. Remove credentials and personal data before committing; document any redactions. The guide covers large logs and the full review checklist.</p>
        </section>

        <section className="mt-8 rounded-2xl border border-primary/15 bg-primary/5 p-6 md:p-8">
          <h2 className="text-lg font-bold">Ready for review?</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Push your submission branch to your fork, then select it under “compare across forks” on GitHub. Automated checks validate the format; maintainers verify the results and publish approved scores.</p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Button asChild className="rounded-full"><a href={submissionCompare}><GitPullRequest className="h-4 w-4" /> Open a submission PR</a></Button>
            <a href={`${submissionRepository}/pulls`} className="text-sm underline underline-offset-4">Browse submissions</a>
          </div>
        </section>
      </div>
    </main>
  );
}
