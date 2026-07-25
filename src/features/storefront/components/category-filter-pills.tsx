import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Category } from "@/types/catalog";

export function CategoryFilterPills({
  categories,
  basePath,
  activeCategorySlug,
  searchQuery,
  themeColor,
}: {
  categories: Category[];
  basePath: string;
  activeCategorySlug?: string;
  searchQuery?: string;
  themeColor: string;
}) {
  if (categories.length === 0) return null;

  function hrefFor(categorySlug?: string) {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (categorySlug) params.set("category", categorySlug);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  function pillClassName(isActive: boolean) {
    return cn(
      "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
      isActive
        ? "border-transparent text-white"
        : "border-border hover:bg-muted",
    );
  }

  return (
    <div className="flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Link
        href={hrefFor()}
        className={pillClassName(!activeCategorySlug)}
        style={
          !activeCategorySlug ? { backgroundColor: themeColor } : undefined
        }
      >
        All
      </Link>
      {categories.map((category) => {
        const isActive = activeCategorySlug === category.slug;
        return (
          <Link
            key={category.id}
            href={hrefFor(category.slug)}
            className={pillClassName(isActive)}
            style={isActive ? { backgroundColor: themeColor } : undefined}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
