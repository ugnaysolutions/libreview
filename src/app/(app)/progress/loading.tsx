import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProgressLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-52" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border-border">
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar */}
      <Card className="rounded-2xl border-border">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-36" />
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 30 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-6 rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subtest breakdown */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
