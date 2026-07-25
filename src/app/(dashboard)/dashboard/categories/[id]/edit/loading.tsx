import { Skeleton } from "@/components/ui/skeleton";

export default function EditCategoryLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 lg:max-w-xl">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  );
}
