"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import NavHeader from "@/components/nav-header";
import PerfectScroll from "@/components/PerfectScroll";
import { RevealText } from "@/components/reveal-text";
import { AuroraButton } from "@/components/ui/aurora-button";
import { ArrowRight, Sparkles, Zap, ShieldCheck, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useScreenSize } from "@/hooks/use-screen-size";
import { PixelTrail } from "@/components/ui/pixel-trail";
import { GooeyFilter } from "@/components/ui/gooey-filter";

function SectionCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,6,23,0.35)]">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200 ring-1 ring-white/10">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/72">{description}</p>
    </div>
  );
}

const bgSections = [
  { src: "/page4.jpg", title: "Grid Command Center", subtitle: "Real-time telemetry and autonomous grid orchestration across 12,000+ nodes." },
  { src: "/page2.webp", title: "Autonomous Energy Mesh", subtitle: "Biophilic data structures adapting to urban network topology in real time." },
];

export function LandingDemo() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const video1Opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  const bg1Opacity = useTransform(scrollYProgress, [0.1, 0.18, 0.28, 0.33], [0, 1, 1, 0]);
  const bg1Scale = useTransform(scrollYProgress, [0.1, 0.18], [1.1, 1]);

  const bg2Opacity = useTransform(scrollYProgress, [0.28, 0.36, 0.44], [0, 1, 0]);
  const bg2Scale = useTransform(scrollYProgress, [0.28, 0.36], [1.1, 1]);

  const video2Opacity = useTransform(scrollYProgress, [0.44, 0.52, 1], [0, 1, 1]);

  const section1Scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);
  const section1Y = useTransform(scrollYProgress, [0, 0.1], [0, -80]);

  const overlayOpacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);

  const screenSize = useScreenSize();

  return (
    <div ref={containerRef} className="relative">
      {/* Video 1 background */}
      <motion.video autoPlay muted loop playsInline preload="auto" className="fixed inset-0 h-full w-full object-cover" style={{ opacity: video1Opacity }}>
        <source src="/video1.mp4" type="video/mp4" />
      </motion.video>

      {/* Image backgrounds */}
      <motion.div className="fixed inset-0 h-full w-full bg-cover bg-center" style={{ backgroundImage: "url(/page4.jpg)", opacity: bg1Opacity, scale: bg1Scale }} />
      <motion.div className="fixed inset-0 h-full w-full bg-cover bg-center" style={{ backgroundImage: "url(/page2.webp)", opacity: bg2Opacity, scale: bg2Scale }} />

      {/* Video 2 background — plays from cube section onward */}
      <motion.video autoPlay muted loop playsInline preload="auto" className="fixed inset-0 h-full w-full object-cover" style={{ opacity: video2Opacity }}>
        <source src="/video2.mp4" type="video/mp4" />
      </motion.video>

      <div className="fixed inset-0 bg-black/40" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
        <NavHeader />
      </header>

      {/* Section 1: Hero with video1 */}
      <section className="relative z-10 flex h-screen w-full snap-start flex-col items-center justify-center px-6">
        <motion.div style={{ scale: section1Scale, y: section1Y }} className="max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs uppercase tracking-widest text-cyan-400 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            BIO-SYNAPSE MESH NETWORK
          </div>
          <div className="mb-2 text-lg font-medium tracking-widest text-white/60 uppercase">Intelligence for a</div>
          <div className="mb-6 scale-75 md:scale-100">
            <RevealText
              text="LIVING GRID"
              textColor="text-white"
              overlayColor="text-cyan-400"
              fontSize="text-4xl md:text-7xl"
              letterDelay={0.06}
            />
          </div>
          <p className="mx-auto max-w-2xl text-lg text-white/70 md:text-xl">
            Multi-objective swarm optimization for tomorrow&apos;s sustainable energy networks. Speaking things into existence with energy AI.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <motion.button onClick={() => router.push("/agents")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="rounded-xl border border-cyan-400/50 bg-cyan-400/10 px-8 py-3 font-semibold text-white backdrop-blur-sm hover:bg-cyan-400/20">Initialize Core</motion.button>
            <Link href="/optimize" className="rounded-xl border border-white/20 bg-white/5 px-8 py-3 font-semibold text-white/80 backdrop-blur-sm hover:bg-white/10 inline-flex items-center gap-2">Run PSO <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </motion.div>
        <div className="absolute bottom-8 flex gap-12 text-center">
          <div><div className="text-2xl font-bold text-white">8.4 GW</div><div className="text-xs text-white/50">Current Output</div></div>
          <div><div className="text-2xl font-bold text-cyan-400">99.9%</div><div className="text-xs text-white/50">Uptime SLA</div></div>
          <div><div className="text-2xl font-bold text-violet-400">-82%</div><div className="text-xs text-white/50">Cost Saving</div></div>
        </div>
      </section>

      {/* Image background sections */}
      {bgSections.map((s, i) => (
        <section key={i} className="relative z-10 flex h-screen w-full snap-start items-center px-6 md:px-16">
          <div className="max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl md:p-12">
            {i === 1 ? (
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <h2 className="text-4xl font-bold text-white md:text-6xl">{s.title}</h2>
                  <p className="mt-4 text-lg text-white/70 md:text-xl">{s.subtitle}</p>
                </div>
                <img src="/swarm.webp" alt="" className="mt-2 h-32 w-32 shrink-0 rounded-xl object-cover opacity-50" />
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-bold text-white md:text-6xl">{s.title}</h2>
                <p className="mt-4 text-lg text-white/70 md:text-xl">{s.subtitle}</p>
              </>
            )}
          </div>
        </section>
      ))}

      {/* Landing Use Case Section - Enriched from Landing Page */}
      <section className="relative z-10 min-h-screen snap-start overflow-hidden bg-black flex items-center">
        <img
          src="https://images.aiscribbles.com/34fe5695dbc942628e3cad9744e8ae13.png?v=60d084"
          alt="Impressionist background"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.94))]" />

        <GooeyFilter id="use-case-gooey-filter" strength={5} />
        <div className="absolute inset-0 z-[1]" style={{ filter: "url(#use-case-gooey-filter)" }}>
          <PixelTrail
            pixelSize={screenSize.lessThan("md") ? 24 : 32}
            fadeDuration={0}
            delay={500}
            pixelClassName="bg-white"
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-4 py-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center w-full">
            <p className="text-sm font-semibold uppercase tracking-[0.45em] text-cyan-200/80">
              Use case
            </p>
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl">
              Speaking things into existence
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
              Research-grade swarm intelligence combines multi-objective PSO, live forecasting, and glossy motion design into a fast experience built for research, demos, and decision support.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SectionCard
                icon={Sparkles}
                title="AI-assisted planning"
                description="Gemini-driven suggestions support the best grid and storage actions after optimization runs."
              />
              <SectionCard
                icon={Zap}
                title="Live data inputs"
                description="Forecasts and energy signals flow into the optimization core for research-grade context."
              />
              <SectionCard
                icon={ShieldCheck}
                title="Adaptive motion"
                description="The layout respects reduced motion and lets users toggle animation density from the header."
              />
            </div>
          </div>
        </div>
      </section>

      {/* PSO Core Section - Enriched from Landing Page */}
      <section className="relative z-10 min-h-screen snap-start overflow-hidden bg-[#020617] flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_32%),linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,1))]" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-4 py-28 sm:px-6 lg:px-8">
          <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-cyan-200/80">PSO core</p>
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">More optimization depth, less guesswork.</h2>
              <p className="mt-4 text-white/72 leading-7">
                The MOPSO core now prioritizes better archive diversity, inertia decay, and escape-from-stagnation behavior so the optimizer keeps exploring when the swarm converges too early.
              </p>

              <div className="mt-6 grid gap-3 text-sm text-white/72">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Archive-guided leaders keep solutions on the Pareto frontier.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Stagnating particles get a controlled mutation nudge.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Inertia decays over time for broader search then fine-tuning.</div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/optimize" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] inline-block">
                  Open optimization
                </Link>
                <Link href="/maps" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 inline-block">
                  Review maps
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SectionCard
                icon={BarChart3}
                title="Pareto archive"
                description="The backend now exposes a representative solution and the archive count so you can inspect the trade-space."
              />
              <SectionCard
                icon={ShieldCheck}
                title="Resilience-aware"
                description="Risk and maintenance signals are carried through the objective vector instead of being hidden in a single score."
              />
              <SectionCard
                icon={Zap}
                title="Forecast-linked"
                description="Open-Meteo and NASA POWER feeds back the model with actual environmental inputs."
              />
              <SectionCard
                icon={Sparkles}
                title="Gemini-ready"
                description="The suggestions flow can be hooked into a server-side key via env when you are ready to enable it."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cube section */}
      <section className="relative z-10 min-h-[300vh]">
        <PerfectScroll />
      </section>

      {/* Final section */}
      <section className="relative z-10 flex h-screen w-full snap-start items-center justify-center px-6">
        <div className="grid w-full max-w-5xl gap-6 md:grid-cols-3">
          {[
            { label: "ACTIVE NODES", value: "420", pct: "78%", color: "from-cyan-400 to-violet-400", textColor: "text-cyan-400" },
            { label: "DATA DIGESTED", value: "8.4 PB", pct: "94%", color: "from-violet-400 to-cyan-400", textColor: "text-violet-400" },
            { label: "NET LATENCY", value: "12 ms", pct: "100%", color: "from-emerald-400 to-cyan-400", textColor: "text-emerald-400" },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className={`mb-2 text-sm ${item.textColor}`}>{item.label}</div>
              <div className="text-3xl font-bold text-white">{item.value}</div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: item.pct }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Footer */}
      <motion.footer
        style={{ opacity: overlayOpacity }}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/60 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-base font-bold text-white">
                <span className="text-cyan-400">⚡</span> SwarmGrid AI
              </div>
              <p className="mt-0.5 text-xs text-white/40">Multi-objective swarm optimization for energy grids</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-6 text-xs">
                <a className="text-white/50 hover:text-white" href="#">Privacy</a>
                <a className="text-white/50 hover:text-white" href="#">Terms</a>
                <a className="text-white/50 hover:text-white" href="#">Status</a>
                <a className="text-white/50 hover:text-white" href="#">Contact</a>
              </div>
              <AuroraButton onClick={() => router.push("/agents")} className="px-4 py-1.5 text-xs">Launch App</AuroraButton>
            </div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4 text-center text-xs text-white/30">
            © 2124 BIO-SYNAPSE MESH NETWORK &bull; ALL NODES ACTIVE
          </div>
        </div>
      </motion.footer>

      {/* Floating scroll button */}
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-xl transition-colors hover:bg-white/20"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
      </a>
    </div>
  );
}
