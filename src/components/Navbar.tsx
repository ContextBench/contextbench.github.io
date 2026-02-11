import React from 'react';
import Link from 'next/link';
import { Github, Database, LayoutDashboard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-muted/30 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="bg-primary/10 p-1.5 rounded-md group-hover:bg-primary/20 transition-colors">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
            <span className="inline-block font-bold text-lg tracking-tight">
              Context<span className="text-primary">Bench</span>
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
            <Link href="https://github.com/anonymousUser2026/ContextBench">
                  <Github className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">GitHub</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                <Link href="https://huggingface.co/datasets/Contextbench/ContextBench">
                  <Database className="h-4 w-4 text-amber-500/80" />
                  <span className="text-xs font-bold uppercase tracking-widest">Dataset</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                <Link href="https://arxiv.org/abs/2602.05892">
                  <FileText className="h-4 w-4 text-primary/80" />
                  <span className="text-xs font-bold uppercase tracking-widest">Paper</span>
                </Link>
              </Button>
              
              {/* Mobile view icons */}
              <Button variant="ghost" size="icon" asChild className="sm:hidden h-8 w-8 text-muted-foreground">
                <Link href="https://github.com/anonymousUser2026/ContextBench">
                  <Github className="h-4 w-4" />
                </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="sm:hidden h-8 w-8 text-muted-foreground">
            <Link href="https://huggingface.co/datasets/Contextbench/ContextBench">
              <Database className="h-4 w-4 text-amber-500/80" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="sm:hidden h-8 w-8 text-muted-foreground">
            <Link href="https://arxiv.org/abs/2602.05892">
              <FileText className="h-4 w-4 text-primary/80" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};
