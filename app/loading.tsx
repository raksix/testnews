export default function Loading() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-borderc/60 min-h-[280px] md:min-h-[520px]" />
        </div>
        <div className="hidden lg:flex flex-col gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-[130px] h-[90px] rounded-lg bg-borderc/60 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 bg-borderc/60 rounded" />
                <div className="h-4 w-full bg-borderc/60 rounded" />
                <div className="h-4 w-2/3 bg-borderc/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section skeletons */}
      {[0, 1].map((s) => (
        <div key={s} className="mt-14">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-[4px] h-[22px] rounded bg-borderc/60" />
              <div className="h-5 w-32 bg-borderc/60 rounded" />
            </div>
            <div className="h-4 w-20 bg-borderc/60 rounded" />
          </div>
          <div className="flex gap-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-[1_1_0] min-w-[220px] max-w-[320px] space-y-2.5">
                <div className="h-[180px] rounded-[8px] bg-borderc/60" />
                <div className="h-4 w-full bg-borderc/60 rounded" />
                <div className="h-4 w-3/4 bg-borderc/60 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
