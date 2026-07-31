"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import backboneData from "@/data/backbone_results.json";
import agentData from "@/data/agent_results.json";
import type { BenchmarkResult } from "./DetailedTable";

const W = 760;
const H = 500;
const M = { top: 24, right: 40, bottom: 56, left: 64 };

export const InsightsChart = ({ systemType }: { systemType: string }) => {
  const data = useMemo<BenchmarkResult[]>(
    () => (systemType === "agent" ? agentData : backboneData) as BenchmarkResult[],
    [systemType]
  );
  const [hovered, setHovered] = useState<number | null>(null);

  const domain = useMemo(() => {
    const m = Math.max(
      ...data.map((d) => Math.max(d.performance.line.recall, d.performance.line.precision))
    );
    return Math.ceil(m * 10) / 10 + 0.05;
  }, [data]);

  const maxPass = useMemo(() => Math.max(...data.map((d) => d.performance.pass_at_1)), [data]);
  const topIndex = useMemo(
    () => data.findIndex((d) => d.performance.pass_at_1 === maxPass),
    [data, maxPass]
  );

  const px = (v: number) => M.left + (v / domain) * (W - M.left - M.right);
  const py = (v: number) => H - M.bottom - (v / domain) * (H - M.top - M.bottom);

  const ticks = useMemo(() => {
    const step = domain > 0.5 ? 0.2 : 0.1;
    const arr: number[] = [];
    for (let v = 0; v <= domain + 1e-9; v += step) arr.push(Number(v.toFixed(2)));
    return arr;
  }, [domain]);

  const diagAngle = (Math.atan2(py(0) - py(domain), px(domain) - px(0)) * 180) / Math.PI;

  return (
    <div className="rounded-2xl border border-muted/50 bg-card shadow-sm p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Precision–Recall Trade-off</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Line-level context retrieval · bubble area and opacity encode Pass@1
          </p>
        </div>
        {/* bubble size legend */}
        <div className="flex items-end gap-3 text-[10px] text-muted-foreground/80 shrink-0">
          <span className="uppercase tracking-widest font-bold">Pass@1</span>
          {[0.05, 0.25, 0.55].map((v) => (
            <span key={v} className="flex flex-col items-center gap-1">
              <span
                className="rounded-full border-[1.5px] border-[#3b7cb8] bg-[#3b7cb8]/5 inline-block"
                style={{
                  width: `${(5 + Math.sqrt(v * 100) * 1.5) * 2}px`,
                  height: `${(5 + Math.sqrt(v * 100) * 1.5) * 2}px`,
                }}
              />
              <span className="font-mono tabular-nums">{(v * 100).toFixed(0)}%</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
          {/* horizontal gridlines only */}
          {ticks
            .filter((t) => t > 0)
            .map((t) => (
              <line
                key={t}
                x1={px(0)}
                y1={py(t)}
                x2={px(domain)}
                y2={py(t)}
                className="stroke-muted-foreground/10"
                strokeWidth={1}
              />
            ))}

          {/* axes */}
          <line x1={px(0)} y1={py(0)} x2={px(domain)} y2={py(0)} className="stroke-muted-foreground/30" strokeWidth={1.2} />
          <line x1={px(0)} y1={py(0)} x2={px(0)} y2={py(domain)} className="stroke-muted-foreground/30" strokeWidth={1.2} />
          {ticks.map((t) => (
            <g key={t}>
              <line x1={px(t)} y1={py(0)} x2={px(t)} y2={py(0) + 5} className="stroke-muted-foreground/30" strokeWidth={1.2} />
              <text x={px(t)} y={py(0) + 22} textAnchor="middle" className="fill-muted-foreground/70 text-[11px] font-mono tabular-nums">
                {t.toFixed(1)}
              </text>
              <line x1={px(0) - 5} y1={py(t)} x2={px(0)} y2={py(t)} className="stroke-muted-foreground/30" strokeWidth={1.2} />
              <text x={px(0) - 10} y={py(t) + 4} textAnchor="end" className="fill-muted-foreground/70 text-[11px] font-mono tabular-nums">
                {t.toFixed(1)}
              </text>
            </g>
          ))}

          {/* balanced diagonal: soft dotted line */}
          <line
            x1={px(0)}
            y1={py(0)}
            x2={px(domain)}
            y2={py(domain)}
            stroke="#cbd5e1"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="1 7"
          />
          <text
            x={px(domain * 0.86)}
            y={py(domain * 0.86) - 10}
            textAnchor="middle"
            transform={`rotate(${-diagAngle} ${px(domain * 0.86)} ${py(domain * 0.86) - 10})`}
            className="fill-muted-foreground/60 text-[10px] font-semibold tracking-[0.14em] uppercase"
          >
            P = R · balanced
          </text>
          <text
            x={px(domain * 0.97)}
            y={py(domain * 0.62)}
            textAnchor="end"
            className="fill-amber-700/50 text-[10px] font-semibold tracking-[0.14em] uppercase"
          >
            R &gt; P · over-retrieval
          </text>

          {/* axis titles */}
          <text
            x={px(domain / 2)}
            y={H - 10}
            textAnchor="middle"
            className="fill-foreground/60 text-[11px] font-bold uppercase tracking-[0.18em]"
          >
            Line Recall
          </text>
          <text
            x={20}
            y={py(domain / 2)}
            textAnchor="middle"
            transform={`rotate(-90 20 ${py(domain / 2)})`}
            className="fill-foreground/60 text-[11px] font-bold uppercase tracking-[0.18em]"
          >
            Line Precision
          </text>

          {/* hover crosshair */}
          {hovered !== null && data[hovered] && (
            <g className="pointer-events-none">
              <line
                x1={px(data[hovered].performance.line.recall)}
                y1={py(0)}
                x2={px(data[hovered].performance.line.recall)}
                y2={py(data[hovered].performance.line.precision)}
                className="stroke-[#3b7cb8]/40"
                strokeDasharray="3 3"
              />
              <line
                x1={px(0)}
                y1={py(data[hovered].performance.line.precision)}
                x2={px(data[hovered].performance.line.recall)}
                y2={py(data[hovered].performance.line.precision)}
                className="stroke-[#3b7cb8]/40"
                strokeDasharray="3 3"
              />
            </g>
          )}

          {/* points with collision-aware labels */}
          {(() => {
            const labels = data.map((d, i) => {
              const r = d.performance.line.recall;
              const p = d.performance.line.precision;
              const radius = 5 + Math.sqrt(d.performance.pass_at_1 * 100) * 1.5;
              const x = px(r);
              const y = py(p);
              return {
                i, x, y, radius, ly: y, w: d.model.length * 5.7,
                place: (r > domain * 0.62 ? "left" : "right") as "left" | "right" | "top" | "bottom",
              };
            });
            const overlaps = (x0: number, x1: number, cy: number, self: number) =>
              labels.some((o) => {
                if (o.i === self) return false;
                const nx = Math.max(x0, Math.min(o.x, x1));
                const ny = Math.max(cy - 7, Math.min(o.y, cy + 7));
                return (o.x - nx) ** 2 + (o.y - ny) ** 2 < (o.radius + 2) ** 2;
              });
            const hitsRight = (l: (typeof labels)[number]) =>
              overlaps(l.x + l.radius + 6, l.x + l.radius + 6 + l.w, l.y, l.i);
            const hitsLeft = (l: (typeof labels)[number]) =>
              overlaps(l.x - l.radius - 6 - l.w, l.x - l.radius - 6, l.y, l.i);
            const hitsTop = (l: (typeof labels)[number]) =>
              overlaps(l.x - l.w / 2, l.x + l.w / 2, l.y - l.radius - 11, l.i);
            const hitsBottom = (l: (typeof labels)[number]) =>
              overlaps(l.x - l.w / 2, l.x + l.w / 2, l.y + l.radius + 11, l.i);
            for (const l of labels) {
              if (l.place === "right" && hitsRight(l)) l.place = "left";
              if (l.place === "left" && hitsLeft(l)) {
                l.place = !hitsRight(l) ? "right" : !hitsTop(l) ? "top" : "bottom";
              }
              if (l.place === "right" && l.x + l.radius + 6 + l.w > W - 8) {
                l.place = !hitsLeft(l) ? "left" : !hitsTop(l) ? "top" : "bottom";
              }
              if (l.place === "left" && l.x - l.radius - 6 - l.w < 8) {
                l.place = !hitsRight(l) ? "right" : !hitsTop(l) ? "top" : "bottom";
              }
            }
            for (const side of ["left", "right"] as const) {
              const group = labels.filter((l) => l.place === side).sort((a, b) => a.ly - b.ly);
              for (let pass = 0; pass < 8; pass++) {
                for (let j = 1; j < group.length; j++) {
                  const prev = group[j - 1];
                  const cur = group[j];
                  const gap = 15;
                  if (Math.abs(cur.x - prev.x) < 190 && cur.ly - prev.ly < gap) {
                    const push = (gap - (cur.ly - prev.ly)) / 2;
                    prev.ly -= push;
                    cur.ly += push;
                  }
                }
                for (const l of group) {
                  l.ly = Math.max(M.top + 6, Math.min(H - M.bottom - 6, l.ly));
                }
              }
            }
            const labelByIndex = new Map(labels.map((l) => [l.i, l]));
            return data.map((d, i) => {
              const L = labelByIndex.get(i)!;
              const dim = hovered !== null && hovered !== i;
              const displaced = (L.place === "left" || L.place === "right") && Math.abs(L.ly - L.y) > 4;
              const tx =
                L.place === "left" ? L.x - L.radius - 6 : L.place === "right" ? L.x + L.radius + 6 : L.x;
              const ty =
                L.place === "top"
                  ? L.y - L.radius - 8
                  : L.place === "bottom"
                    ? L.y + L.radius + 14
                    : L.ly + 3.5;
              const anchor = L.place === "left" ? "end" : L.place === "right" ? "start" : "middle";
              const intensity = 0.45 + 0.55 * (d.performance.pass_at_1 / maxPass);
              const isTop = i === topIndex;
              return (
                <motion.g
                  key={d.model}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: dim ? 0.25 : 1, scale: 1 }}
                  transition={{ delay: i * 0.045, duration: 0.45, ease: "easeOut" }}
                  style={{ transformOrigin: `${L.x}px ${L.y}px` }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                >
                  {displaced && (
                    <line
                      x1={L.x}
                      y1={L.y}
                      x2={L.place === "left" ? L.x - L.radius - 4 : L.x + L.radius + 4}
                      y2={L.ly}
                      className="stroke-muted-foreground/30"
                      strokeWidth={0.75}
                    />
                  )}
                  <circle
                    cx={L.x}
                    cy={L.y}
                    r={L.radius + (hovered === i ? 2.5 : 0)}
                    fill={isTop ? "#d97706" : "#3b7cb8"}
                    fillOpacity={hovered === i ? 0.18 : 0.06}
                    stroke={isTop ? "#d97706" : "#3b7cb8"}
                    strokeOpacity={intensity}
                    strokeWidth={isTop ? 2 : 1.6}
                    className="transition-all"
                  />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor={anchor}
                    className={
                      hovered === i
                        ? "fill-foreground text-[11px] font-semibold pointer-events-none"
                        : "fill-muted-foreground text-[10.5px] font-medium pointer-events-none"
                    }
                  >
                    {d.model}
                  </text>
                </motion.g>
              );
            });
          })()}
        </svg>

        {/* tooltip */}
        {hovered !== null && data[hovered] && (
          <div
            className="absolute pointer-events-none z-10 rounded-xl border border-muted/50 bg-background/95 backdrop-blur px-3.5 py-2.5 shadow-lg text-xs"
            style={{
              left: `${(px(data[hovered].performance.line.recall) / W) * 100}%`,
              top: `${(py(data[hovered].performance.line.precision) / H) * 100}%`,
              transform: "translate(-50%, calc(-100% - 18px))",
            }}
          >
            <div className="font-bold text-foreground whitespace-nowrap mb-1">
              {data[hovered].model}
            </div>
            <div className="font-mono text-muted-foreground whitespace-nowrap tabular-nums">
              R {data[hovered].performance.line.recall.toFixed(3)} · P{" "}
              {data[hovered].performance.line.precision.toFixed(3)} · Pass@1{" "}
              {(data[hovered].performance.pass_at_1 * 100).toFixed(1)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
