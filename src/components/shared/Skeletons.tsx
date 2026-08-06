import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function CardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-28 bg-muted rounded" />
        <div className="h-4 w-4 bg-muted rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-36 bg-muted rounded mb-2" />
        <div className="h-3 w-24 bg-muted rounded" />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-10 bg-muted/60 rounded-md w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-8 bg-muted/40 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-5 w-40 bg-muted rounded mb-2" />
        <div className="h-3 w-60 bg-muted rounded" />
      </CardHeader>
      <CardContent className="h-72 bg-muted/30 rounded flex items-end justify-between p-6 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="w-full bg-muted/60 rounded-t"
            style={{ height: `${20 + (i * 12) % 65}%` }}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-muted rounded" />
          <div className="h-4 w-80 bg-muted rounded" />
        </div>
        <div className="h-9 w-24 bg-muted rounded" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <TableSkeleton rows={4} cols={5} />
    </div>
  );
}
