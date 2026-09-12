import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/LogoMark";

export const Navbar = () => (
  <nav aria-label="Main navigation" className="font-sans sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
      <Link href="/" aria-label="ContextBench home" className="flex shrink-0 items-center gap-2">
        <LogoMark className="h-7 w-7" />
        <span className="hidden text-sm font-bold tracking-tight min-[360px]:inline sm:text-base"><span className="text-brand">Context</span><span className="text-brand-navy italic">Bench</span></span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-5">
        <Link href="/#leaderboard" className="hidden text-sm font-medium text-muted-foreground hover:text-primary sm:block">Leaderboard</Link>
        <Link href="/#about" className="text-xs font-medium text-muted-foreground hover:text-primary sm:text-sm">About</Link>
        <a href="https://github.com/EuniAI/ContextBench" aria-label="ContextBench on GitHub" className="hidden rounded p-1 text-muted-foreground hover:text-primary min-[360px]:block"><Github className="h-4 w-4" /></a>
        <Button asChild size="sm" className="rounded-full px-3 text-xs sm:px-4"><Link href="/submit">Submit<span className="hidden sm:inline"> a result</span></Link></Button>
      </div>
    </div>
  </nav>
);
