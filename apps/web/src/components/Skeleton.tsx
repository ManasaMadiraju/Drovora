export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-3 w-14 rounded" />
      </div>
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
