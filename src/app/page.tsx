"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { DetailedTable } from "@/components/DetailedTable";
import { StatsCards } from "@/components/StatsCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion } from "framer-motion";
import { LayoutDashboard, Microscope, Trophy, Settings2, Box, Cpu } from "lucide-react";

export default function Home() {
  const [primaryMetric, setPrimaryMetric] = useState("performance_pass_at_1");
  const [systemType, setSystemType] = useState("backbone"); // "backbone" or "agent"

  const metricLabels: Record<string, string> = {
    "performance_pass_at_1": "Pass@1",
    "performance_line_f1": "Context F1",
    "dynamics_efficiency": "Efficiency"
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
              <h2 className="text-3xl font-bold tracking-tight">Benchmark Rankings</h2>
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

            <TabsContent value="detailed" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <DetailedTable systemType={systemType} />
              </motion.div>
            </TabsContent>
          </Tabs>

          {systemType === "agent" && (
            <div className="mt-8 pt-6 border-t border-muted/30">
              <p className="text-xs text-muted-foreground italic flex items-center gap-2 px-2">
                <Settings2 className="h-3.5 w-3.5 text-primary/60" />
                Note: Agents in this category represent specialized versions with task-specific adaptations for ContextBench.
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-32 py-12 border-t bg-muted/5">
        <div className="container px-4 mx-auto text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/40 font-bold">
            © 2026 ContextBench Research Group · All Rights Reserved
          </p>
        </div>
      </footer>
    </main>
  );
}
