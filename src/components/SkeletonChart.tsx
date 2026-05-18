'use client';

export default function SkeletonChart() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl animate-pulse">
      <div className="h-64 bg-white/10 rounded-xl" />
    </div>
  );
}
