import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="bg-muted flex size-10 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground size-5" />
      </div>
      <div className="grid gap-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground max-w-xs text-sm text-balance">
          {description}
        </p>
      </div>
    </div>
  );
}
