export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-6 w-36 bg-muted rounded-lg mb-1.5" />
      <div className="h-4 w-52 bg-muted rounded-lg mb-7" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[88px] bg-muted rounded-xl" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
