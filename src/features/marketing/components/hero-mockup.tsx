import { CheckCircle2, MessageCircle, ShoppingBag } from "lucide-react";

const PRODUCTS = [
  {
    label: "Sourdough loaf",
    price: "$8",
    color: "bg-amber-200 dark:bg-amber-900",
  },
  {
    label: "Cinnamon rolls",
    price: "$6",
    color: "bg-orange-200 dark:bg-orange-900",
  },
  {
    label: "Banana bread",
    price: "$7",
    color: "bg-yellow-200 dark:bg-yellow-900",
  },
  {
    label: "Sea salt cookies",
    price: "$5",
    color: "bg-rose-200 dark:bg-rose-900",
  },
];

// Entrance animation lives in the parent HeroSection's single GSAP
// timeline (targets .hero-mockup-card-1/-2), so this stays a plain
// presentational component rather than owning its own animation.
export function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="hero-mockup-card-1 bg-card relative z-0 -rotate-3 rounded-2xl border p-4 shadow-xl">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-primary flex size-6 items-center justify-center rounded-md">
            <ShoppingBag className="text-primary-foreground size-3.5" />
          </span>
          <span className="text-sm font-semibold">Ada&apos;s Bakery</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRODUCTS.map((product) => (
            <div key={product.label} className="rounded-lg border p-2">
              <div className={`mb-2 h-14 rounded-md ${product.color}`} />
              <p className="truncate text-xs font-medium">{product.label}</p>
              <p className="text-muted-foreground text-xs">{product.price}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-mockup-card-2 absolute -right-4 -bottom-10 z-10 w-64 rotate-4 rounded-2xl border bg-[#e7fce3] p-3 shadow-xl sm:-right-8 dark:border-emerald-900 dark:bg-emerald-950">
        <div className="mb-2 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
          <MessageCircle className="size-4" />
          <span className="text-xs font-semibold">WhatsApp</span>
        </div>
        <div className="rounded-lg bg-white p-2.5 text-[11px] leading-relaxed text-neutral-800 shadow-sm dark:bg-neutral-900 dark:text-neutral-200">
          <p className="font-medium">Hello Ada&apos;s Bakery.</p>
          <p>I&apos;d like to place an order.</p>
          <p className="mt-1">Products</p>
          <p>• Sourdough loaf x2</p>
          <p>• Cinnamon rolls x1</p>
          <p className="mt-1 flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-3" />
            Total: $22.00
          </p>
        </div>
      </div>

      <div
        aria-hidden
        className="from-primary/30 absolute -inset-8 -z-10 rounded-full bg-gradient-to-br to-transparent blur-3xl"
      />
    </div>
  );
}
