"use client";

import { ArrowUp } from "lucide-react";

type FloatingFooterProps = {
  onBackToTop: () => void;
};

export function FloatingFooter({ onBackToTop }: FloatingFooterProps) {
  return (
    <button
      type="button"
      onClick={onBackToTop}
      aria-label="Back to top"
      className="fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-950/80 text-white shadow-[0_18px_60px_rgba(2,6,23,0.5)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
