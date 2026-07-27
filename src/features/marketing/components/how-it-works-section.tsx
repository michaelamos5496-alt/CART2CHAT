"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";

import { SectionHeading } from "@/features/marketing/components/section-heading";
import { STEPS } from "@/features/marketing/lib/content";
import { gsap } from "@/lib/gsap";

export function HowItWorksSection() {
  const scope = React.useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // The connector line draws in sync with scroll position (scrubbed,
      // not a one-shot trigger) so it reads as the steps unfolding as you
      // scroll past them, then each step's circle/text follows right
      // behind wherever the line has reached.
      gsap.set(".step-line", { scaleX: 0, transformOrigin: "left center" });
      gsap.to(".step-line", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: scope.current,
          start: "top 70%",
          end: "bottom 60%",
          scrub: 0.6,
        },
      });

      gsap.from(".step-item", {
        opacity: 0,
        y: 20,
        stagger: 0.15,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: scope.current,
          start: "top 75%",
        },
      });
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="how-it-works"
      className="bg-muted/30 border-y py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="From sign-up to your first order"
          description="Four steps, no technical setup, no waiting on a developer."
        />

        <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="step-line bg-primary/40 absolute top-6 right-0 left-0 hidden h-px lg:block"
          />
          {STEPS.map((step) => (
            <div key={step.number} className="step-item relative grid gap-3">
              <div className="bg-background text-primary border-primary/30 relative z-10 flex size-12 items-center justify-center rounded-full border-2 text-sm font-semibold">
                {step.number}
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-muted-foreground text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
