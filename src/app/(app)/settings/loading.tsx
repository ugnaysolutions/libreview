import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32 rounded-xl" />
        <Skeleton className="h-4 w-56 rounded-xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-24 rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}
