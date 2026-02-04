"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { DetailedTable } from "@/components/DetailedTable";
import { StatsCards } from "@/components/StatsCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { LayoutDashboard, Microscope } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container px-4 mx-auto flex-1">
        <Hero />
        <StatsCards />

        <Tabs defaultValue="preview" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                Ranked by <span className="font-bold text-primary underline underline-offset-4 decoration-primary/30">Pass@1</span> (Primary Metric)
              </p>
            </div>
            <TabsList className="h-11 p-1 bg-muted/40 border border-muted/50 rounded-xl">
              <TabsTrigger value="preview" className="text-xs px-8 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex gap-2">
                <LayoutDashboard className="h-3.5 w-3.5" /> Main Board
              </TabsTrigger>
              <TabsTrigger value="detailed" className="text-xs px-8 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex gap-2">
                <Microscope className="h-3.5 w-3.5" /> Detailed Analysis
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="preview" className="mt-0 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <LeaderboardTable />
            </motion.div>
          </TabsContent>

          <TabsContent value="detailed" className="mt-0 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <DetailedTable />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <footer className="mt-32 py-10 border-t bg-muted/5">
        <div className="container px-4 mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold">
            © 2026 ContextBench Research Group · All Rights Reserved
          </p>
        </div>
      </footer>
    </main>
  );
}
