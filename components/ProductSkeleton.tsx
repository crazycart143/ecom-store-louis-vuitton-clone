"use client";

export function ProductSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="aspect-3/4 w-full bg-zinc-100 rounded-sm" />
      <div className="space-y-2">
        <div className="h-4 bg-zinc-100 w-2/3 rounded-sm" />
        <div className="h-3 bg-zinc-100 w-1/3 rounded-sm" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
