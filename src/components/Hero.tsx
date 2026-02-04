import React from 'react';

export const Hero = () => {
  return (
    <div className="relative pt-12 pb-8 overflow-hidden">
      <div className="container px-4 mx-auto relative z-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-foreground bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
          ContextBench
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          A scientific benchmark evaluating the dynamics of multi-file context retrieval in LLM agents.
        </p>
      </div>
      
      {/* Mesh Gradient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] w-[35%] h-[50%] rounded-full bg-indigo-100/50 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[50%] rounded-full bg-teal-50/50 blur-[110px]" />
      </div>
    </div>
  );
};
