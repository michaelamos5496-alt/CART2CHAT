import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/features/marketing/components/section-heading";
import { TESTIMONIALS } from "@/features/marketing/lib/content";

export function TestimonialsSection() {
  return (
    <section className="bg-muted/30 border-y py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Loved by small businesses"
          title="Built for people who sell, not people who code"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={(index % 3) * 0.06}>
              <figure className="bg-card grid h-full gap-4 rounded-xl border p-6">
                <blockquote className="text-sm leading-relaxed text-balance">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {testimonial.role}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
