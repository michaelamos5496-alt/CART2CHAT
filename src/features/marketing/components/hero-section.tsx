"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useGSAP } from "@gsap/react";

import { Button } from "@/components/ui/button";
import { HeroMockup } from "@/features/marketing/components/hero-mockup";
import { gsap } from "@/lib/gsap";

const HEADLINE_WORDS = ["Turn", "your", "WhatsApp", "into", "a"];

export function HeroSection() {
  const scope = React.useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // prefers-reduced-motion means no non-essential motion, not just
      // faster motion — skip the timeline and show the final state as-is.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // One orchestrated timeline, not scattered per-element animations —
      // the headline leads, everything else falls in behind it.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-eyebrow", { opacity: 0, y: 10, duration: 0.4 })
        .from(
          ".hero-word",
          { opacity: 0, y: 24, stagger: 0.06, duration: 0.55 },
          "-=0.15",
        )
        .from(".hero-sub", { opacity: 0, y: 14, duration: 0.5 }, "-=0.25")
        .from(
          ".hero-cta",
          { opacity: 0, y: 12, stagger: 0.08, duration: 0.45 },
          "-=0.3",
        )
        .from(".hero-fine", { opacity: 0, duration: 0.4 }, "-=0.2")
        .from(
          ".hero-mockup-card-1",
          { opacity: 0, y: 30, rotate: -2, duration: 0.6, ease: "power2.out" },
          "-=0.5",
        )
        .from(
          ".hero-mockup-card-2",
          { opacity: 0, y: 30, rotate: 2, duration: 0.6, ease: "power2.out" },
          "-=0.4",
        );
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative overflow-hidden">
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
        <div className="grid gap-6 text-center lg:text-left">
          <div className="hero-eyebrow border-border bg-card text-muted-foreground mx-auto flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium lg:mx-0">
            <MessageCircle className="size-3.5" />
            For WhatsApp-first businesses
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {HEADLINE_WORDS.map((word) => (
              <span
                key={word}
                className="hero-word mr-[0.25em] inline-block"
              >
                {word}
              </span>
            ))}
            <span className="hero-word from-primary bg-gradient-to-r to-orange-500 bg-clip-text text-transparent inline-block">
              real storefront
            </span>
          </h1>

          <p className="hero-sub text-muted-foreground mx-auto max-w-lg text-base text-balance sm:text-lg lg:mx-0">
            Give customers a beautiful storefront to browse — and get every
            order sent straight to your WhatsApp, formatted and ready to
            confirm. No commissions, no new app to learn.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row lg:items-start lg:justify-start">
            <Button
              size="lg"
              className="hero-cta"
              render={<Link href="/signup" />}
            >
              Get started
              <ArrowRight />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hero-cta"
              render={<Link href="/store/demo" target="_blank" />}
            >
              Try the live demo
            </Button>
          </div>

          <p className="hero-fine text-muted-foreground text-sm">
            Card and Mobile Money accepted.
          </p>
          <p className="hero-fine text-muted-foreground text-sm">
            Curious about the business dashboard too?{" "}
            <Link
              href="/login"
              className="text-foreground font-medium underline underline-offset-2"
            >
              Log in
            </Link>{" "}
            with <span className="font-medium">demo@cart2chat.com</span> /{" "}
            <span className="font-medium">Cart2ChatDemo!</span>
          </p>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}
