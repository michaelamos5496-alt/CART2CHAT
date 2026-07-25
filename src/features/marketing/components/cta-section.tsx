import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { siteConfig } from "@/config/site";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="from-primary relative overflow-hidden rounded-3xl bg-gradient-to-br to-orange-500 px-6 py-16 text-center sm:px-12">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.25),transparent)]"
          />
          <div className="relative grid gap-6">
            <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
              Ready to turn your WhatsApp into a storefront?
            </h2>
            <p className="mx-auto max-w-md text-sm text-white/90 sm:text-base">
              Set up {siteConfig.name} in minutes. Free to start, no credit card
              required.
            </p>
            <div className="mx-auto flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                render={<Link href="/signup" />}
              >
                Get started free
                <ArrowRight />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                render={<Link href="/login" />}
              >
                Log in
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
