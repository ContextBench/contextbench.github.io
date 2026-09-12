import Link from "next/link";
import { ArrowUpRight, Database, FileText } from "lucide-react";
import { LogoMark } from "@/components/LogoMark";

export const Hero = () => (
  <header className="relative overflow-hidden font-sans py-5 md:py-9">
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-40 [mask-image:linear-gradient(to_right,transparent,black)]">
      <defs><pattern id="code-context" width="216" height="76" patternUnits="userSpaceOnUse">
        <g fill="#64748b" opacity=".14"><rect x="8" y="8" width="24" height="3" rx="1.5" /><rect x="42" y="8" width="40" height="3" rx="1.5" /><rect x="154" y="8" width="22" height="3" rx="1.5" /><rect x="22" y="28" width="36" height="3" rx="1.5" /><rect x="134" y="28" width="24" height="3" rx="1.5" /><rect x="66" y="49" width="28" height="3" rx="1.5" /><rect x="126" y="49" width="42" height="3" rx="1.5" /><rect x="28" y="66" width="26" height="3" rx="1.5" /><rect x="154" y="66" width="16" height="3" rx="1.5" /></g>
        <g fill="#3b7cb8" opacity=".35"><rect x="98" y="8" width="30" height="3" rx="1.5" /><rect x="8" y="49" width="34" height="3" rx="1.5" /><rect x="102" y="66" width="28" height="3" rx="1.5" /></g>
        <g fill="#d97706" opacity=".3"><rect x="78" y="28" width="18" height="3" rx="1.5" /><rect x="184" y="49" width="22" height="3" rx="1.5" /></g>
      </pattern></defs>
      <rect width="100%" height="100%" fill="url(#code-context)" />
    </svg>
    <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-10">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <LogoMark className="hidden h-12 w-12 drop-shadow-[0_4px_12px_rgba(11,45,77,0.15)] sm:block" />
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl"><span className="text-brand">Context</span><span className="text-brand-navy italic">Bench</span></h1>
        </div>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base"><span className="sm:hidden">A benchmark for context retrieval in coding agents.</span><span className="hidden sm:inline">Measuring how coding agents find and use code context.<br /> Compare task success, retrieval quality, and efficiency.</span></p>
        <div className="mt-3 flex flex-wrap items-center gap-3 md:mt-4 text-sm font-medium">
          <Link href="https://arxiv.org/abs/2602.05892" className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0b2d4d] px-3 text-xs sm:px-4 font-semibold text-white shadow-md shadow-primary/15 transition-transform hover:-translate-y-0.5 sm:text-sm"><FileText className="h-4 w-4" /> Read the paper <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          <Link href="https://huggingface.co/datasets/Contextbench/ContextBench" className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 text-xs sm:px-4 font-medium text-primary transition-all hover:-translate-y-0.5 hover:border-[#3b7cb8]/40 sm:text-sm"><Database className="h-4 w-4 text-amber-600" /> Dataset <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </div>
      </div>
      <dl aria-label="Dataset size" className="flex shrink-0 gap-4 border-t border-border/70 pt-3 md:gap-6 md:border-t-0 md:border-l md:pl-7 md:pt-0">
        {[['1,136', 'Tasks'], ['66', 'Repositories'], ['8', 'Languages']].map(([value, label]) => (
          <div key={label} className="flex items-baseline gap-1.5 md:flex-col md:gap-0"><dt className="order-2 text-[11px] text-muted-foreground md:mt-0.5 md:text-xs"><span className="md:hidden">{label === "Repositories" ? "Repos" : label}</span><span className="hidden md:inline">{label}</span></dt><dd className="text-base font-semibold tabular-nums text-primary md:text-2xl">{value}</dd></div>
        ))}
      </dl>
    </div>
  </header>
);
