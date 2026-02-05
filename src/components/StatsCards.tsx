import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Zap, TrendingUp } from "lucide-react";
import backboneData from "@/data/backbone_results.json";
import { cn } from "@/lib/utils";

export const StatsCards = () => {
  // Use backboneData for stats as it's the more consistent baseline
  const totalModels = backboneData.length;
  const bestPassAt1 = Math.max(...backboneData.map(r => r.performance.pass_at_1));
  const avgEfficiency = backboneData.reduce((acc, r) => acc + r.dynamics.efficiency, 0) / totalModels;
  const avgLineF1 = backboneData.reduce((acc, r) => acc + r.performance.line.f1, 0) / totalModels;

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
      value: `${(bestPassAt1 * 100).toFixed(1)}%`,
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100/50",
      accentColor: "bg-emerald-600"
    },
    {
      label: "Avg. Efficiency",
      value: avgEfficiency.toFixed(3),
      icon: Zap,
      color: "text-amber-600",
      bgColor: "bg-amber-100/50",
      accentColor: "bg-amber-600"
    },
    {
      label: "Avg. Line F1",
      value: avgLineF1.toFixed(3),
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100/50",
      accentColor: "bg-indigo-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {stats.map((stat, index) => (
        <Card key={index} className="border border-muted/50 shadow-sm bg-card hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className={cn("absolute top-0 left-0 w-1 h-full opacity-40 group-hover:opacity-100 transition-opacity", stat.accentColor)} />
          <CardContent className="p-5 flex items-center gap-5">
            <div className={`p-3 rounded-xl ${stat.bgColor} shrink-0`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{stat.label}</p>
              <h3 className="text-xl font-bold tracking-tight mt-0.5">{stat.value}</h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
