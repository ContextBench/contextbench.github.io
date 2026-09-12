import { Abstract } from "@/components/Abstract";
import { PipelineSection } from "@/components/PipelineSection";
import { DatasetStats } from "@/components/DatasetStats";
import { SectionTitle } from "@/components/SectionTitle";

// Preserve the original research section's content, layout, and visual styling.
export function ResearchSection() {
  const findings = [
    {
      text: "Echoing \"The Bitter Lesson\": More scaffolding does not mean better context retrieval.",
      highlight: "\"The Bitter Lesson\""
    },
    {
      text: "Even frontier LLMs struggle to retrieve precise code context.",
      highlight: "precise code context"
    },
    {
      text: "LLMs favor recall over precision, introducing substantial noise.",
      highlight: "recall over precision"
    },
    {
      text: "Balanced retrieval achieves higher accuracy at lower cost.",
      highlight: "Balanced retrieval"
    },
    {
      text: "Retrieved context is often not used in final solutions.",
      highlight: "not used"
    },
  ];

  const findingStyles = [
    {
      // Deep Rose
      text: "text-rose-950 dark:text-rose-50",
      highlight: "font-serif font-bold italic text-rose-700 bg-rose-100/60 dark:bg-rose-900/40 px-2 py-0.5 rounded-md decoration-rose-300 decoration-2 underline underline-offset-4",
      stripe: "bg-rose-500"
    },
    {
      // Teal
      text: "text-teal-950 dark:text-teal-50",
      highlight: "font-serif font-bold italic text-teal-700 bg-teal-100/60 dark:bg-teal-900/40 px-2 py-0.5 rounded-md decoration-teal-300 decoration-2 underline underline-offset-4",
      stripe: "bg-teal-500"
    },
    {
      // Amber
      text: "text-amber-950 dark:text-amber-50",
      highlight: "font-serif font-bold italic text-amber-700 bg-amber-100/60 dark:bg-amber-900/40 px-2 py-0.5 rounded-md decoration-amber-300 decoration-2 underline underline-offset-4",
      stripe: "bg-amber-500"
    },
    {
      // Indigo
      text: "text-indigo-950 dark:text-indigo-50",
      highlight: "font-serif font-bold italic text-indigo-700 bg-indigo-100/60 dark:bg-indigo-900/40 px-2 py-0.5 rounded-md decoration-indigo-300 decoration-2 underline underline-offset-4",
      stripe: "bg-indigo-500"
    },
    {
      // Slate
      text: "text-slate-950 dark:text-slate-50",
      highlight: "font-serif font-bold italic text-slate-700 bg-slate-100/60 dark:bg-slate-900/40 px-2 py-0.5 rounded-md decoration-slate-300 decoration-2 underline underline-offset-4",
      stripe: "bg-slate-500"
    },
  ];

  return (<>
        <section id="about" aria-label="Key findings" className="mb-20 max-w-4xl mx-auto scroll-mt-20 px-4">
          <div className="mb-12">
            <SectionTitle title="Key Findings" />
          </div>

          <div className="grid gap-6">
            {findings.map((item, index) => {
              const style = findingStyles[index % findingStyles.length];
              const parts = item.text.split(item.highlight);

              return (
                <div
                  key={index}
                  className="group relative flex items-start p-6 md:p-8 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-muted/60 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white dark:hover:bg-zinc-900"
                >
                  {/* Left Accent Stripe */}
                  <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${style.stripe} opacity-30 group-hover:opacity-100 transition-all duration-500 scale-y-75 group-hover:scale-y-100`} />

                  {/* Content Container */}
                  <div className="flex gap-6 md:gap-8 w-full pl-3">
                    {/* Numbering */}
                    <span className="flex-shrink-0 font-serif text-3xl md:text-4xl text-muted-foreground/20 font-light select-none group-hover:text-foreground/80 transition-colors duration-500">
                      0{index + 1}
                    </span>

                    {/* Text Content */}
                    <p className={`text-lg md:text-xl leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 w-full`}>
                      {parts[0]}
                      <span className={`inline-block transform transition-transform duration-300 group-hover:-translate-y-0.5 ${style.highlight} shadow-sm`}>
                        {item.highlight}
                      </span>
                      {parts[1]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Abstract />
        <PipelineSection />
        <DatasetStats />
  </>);
}
