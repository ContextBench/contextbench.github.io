"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const PipelineSection = () => {
  return (
    <div className="mt-20 space-y-20 pb-10">
      {/* Pipeline Overview */}
      <div className="space-y-10 max-w-5xl mx-auto">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">Construction Pipeline</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl mx-auto italic">
            An overview of the ContextBench construction pipeline. ContextBench is curated through three key steps: 
            Task Deduplication, Task Selection, and Expert Annotation.
          </p>
        </div>
        
        <Card className="border-muted/40 shadow-md bg-card/50 overflow-hidden">
          <CardContent className="p-8 space-y-8">
            <div className="rounded-xl overflow-hidden border border-muted/20 bg-white p-4">
                  <img 
                    src="/figures/Pipeline.png" 
                    alt="Construction Pipeline" 
                    className="w-full h-auto object-contain"
                  />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm leading-relaxed">
              <div className="space-y-2">
                <h4 className="font-bold text-primary flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</span>
                  Task Deduplication
                </h4>
                <p className="text-muted-foreground">Removes exact and near-duplicate tasks from multiple issue resolution benchmarks using rule-based and embedding-based detection.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-primary flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">2</span>
                  Task Selection
                </h4>
                <p className="text-muted-foreground">Identifies challenging tasks based on agent solvability and the scope and dispersion of edits in ground-truth patches.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-primary flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">3</span>
                  Expert Annotation
                </h4>
                <p className="text-muted-foreground">Employs expert developers to trace code dependencies to construct gold contexts, validated through LLM-based patch generation.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
