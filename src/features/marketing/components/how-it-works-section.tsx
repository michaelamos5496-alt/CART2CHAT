import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/features/marketing/components/section-heading";
import { STEPS } from "@/features/marketing/lib/content";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-muted/30 border-y py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="From sign-up to your first order"
          description="Four steps, no technical setup, no waiting on a developer."
        />

        <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="bg-border absolute top-6 right-0 left-0 hidden h-px lg:block"
          />
          {STEPS.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.08}>
              <div className="relative grid gap-3">
                <div className="bg-background text-primary border-primary/30 relative z-10 flex size-12 items-center justify-center rounded-full border-2 text-sm font-semibold">
                  {step.number}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
