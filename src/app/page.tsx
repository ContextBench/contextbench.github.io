"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { DetailedTable } from "@/components/DetailedTable";
import { InsightsChart } from "@/components/InsightsChart";
import { StatsCards } from "@/components/StatsCards";
import { DatasetStats } from "@/components/DatasetStats";
import { PipelineSection } from "@/components/PipelineSection";
import { Abstract } from "@/components/Abstract";
import { SectionTitle } from "@/components/SectionTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LayoutDashboard, Microscope, Settings2, Box, Cpu, Copy, Check, AlertCircle } from "lucide-react";

export default function Home() {
  const [primaryMetric, setPrimaryMetric] = useState("performance_pass_at_1");
  const [systemType, setSystemType] = useState("backbone"); // "backbone" or "agent"
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const copyResetTimerRef = useRef<number | null>(null);

  const findings = [
    {
      text: "Echoing \"The Bitter Lesson\": More scaffolding does not mean better context retrieval.",
      highlight: "\"The Bitter Lesson\""
    },
    {
      text: "Even frontier LLMs struggle to retrieve precise code context.",
      highlight: "precise code context"
    },
    {
      text: "LLMs favor recall over precision, introducing substantial noise.",
      highlight: "recall over precision"
    },
    {
      text: "Balanced retrieval achieves higher accuracy at lower cost.",
      highlight: "Balanced retrieval"
    },
    {
      text: "Retrieved context is often not used in final solutions.",
      highlight: "not used"
    },
  ];

  const findingStyles = [
    { 
      // Deep Rose
      text: "text-rose-950 dark:text-rose-50", 
      highlight: "font-serif font-bold italic text-rose-700 bg-rose-100/60 dark:bg-rose-900/40 px-2 py-0.5 rounded-md decoration-rose-300 decoration-2 underline underline-offset-4",
      stripe: "bg-rose-500"
    },
    { 
      // Teal
      text: "text-teal-950 dark:text-teal-50", 
      highlight: "font-serif font-bold italic text-teal-700 bg-teal-100/60 dark:bg-teal-900/40 px-2 py-0.5 rounded-md decoration-teal-300 decoration-2 underline underline-offset-4",
      stripe: "bg-teal-500"
    },
    { 
      // Amber
      text: "text-amber-950 dark:text-amber-50", 
      highlight: "font-serif font-bold italic text-amber-700 bg-amber-100/60 dark:bg-amber-900/40 px-2 py-0.5 rounded-md decoration-amber-300 decoration-2 underline underline-offset-4",
      stripe: "bg-amber-500"
    },
    { 
      // Indigo
      text: "text-indigo-950 dark:text-indigo-50", 
      highlight: "font-serif font-bold italic text-indigo-700 bg-indigo-100/60 dark:bg-indigo-900/40 px-2 py-0.5 rounded-md decoration-indigo-300 decoration-2 underline underline-offset-4",
      stripe: "bg-indigo-500"
    },
    { 
      // Slate
      text: "text-slate-950 dark:text-slate-50", 
      highlight: "font-serif font-bold italic text-slate-700 bg-slate-100/60 dark:bg-slate-900/40 px-2 py-0.5 rounded-md decoration-slate-300 decoration-2 underline underline-offset-4",
      stripe: "bg-slate-500"
    },
  ];

  const bibtexText = `@misc{li2026contextbenchbenchmarkcontextretrieval,
      title={ContextBench: A Benchmark for Context Retrieval in Coding Agents},
      author={Han Li and Letian Zhu and Bohan Zhang and Rili Feng and Jiaming Wang and Yue Pan and Earl T. Barr and Federica Sarro and Zhaoyang Chu and He Ye},
      year={2026},
      eprint={2602.05892},
      archivePrefix={arXiv},
      primaryClass={cs.LG},
      url={https://arxiv.org/abs/2602.05892},
}`;

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current) {
        window.clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  const handleCopyBibtex = async () => {
    try {
      await navigator.clipboard.writeText(bibtexText);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }

    if (copyResetTimerRef.current) {
      window.clearTimeout(copyResetTimerRef.current);
    }
    copyResetTimerRef.current = window.setTimeout(() => {
      setCopyStatus("idle");
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container px-4 mx-auto flex-1">
        <Hero />
        <StatsCards />

        <div className="bg-card rounded-3xl border border-muted/50 p-6 md:p-8 shadow-sm mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-4">
                <h2 className="font-serif text-3xl font-medium tracking-tight">Benchmark Rankings</h2>
                <Button variant="outline" size="sm" asChild className="rounded-full">
                  <Link href="/submit">Submit a result</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground">Sorting by</span>
                <Select value={primaryMetric} onValueChange={setPrimaryMetric}>
                  <SelectTrigger className="w-[180px] h-9 text-sm font-bold bg-primary/5 border-primary/20 text-primary rounded-full focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-muted/50">
                    <SelectItem value="performance_pass_at_1" className="text-sm">Pass@1 Rate</SelectItem>
                    <SelectItem value="performance_line_f1" className="text-sm">Context Line F1</SelectItem>
                    <SelectItem value="dynamics_efficiency" className="text-sm">Retrieval Efficiency</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 ml-2">Primary Metric</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-muted/50">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-3">System View</span>
              <ToggleGroup 
                type="single" 
                value={systemType} 
                onValueChange={(v) => v && setSystemType(v)}
                className="bg-background/50 rounded-xl p-1 border border-muted/20"
              >
                <ToggleGroupItem value="backbone" className="px-4 py-2 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm text-xs font-bold flex gap-2">
                  <Box className="h-3.5 w-3.5" /> Backbone Only
                </ToggleGroupItem>
                <ToggleGroupItem value="agent" className="px-4 py-2 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm text-xs font-bold flex gap-2">
                  <Cpu className="h-3.5 w-3.5" /> Agent + Backbone
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <Tabs defaultValue="preview" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-muted/30 pb-4">
              <TabsList className="h-10 p-1 bg-muted/40 border border-muted/50 rounded-xl">
                <TabsTrigger value="preview" className="text-xs px-8 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex gap-2 font-bold tracking-tight">
                  <LayoutDashboard className="h-4 w-4" /> Main Board
                </TabsTrigger>
                <TabsTrigger value="detailed" className="text-xs px-8 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex gap-2 font-bold tracking-tight">
                  <Microscope className="h-4 w-4" /> Detailed Analysis
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 bg-muted/20 px-4 py-2 rounded-full border border-muted/30">
                <Settings2 className="h-3.5 w-3.5" />
                <span>Showing {systemType === "agent" ? "Agent Integrated" : "Raw Backbone"} Capabilities</span>
              </div>
            </div>

            <TabsContent value="preview" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <LeaderboardTable primaryMetric={primaryMetric} systemType={systemType} />
              </motion.div>
            </TabsContent>

            <TabsContent value="detailed" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <InsightsChart systemType={systemType} />
                <DetailedTable systemType={systemType} />
              </motion.div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 pt-6 border-t border-muted/30">
            {systemType === "agent" ? (
              <p className="text-xs text-muted-foreground italic flex items-center gap-2 px-2">
                <Settings2 className="h-3.5 w-3.5 text-primary/60" />
                Note: Agents in this category represent specialized versions with task-specific adaptations for ContextBench.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic flex items-center gap-2 px-2">
                <Settings2 className="h-3.5 w-3.5 text-primary/60" />
                Note: Evaluations in this category are conducted based on our task-specific adaptations of the mini SWE-agent.
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground/70 italic px-2">
              &quot;--&quot; marks metrics that have not been evaluated yet for this system.
            </p>
          </div>
        </div>

        <section className="mb-20 max-w-4xl mx-auto px-4">
          <div className="mb-12">
            <SectionTitle title="Key Findings" />
          </div>

          <div className="grid gap-6">
            {findings.map((item, index) => {
              const style = findingStyles[index % findingStyles.length];
              const parts = item.text.split(item.highlight);

              return (
                <div
                  key={index}
                  className="group relative flex items-start p-6 md:p-8 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-muted/60 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white dark:hover:bg-zinc-900"
                >
                  {/* Left Accent Stripe */}
                  <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${style.stripe} opacity-30 group-hover:opacity-100 transition-all duration-500 scale-y-75 group-hover:scale-y-100`} />
                  
                  {/* Content Container */}
                  <div className="flex gap-6 md:gap-8 w-full pl-3">
                    {/* Numbering */}
                    <span className="flex-shrink-0 font-serif text-3xl md:text-4xl text-muted-foreground/20 font-light select-none group-hover:text-foreground/80 transition-colors duration-500">
                      0{index + 1}
                    </span>

                    {/* Text Content */}
                    <p className={`text-lg md:text-xl leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 w-full`}>
                      {parts[0]}
                      <span className={`inline-block transform transition-transform duration-300 group-hover:-translate-y-0.5 ${style.highlight} shadow-sm`}>
                        {item.highlight}
                      </span>
                      {parts[1]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Abstract />
        <PipelineSection />
        <DatasetStats />
      </div>

      <footer className="mt-16 py-12 border-t bg-muted/5">
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-4xl mx-auto text-left mb-8 rounded-2xl border border-muted/50 bg-card/60 shadow-sm p-4 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary/70">How to Cite</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  If you use ContextBench, please cite:
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={handleCopyBibtex}
                aria-label="Copy BibTeX"
              >
                {copyStatus === "copied" ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : copyStatus === "error" ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" />
                    Copy failed
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="mt-4 rounded-xl border border-muted/40 bg-background/70 p-4 text-xs md:text-sm font-mono leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
              <code>{bibtexText}</code>
            </pre>
          </div>

          <div className="max-w-4xl mx-auto text-left mb-10 rounded-2xl border border-muted/40 bg-background/40 p-4 md:p-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary/70">Authors</h3>
            <p className="mt-3 text-sm text-foreground/90 leading-relaxed">
              Han Li<sup>1</sup> Letian Zhu<sup>1*</sup> Bohan Zhang<sup>1*</sup> Rili Feng<sup>1*</sup> Jiaming Wang<sup>1</sup> Yue Pan<sup>2</sup> Earl T. Barr<sup>2</sup> Federica Sarro<sup>2</sup> Zhaoyang Chu<sup>2†</sup> He Ye<sup>2†</sup>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">1Nanjing University 2University College London</p>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              *These authors contributed equally as co-second authors.
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              †Corresponding authors. Email: {`{he.ye, zhaoyang.chu.25}@ucl.ac.uk`}
            </p>
          </div>

          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/40 font-bold">
            © 2026 ContextBench Research Group · All Rights Reserved
          </p>
        </div>
      </footer>
    </main>
  );
}
