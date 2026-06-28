export const LoadingState = () => {
  return (
    <div className="space-y-6 w-full animate-pulse select-none">
      
      {/* Skeleton Analytics cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3.5 w-full">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="bg-card border border-border/60 p-3.5 rounded-xl h-16 flex flex-col justify-between">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-4.5 w-10 bg-muted/70 rounded pt-1" />
          </div>
        ))}
      </div>

      {/* Main Workspace skeleton content */}
      <div className="flex gap-6 h-full items-start">
        {/* Sidebar skeleton list */}
        <div className="w-56 shrink-0 border border-border/80 rounded-xl p-4 space-y-4 bg-card/45 h-[400px]">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-28 bg-muted/70 rounded" />
                <div className="h-3.5 w-5 bg-muted/50 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Main table skeleton content */}
        <div className="flex-1 space-y-4">
          {/* Filters skeleton */}
          <div className="bg-card border border-border/80 p-3.5 rounded-xl flex items-center gap-3">
            <div className="h-9 bg-muted/60 rounded flex-1 min-w-[200px]" />
            <div className="h-9 w-28 bg-muted/50 rounded" />
            <div className="h-9 w-24 bg-muted/50 rounded" />
            <div className="h-9 w-24 bg-muted/50 rounded" />
          </div>

          {/* Table skeleton */}
          <div className="bg-card border border-border/70 rounded-xl overflow-hidden">
            <div className="bg-muted/20 p-3 border-b border-border/60 flex items-center justify-between">
              <div className="h-4 w-4 bg-muted/60 rounded" />
              <div className="h-3.5 w-32 bg-muted/60 rounded" />
              <div className="h-3.5 w-20 bg-muted/60 rounded" />
              <div className="h-3.5 w-16 bg-muted/60 rounded" />
              <div className="h-3.5 w-12 bg-muted/60 rounded text-right" />
            </div>

            <div className="divide-y divide-border/60 p-1">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4">
                  <div className="h-4 w-4 bg-muted/40 rounded shrink-0" />
                  <div className="h-4 w-48 bg-muted/50 rounded" />
                  <div className="h-3.5 w-16 bg-muted/40 rounded" />
                  <div className="h-3.5 w-12 bg-muted/40 rounded" />
                  <div className="h-4.5 w-16 bg-muted/30 rounded-full" />
                  <div className="h-3.5 w-8 bg-muted/40 rounded" />
                  <div className="h-3.5 w-16 bg-muted/40 rounded text-right" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
