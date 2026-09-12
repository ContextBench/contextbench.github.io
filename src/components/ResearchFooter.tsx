"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, AlertCircle } from "lucide-react";

export function ResearchFooter() {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const copyResetTimerRef = useRef<number | null>(null);
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
  );
}
