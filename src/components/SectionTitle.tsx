import React from 'react';

export const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="text-center space-y-4">
    <h2 className="font-serif text-3xl md:text-4xl text-foreground font-medium tracking-tight">{title}</h2>
    <div className="h-1 w-16 bg-foreground/10 mx-auto rounded-full" />
    {subtitle && (
      <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl mx-auto">{subtitle}</p>
    )}
  </div>
);
