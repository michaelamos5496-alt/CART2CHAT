import { Skeleton } from "@/components/ui/skeleton";

export default function NewCategoryLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-64 rounded-xl lg:max-w-xl" />
    </div>
  );
}
