"use client";

import Link from "next/link";
import { Menu, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { NAV_LINKS } from "@/features/marketing/lib/content";

export function MarketingHeader() {
  return (
    <header className="border-border/40 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg">
            <Store className="size-4" />
          </span>
          {siteConfig.name}
        </Link>

        <nav className="ml-6 hidden items-center gap-6 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ModeToggle />
          <Button variant="ghost" render={<Link href="/login" />}>
            Log in
          </Button>
          <Button render={<Link href="/signup" />}>Get started</Button>
        </div>

        <div className="ml-auto flex items-center gap-1 md:hidden">
          <ModeToggle />
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              }
            />
            <SheetContent side="right">
              <SheetHeader className="border-b">
                <SheetTitle>{siteConfig.name}</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={
                      <a
                        href={link.href}
                        className="hover:bg-muted rounded-md px-2 py-2 text-sm"
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto grid gap-2 border-t p-4">
                <Button variant="outline" render={<Link href="/login" />}>
                  Log in
                </Button>
                <Button render={<Link href="/signup" />}>Get started</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
