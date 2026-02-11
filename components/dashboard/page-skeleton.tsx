export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-7 w-40 bg-muted rounded-lg mb-2" />
      <div className="h-4 w-56 bg-muted rounded-lg mb-8" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-2xl" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
