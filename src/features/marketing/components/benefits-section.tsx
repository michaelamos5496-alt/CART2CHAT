import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/features/marketing/components/section-heading";
import { BENEFITS } from "@/features/marketing/lib/content";

export function BenefitsSection() {
  return (
    <section id="benefits" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Why Cart-2-Chat"
        title="Built for how you already sell"
        description="You don't need a full e-commerce platform. You need a storefront that sends orders exactly where you already are."
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((benefit, index) => (
          <Reveal key={benefit.title} delay={index * 0.05}>
            <div className="grid h-full gap-3 rounded-xl border p-5">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <benefit.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm">
                {benefit.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
