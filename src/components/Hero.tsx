import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Database, FileText } from "lucide-react";
import { LogoMark } from "@/components/LogoMark";

const stats = [
  { value: "1,136", label: "Tasks" },
  { value: "66", label: "Repositories" },
  { value: "8", label: "Languages" },
  { value: "10", label: "Backbones" },
];

// Deterministic PRNG so SSR and client render the identical minimap
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const MinimapBackdrop = () => {
  const rand = mulberry32(20260730);
  const columns = Array.from({ length: 56 }, () => {
    const lines = Array.from({ length: 14 }, () => {
      const r = rand();
      const tone = r < 0.05 ? "gold" : r < 0.16 ? "blue" : "gray";
      return { w: 4 + Math.floor(rand() * 14), tone, gap: rand() < 0.18 };
    });
    return lines;
  });
  return (
    <div
      aria-hidden
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none [mask-image:radial-gradient(ellipse_70%_80%_at_50%_35%,black_20%,transparent_75%)]"
    >
      <div className="absolute inset-x-0 top-0 h-full flex justify-center gap-[10px] opacity-70">
        {columns.map((lines, i) => (
          <div key={i} className="flex flex-col gap-[7px] pt-2">
            {lines.map((l, j) => (
              <div
                key={j}
                style={{ width: `${l.w}px` }}
                className={
                  l.gap
                    ? "bg-transparent h-[3px]"
                    : l.tone === "gold"
                      ? "bg-amber-500/50 h-[3px] rounded-full"
                      : l.tone === "blue"
                        ? "bg-[#3b7cb8]/40 h-[3px] rounded-full"
                        : "bg-foreground/[0.07] h-[3px] rounded-full"
                }
              />
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
    </div>
  );
};

export const Hero = () => {
  return (
    <div className="relative pt-16 pb-10 overflow-hidden">
      <MinimapBackdrop />
      <div className="container px-4 mx-auto relative z-10 text-center">
        <div className="animate-rise flex flex-col items-center">
          <LogoMark className="h-20 w-20 mb-6 drop-shadow-[0_8px_24px_rgba(11,45,77,0.18)]" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5">
            <span className="text-brand">Context</span>
            <span className="text-brand-navy italic">Bench</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            A scientific benchmark evaluating the dynamics of multi-file context retrieval in LLM agents.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="https://arxiv.org/abs/2602.05892"
              className="group inline-flex items-center gap-2 rounded-full bg-[#0b2d4d] px-6 h-11 text-sm font-bold text-white shadow-lg shadow-[#0b2d4d]/20 transition-all hover:shadow-xl hover:shadow-[#0b2d4d]/25 hover:-translate-y-0.5"
            >
              <FileText className="h-4 w-4 opacity-80" />
              Read the Paper
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="https://huggingface.co/datasets/Contextbench/ContextBench"
              className="group inline-flex items-center gap-2 rounded-full border border-muted-foreground/20 bg-background/60 backdrop-blur px-6 h-11 text-sm font-bold text-foreground transition-all hover:border-[#3b7cb8]/50 hover:-translate-y-0.5"
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
    </div>
  );
};
