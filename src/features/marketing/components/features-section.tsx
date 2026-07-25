import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/features/marketing/components/section-heading";
import { FEATURES } from "@/features/marketing/lib/content";

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Features"
        title="Everything your storefront needs"
        description="No plugins to install, no third-party tools to wire together."
      />

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature, index) => (
          <Reveal key={feature.title} delay={(index % 4) * 0.05}>
            <div className="bg-card hover:bg-muted/40 grid h-full gap-3 p-6 transition-colors">
              <feature.icon className="text-primary size-5" />
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
