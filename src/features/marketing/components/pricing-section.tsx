import Link from "next/link";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/features/marketing/components/section-heading";
import { PRICING_TIERS } from "@/features/marketing/lib/content";
import { cn } from "@/lib/utils";

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Pricing"
        title="Simple pricing, no commissions"
        description="Simple, transparent pricing for every stage."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {PRICING_TIERS.map((tier, index) => (
          <Reveal key={tier.name} delay={index * 0.08}>
            <div
              className={cn(
                "grid h-full gap-6 rounded-2xl border p-6",
                tier.highlighted && "border-primary shadow-lg",
              )}
            >
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{tier.name}</h3>
                  {tier.highlighted && <Badge>Most popular</Badge>}
                </div>
                <p className="text-muted-foreground text-sm">
                  {tier.description}
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">
                  ₵{tier.monthlyPrice}
                </span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>

              <Button
                size="lg"
                variant={tier.highlighted ? "default" : "outline"}
                render={<Link href={tier.href} />}
              >
                {tier.cta}
              </Button>

              <ul className="grid gap-2.5 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="text-primary mt-0.5 size-4 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
