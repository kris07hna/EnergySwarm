"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";

type FloatingHeaderProps = {
  motionEnabled: boolean;
  onToggleMotion: () => void;
};

export function FloatingHeader({ motionEnabled, onToggleMotion }: FloatingHeaderProps) {
  const links = [
    { href: "#home", label: "Vision", note: "Nature canvas" },
    { href: "#use-case", label: "Analyst", note: "Role matrix" },
    { href: "#pso", label: "Operator", note: "Swarm control" },
    { href: "/agents", label: "Command", note: "Initialize" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed left-1/2 top-4 z-50 w-[min(1120px,calc(100vw-1.5rem))] -translate-x-1/2"
    >
      <div className="rounded-full border border-white/10 bg-white/10 px-4 py-3 shadow-[0_18px_80px_rgba(2,6,23,0.55)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/10">
        <div className="flex items-center justify-between gap-4">
          <Link href="#home" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-[0.22em] text-white/80 uppercase">
                SwarmGrid AI
              </div>
              <div className="text-xs text-white/50">Scroll-first energy intelligence</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                <span className="block text-[10px] uppercase tracking-[0.28em] text-white/35">{link.note}</span>
                <span className="block text-sm font-medium text-white/80">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleMotion}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            >
              {motionEnabled ? "Motion on" : "Motion off"}
            </button>
            <Link
              href="/optimize"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            >
              Run PSO
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
