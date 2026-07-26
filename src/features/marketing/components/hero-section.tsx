import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { HeroMockup } from "@/features/marketing/components/hero-mockup";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="from-primary/15 pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,var(--tw-gradient-from),transparent)]"
      />
      <div
        aria-hidden
        className="bg-primary/10 pointer-events-none absolute top-40 -left-32 -z-10 size-72 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 -right-24 -z-10 size-72 rounded-full bg-orange-400/10 blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32 lg:grid-cols-2 lg:items-center lg:pt-32">
        <Reveal>
          <div className="grid gap-6 text-center lg:text-left">
            <div className="border-border bg-card text-muted-foreground mx-auto flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium lg:mx-0">
              <MessageCircle className="size-3.5" />
              For WhatsApp-first businesses
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Turn your WhatsApp into a{" "}
              <span className="from-primary bg-gradient-to-r to-orange-500 bg-clip-text text-transparent">
                real storefront
              </span>
            </h1>

            <p className="text-muted-foreground mx-auto max-w-lg text-base text-balance sm:text-lg lg:mx-0">
              Give customers a beautiful storefront to browse — and get every
              order sent straight to your WhatsApp, formatted and ready to
              confirm. No commissions, no new app to learn.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row lg:items-start lg:justify-start">
              <Button size="lg" render={<Link href="/signup" />}>
                Get started
                <ArrowRight />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="#how-it-works" />}
              >
                See how it works
              </Button>
            </div>

            <p className="text-muted-foreground text-sm">
              No credit card required to sign up.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <HeroMockup />
        </Reveal>
      </div>
    </section>
  );
}
