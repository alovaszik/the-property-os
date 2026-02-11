export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="px-4 py-6 lg:px-6 lg:py-6 max-w-7xl mx-auto animate-pulse">
      <div className="h-5 w-36 bg-muted rounded-md mb-1.5" />
      <div className="h-3.5 w-52 bg-muted rounded-md mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`s-${i}`} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={`r-${i}`} className="h-12 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}
