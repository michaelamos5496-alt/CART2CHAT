import Link from "next/link";

import { LogoMark } from "@/components/layout/logo-mark";
import { siteConfig } from "@/config/site";
import { NAV_LINKS } from "@/features/marketing/lib/content";

export function MarketingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="grid gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg">
              <LogoMark className="size-4" />
            </span>
            {siteConfig.name}
          </Link>
          <p className="text-muted-foreground max-w-xs text-sm">
            {siteConfig.description}
          </p>
        </div>

        <div className="grid gap-2 text-sm">
          <p className="text-foreground font-medium">Product</p>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="grid gap-2 text-sm">
          <p className="text-foreground font-medium">Account</p>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>

      <div className="border-t px-4 py-6 sm:px-6">
        <p className="text-muted-foreground mx-auto max-w-6xl text-xs">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
