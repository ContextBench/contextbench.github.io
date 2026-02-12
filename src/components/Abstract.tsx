"use client";

import React from 'react';
import { motion } from "framer-motion";

export const Abstract = () => {
  return (
    <section className="py-24 max-w-4xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-muted/20 via-muted/5 to-transparent border border-muted/30 shadow-2xl shadow-black/5 overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative space-y-12">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-primary/40">Abstract</h2>
            <div className="h-1 w-8 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full" />
          </div>
          
          <div className="space-y-8 text-base md:text-[1.05rem] leading-[1.85] text-muted-foreground/90 font-sans text-justify hyphens-auto max-w-3xl mx-auto">
            <p>
              LLM-based coding agents have shown strong performance on automated issue resolution benchmarks, yet existing evaluations largely focus on final task success, providing limited insight into how agents retrieve and use code context during problem solving.
            </p>
            <p>
              We introduce <span className="text-foreground/90 font-medium italic decoration-primary/20 underline underline-offset-4">ContextBench</span>, a process-oriented evaluation of context retrieval in coding agents. 
              ContextBench consists of 1,136 issue-resolution tasks from 66 repositories across eight programming languages, each augmented with human-annotated gold contexts. 
              We further implement an automated evaluation framework that tracks agent trajectories and measures context recall, precision, and efficiency throughout issue resolution.
            </p>
            <p>
              Using ContextBench, we evaluate four frontier LLMs and five coding agents. 
              Our results show that sophisticated agent scaffolding yields only marginal gains in context retrieval (<span className="text-primary/70 italic">"The Bitter Lesson"</span> of coding agents), 
              LLMs consistently favor recall over precision, and substantial gaps exist between explored and utilized context. 
              ContextBench augments existing end-to-end benchmarks with intermediate gold-context metrics that unbox the issue-resolution process, offering valuable signals for guiding LLM reasoning in software tasks.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
