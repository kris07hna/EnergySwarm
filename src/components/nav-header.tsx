"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/agents", label: "Swarm Command" },
  { href: "/analytics-board", label: "Analytics Board" },
  { href: "/optimize", label: "PSO Studio" },
  { href: "/maps", label: "Map Intelligence" },
] as const;

export default function NavHeader() {
  const pathname = usePathname();

  return (
    <nav className="w-full max-w-5xl overflow-x-auto rounded-full border border-white/15 bg-white/8 px-2 py-2 shadow-[0_14px_50px_rgba(2,6,23,0.28)] backdrop-blur-xl">
      <div className="grid min-w-[560px] grid-cols-5 items-center gap-2 text-center sm:min-w-0">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-cyan-400 text-slate-950"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
