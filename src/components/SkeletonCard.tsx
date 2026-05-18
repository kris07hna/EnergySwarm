'use client';

export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-10 w-10 bg-white/10 rounded-full" />
        <div className="h-6 w-12 bg-white/10 rounded" />
      </div>
      <div className="h-8 w-20 bg-white/10 rounded mb-2" />
      <div className="h-4 w-32 bg-white/10 rounded" />
    </div>
  );
}
