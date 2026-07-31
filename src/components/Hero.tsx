import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Database, FileText } from "lucide-react";

const stats = [
  { value: "1,136", label: "Tasks" },
  { value: "66", label: "Repositories" },
  { value: "8", label: "Languages" },
  { value: "10", label: "Backbones" },
];

export const Hero = () => {
  return (
    <div className="relative pt-16 pb-10 overflow-hidden">
      <div className="container px-4 mx-auto relative z-10 text-center">
        <div className="animate-rise flex flex-col items-center">
          <img
            src="/figures/logo.png"
            alt="ContextBench logo"
            className="h-20 w-auto mb-6 drop-shadow-[0_8px_24px_rgba(238,67,69,0.25)]"
          />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5">
            Context<span className="text-brand-gradient">Bench</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            A scientific benchmark evaluating the dynamics of multi-file context retrieval in LLM agents.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="https://arxiv.org/abs/2602.05892"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 h-11 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5"
            >
              <FileText className="h-4 w-4 opacity-80" />
              Read the Paper
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="https://huggingface.co/datasets/Contextbench/ContextBench"
              className="group inline-flex items-center gap-2 rounded-full border border-muted-foreground/20 bg-background/60 backdrop-blur px-6 h-11 text-sm font-bold text-foreground transition-all hover:border-foreground/40 hover:-translate-y-0.5"
            >
              <Database className="h-4 w-4 text-amber-500/90" />
              Dataset
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center divide-x divide-muted-foreground/15 gap-y-4">
            {stats.map((s) => (
              <div key={s.label} className="px-4 sm:px-5 md:px-7 text-center">
                <div className="text-xl md:text-2xl font-extrabold tracking-tight tabular-nums">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mesh Gradient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-orange-100/60 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] w-[35%] h-[50%] rounded-full bg-rose-100/50 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[50%] rounded-full bg-teal-50/50 blur-[110px]" />
      </div>
    </div>
  );
};
