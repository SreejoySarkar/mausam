/** Cold-start skeleton — shown only when no cached SDUI payload exists. */
export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading weather">
      <div className="skeleton h-[284px] rounded-[32px]" />
      <div className="skeleton h-[148px] rounded-[28px]" />
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton h-[86px] rounded-[24px]" />
        <div className="skeleton h-[86px] rounded-[24px]" />
      </div>
      <div className="skeleton h-[220px] rounded-[28px]" />
      <div className="skeleton h-[180px] rounded-[28px]" />
    </div>
  );
}
