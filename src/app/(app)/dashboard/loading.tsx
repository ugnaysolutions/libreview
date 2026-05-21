import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Hero CTA skeleton */}
      <Skeleton className="h-40 w-full rounded-2xl" />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick practice */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-36" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
