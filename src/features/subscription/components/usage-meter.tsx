export function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const isUnlimited = limit === null;
  const percent = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
  const isNearLimit = !isUnlimited && used >= limit;

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {used}
          {isUnlimited ? "" : ` / ${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div
            className={`h-full rounded-full ${isNearLimit ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}
