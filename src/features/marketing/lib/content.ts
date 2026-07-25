import {
  BadgePercent,
  BarChart3,
  Clock,
  Layers,
  MessageCircle,
  Package,
  Palette,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Store,
  type LucideIcon,
} from "lucide-react";

export const NAV_LINKS = [
  { label: "Benefits", href: "#benefits" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

export interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const BENEFITS: Benefit[] = [
  {
    icon: BadgePercent,
    title: "Keep every sale",
    description:
      "No commissions, no per-order fees. OrderFlow is a flat subscription — what you sell is what you keep.",
  },
  {
    icon: MessageCircle,
    title: "No new app for customers",
    description:
      "Your customers already live on WhatsApp. They browse your storefront, then check out where they already chat with you.",
  },
  {
    icon: Rocket,
    title: "Live in minutes",
    description:
      "No code, no developer, no waiting. Add your products and share your link the same day you sign up.",
  },
  {
    icon: Palette,
    title: "Looks like your brand",
    description:
      "Your logo, your banner, your colors, your own storefront link — not a generic marketplace page.",
  },
];

export interface Step {
  number: string;
  title: string;
  description: string;
}

export const STEPS: Step[] = [
  {
    number: "01",
    title: "Create your store",
    description:
      "Sign up and tell us your business name and WhatsApp number. Your storefront is ready instantly.",
  },
  {
    number: "02",
    title: "Add your products",
    description:
      "Upload photos, set prices, and organize everything into categories customers can actually browse.",
  },
  {
    number: "03",
    title: "Share your link",
    description:
      "Drop it in your Instagram bio, WhatsApp status, or business card. One link, always up to date.",
  },
  {
    number: "04",
    title: "Get orders on WhatsApp",
    description:
      "Customers add to cart and check out. You get a clean, formatted order message — ready to confirm.",
  },
];

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: Store,
    title: "Custom storefront",
    description:
      "A public storefront with your logo, banner, brand color, and a link that's yours — /store/your-business.",
  },
  {
    icon: Package,
    title: "Products & categories",
    description:
      "Multiple photos per product, categories, featured items, and availability — organized the way you sell.",
  },
  {
    icon: ShoppingBag,
    title: "Cart & WhatsApp checkout",
    description:
      "Customers build a cart, enter their details, and get a beautifully formatted order message sent to your WhatsApp.",
  },
  {
    icon: Layers,
    title: "Order management",
    description:
      "Track every order from pending to completed, search and filter, and export your order history to CSV.",
  },
  {
    icon: BarChart3,
    title: "Analytics dashboard",
    description:
      "Revenue, top products, returning customers, and orders over time — know what's actually working.",
  },
  {
    icon: Clock,
    title: "Business hours & delivery",
    description:
      "Set your hours, add a delivery fee, and let customers know exactly what to expect before they order.",
  },
  {
    icon: Smartphone,
    title: "Built for mobile",
    description:
      "Fast, responsive, and comfortable to browse on the phone your customers are already using.",
  },
  {
    icon: ShieldCheck,
    title: "Your data, protected",
    description:
      "Every business's data is isolated and access-controlled at the database level — not just in the app.",
  },
];

export interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  cta: string;
  href: string;
  highlighted?: boolean;
  features: string[];
}

// Mirrors the plan_limits table (see supabase/migrations) — keep these
// numbers in sync with the seed data there.
export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    description: "For testing the waters.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Start for free",
    href: "/signup",
    features: [
      "Up to 20 products",
      "Up to 3 categories",
      "Cart & WhatsApp checkout",
      "Basic analytics",
      "Community support",
    ],
  },
  {
    name: "Growth",
    description: "For businesses ready to scale up.",
    monthlyPrice: 19,
    yearlyPrice: 15,
    cta: "Start free trial",
    href: "/signup",
    highlighted: true,
    features: [
      "Up to 200 products",
      "Unlimited categories",
      "Full analytics dashboard",
      "Custom logo & banner",
      "Priority email support",
    ],
  },
  {
    name: "Pro",
    description: "For established storefronts.",
    monthlyPrice: 49,
    yearlyPrice: 39,
    cta: "Start free trial",
    href: "/signup",
    features: [
      "Unlimited products & categories",
      "Full analytics dashboard",
      "Custom logo & banner",
      "Priority WhatsApp support",
      "Early access to new features",
    ],
  },
];

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Ada",
    role: "Boutique clothing store",
    quote:
      "My customers already lived on WhatsApp. OrderFlow just gave them a proper menu to browse before they message me.",
  },
  {
    name: "Kwame",
    role: "Home bakery",
    quote:
      "Setup took fifteen minutes. Now every order arrives with the customer's name, address, and exactly what they want — no more back-and-forth.",
  },
  {
    name: "Priya",
    role: "Handmade jewelry",
    quote:
      "I stopped losing orders in my DMs. Everything's organized, and I can finally see which pieces are actually selling.",
  },
  {
    name: "Diego",
    role: "Local coffee roaster",
    quote:
      "The analytics alone are worth it. I know which days are busiest and what to restock before I run out.",
  },
  {
    name: "Fatima",
    role: "Skincare brand",
    quote:
      "It looks like a real store, not just a chat. Customers take us more seriously now.",
  },
  {
    name: "Tunde",
    role: "Sneaker reseller",
    quote:
      "No commissions means the math finally makes sense. I keep what I earn.",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Do I need a website already?",
    answer:
      "No. OrderFlow gives you a complete public storefront out of the box — your own link to share anywhere.",
  },
  {
    question: "Does OrderFlow take a commission on my sales?",
    answer:
      "No. OrderFlow is a flat subscription. We never take a percentage of what you sell.",
  },
  {
    question: "Can customers pay online?",
    answer:
      "Not yet. Orders are sent to you on WhatsApp, where you arrange payment however you already do — cash, transfer, or mobile money.",
  },
  {
    question: "Do my customers need to download anything?",
    answer:
      "No. They browse your storefront in any browser, and their order opens directly in WhatsApp — an app they already have.",
  },
  {
    question: "Can I use my own business name and branding?",
    answer:
      "Yes. Your logo, banner, brand color, and a storefront link that's yours — not a generic marketplace listing.",
  },
  {
    question: "Can I change or cancel my plan later?",
    answer: "Yes. Plans are flexible with no long-term contract.",
  },
];
