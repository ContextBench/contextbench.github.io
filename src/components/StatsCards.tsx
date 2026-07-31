import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Zap, Gauge } from "lucide-react";
import backboneData from "@/data/backbone_results.json";
import { cn } from "@/lib/utils";

export const StatsCards = () => {
  const totalModels = backboneData.length;
  const best = backboneData.reduce((a, b) => (b.performance.pass_at_1 > a.performance.pass_at_1 ? b : a));
  const bestF1 = backboneData.reduce((a, b) => (b.performance.line.f1 > a.performance.line.f1 ? b : a));
  const withDynamics = backboneData.filter((r) => r.dynamics !== undefined);
  const bestEff = withDynamics.reduce((a, b) => (b.dynamics!.efficiency > a.dynamics!.efficiency ? b : a));

  const stats = [
    {
      label: "Foundation Models",
      value: totalModels,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100/50",
      accentColor: "bg-blue-600"
    },
    {
      label: "Best Pass@1",
      value: `${(best.performance.pass_at_1 * 100).toFixed(1)}%`,
      sub: best.model,
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100/50",
      accentColor: "bg-emerald-600"
    },
    {
      label: "Best Context F1",
      value: bestF1.performance.line.f1.toFixed(3),
      sub: bestF1.model,
      icon: Zap,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100/50",
      accentColor: "bg-indigo-600"
    },
    {
      label: "Best Efficiency",
      value: bestEff.dynamics!.efficiency.toFixed(3),
      sub: bestEff.model,
      icon: Gauge,
      color: "text-amber-600",
      bgColor: "bg-amber-100/50",
      accentColor: "bg-amber-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="border border-muted/50 shadow-sm bg-card hover:shadow-md transition-all hover:-translate-y-0.5 relative overflow-hidden group"
        >
          <div className={cn("absolute top-0 left-0 w-1 h-full opacity-40 group-hover:opacity-100 transition-opacity", stat.accentColor)} />
          <CardContent className="p-5 flex items-center gap-5">
            <div className={`p-3 rounded-xl ${stat.bgColor} shrink-0`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{stat.label}</p>
              <h3 className="text-xl font-bold tracking-tight mt-0.5 tabular-nums">{stat.value}</h3>
              {stat.sub && (
                <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">{stat.sub}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
