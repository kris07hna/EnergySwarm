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
  { 
    src: "/page4.jpg", 
    title: "Real-time Grid Intelligence", 
    subtitle: "Monitor and optimize energy flow across distributed networks with AI-powered insights and autonomous control systems." 
  },
  { 
    src: "/page2.webp", 
    title: "Sustainable Energy Optimization", 
    subtitle: "Maximize renewable adoption, minimize costs, and ensure resilience with multi-objective PSO algorithms at scale." 
  },
];

export default function HomePage() {
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

  const section1Scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);
  const section1Y = useTransform(scrollYProgress, [0, 0.1], [0, -80]);

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
            Research-Grade Optimization Platform
          </div>
          <div className="mb-2 text-lg font-medium tracking-widest text-white/60 uppercase">Intelligence for</div>
          <div className="mb-6 scale-75 md:scale-100">
            <RevealText
              text="Tomorrow's Grid"
              textColor="text-white"
              overlayColor="text-cyan-400"
              fontSize="text-4xl md:text-7xl"
              letterDelay={0.06}
            />
          </div>
          <p className="mx-auto max-w-2xl text-lg text-white/75 md:text-xl leading-relaxed">
            Harness multi-objective particle swarm optimization to balance cost, sustainability, energy output, disaster resilience, and maintenance across decentralized energy networks. Powered by live data, AI reasoning, and glossy motion design.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button onClick={() => router.push("/agents")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="rounded-xl border border-cyan-400/50 bg-gradient-to-r from-cyan-400/20 to-cyan-400/10 px-8 py-3 font-semibold text-white backdrop-blur-sm hover:from-cyan-400/30 hover:to-cyan-400/20 transition">Initialize Agents</motion.button>
            <Link href="/optimize" className="rounded-xl border border-white/20 bg-white/5 px-8 py-3 font-semibold text-white/90 backdrop-blur-sm hover:bg-white/10 inline-flex items-center gap-2 transition">Launch PSO <ArrowRight className="h-4 w-4" /></Link>
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
          <div className="max-w-3xl rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 backdrop-blur-2xl md:p-12 shadow-2xl hover:border-white/25 transition-all duration-500">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
                {s.title}
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full" />
              <p className="text-lg md:text-xl text-white/80 leading-relaxed font-light">
                {s.subtitle}
              </p>
              <div className="pt-4">
                <Link href="/optimize" className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300">
                  Explore Platform <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Landing Use Case Section - Enriched from Landing Page */}
      <section className="relative z-10 min-h-screen snap-start overflow-hidden flex items-center">
        <img
          src="/nature3.jpg"
          alt="Energy landscape background"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />

        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.75),rgba(14,165,233,0.1),rgba(2,6,23,0.85))]" />

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
                title="AI-Powered Recommendations"
                description="Gemini AI analyzes optimization results to suggest real-time grid adjustments, storage deployment strategies, and renewable integration pathways based on your constraints."
              />
              <SectionCard
                icon={Zap}
                title="Real-Time Data Integration"
                description="Pulls live weather, solar forecasts, carbon intensity, market prices, and grid status from open APIs. Your models always train on current conditions."
              />
              <SectionCard
                icon={ShieldCheck}
                title="Multi-Objective Resilience"
                description="Balances 5 competing objectives: cost minimization, sustainability, energy output, disaster resilience, and maintenance feasibility—all simultaneously."
              />
            </div>
          </div>
        </div>
      </section>

      {/* PSO Core Section - Enriched from Landing Page */}
      <section className="relative z-10 min-h-screen snap-start overflow-hidden flex items-center">
        <img
          src="/nature5.jpg"
          alt="Energy optimization landscape"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.48),rgba(15,23,42,0.58),rgba(2,6,23,0.68))]" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-4 py-28 sm:px-6 lg:px-8">
          <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 backdrop-blur-2xl hover:border-white/25 transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-400/80">Advanced Engine</p>
                  <h2 className="mt-3 text-4xl md:text-5xl font-black text-white">PSO Core</h2>
                </div>
                
                <p className="text-lg leading-relaxed text-white/80">
                  The MOPSO (Multi-Objective PSO) engine balances competing objectives using archive-guided leadership, adaptive inertia, and stagnation detection to find true Pareto-optimal solutions.
                </p>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm hover:bg-white/12 transition">
                    <p className="text-sm font-semibold text-cyan-300 mb-1">Pareto Archive</p>
                    <p className="text-xs text-white/70">Leaders guide exploration toward frontier solutions, preventing premature convergence.</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm hover:bg-white/12 transition">
                    <p className="text-sm font-semibold text-violet-300 mb-1">Adaptive Inertia</p>
                    <p className="text-xs text-white/70">Weight decay over iterations shifts from broad exploration to fine-tuning convergence.</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm hover:bg-white/12 transition">
                    <p className="text-sm font-semibold text-emerald-300 mb-1">Stagnation Escape</p>
                    <p className="text-xs text-white/70">Controlled mutation nudges stuck particles away from local optima.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/optimize" className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-white/20 hover:shadow-white/40 transition">
                    Run Optimization
                  </Link>
                  <Link href="/maps" className="rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition">
                    View Results
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SectionCard
                icon={BarChart3}
                title="Pareto Trade-Space"
                description="Inspect representative solutions and archive diversity. Understand cost-sustainability-resilience tradeoffs with interactive visualizations."
              />
              <SectionCard
                icon={ShieldCheck}
                title="Resilience-First"
                description="Risk signals and maintenance scores embedded in the objective vector. Not post-processed—baked into the algorithm."
              />
              <SectionCard
                icon={Zap}
                title="Forecast Integration"
                description="Open-Meteo weather, NASA POWER solar, and carbon intensity APIs continuously feed environmental context into every optimization run."
              />
              <SectionCard
                icon={Sparkles}
                title="Gemini Reasoning"
                description="AI-powered insights transform raw PSO results into actionable recommendations with business context and risk assessment."
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
      <section className="relative z-10 flex h-screen w-full snap-start items-center justify-center px-6 overflow-hidden">
        <img
          src="/mystical-forest-2880x1800-14976.jpg"
          alt="Mystical forest background"
          className="absolute inset-0 h-full w-full object-cover opacity-65"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.45),rgba(15,23,42,0.6))]" />
        
        <div className="relative z-10 w-full max-w-5xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl md:text-6xl font-black text-white">Platform Performance</h2>
            <p className="text-lg text-white/70">Real-time metrics powering sustainable energy futures</p>
          </div>
          
          <div className="grid w-full gap-6 md:grid-cols-3">
            {[
              { label: "OPTIMIZATION CYCLES", value: "12.4K", pct: "92%", color: "from-cyan-400 to-blue-500", textColor: "text-cyan-400", desc: "PSO iterations completed" },
              { label: "ENERGY SAVINGS", value: "2.8M kWh", pct: "88%", color: "from-emerald-400 to-teal-500", textColor: "text-emerald-400", desc: "CO₂ avoided annually" },
              { label: "GRID UPTIME", value: "99.97%", pct: "100%", color: "from-violet-400 to-purple-500", textColor: "text-violet-400", desc: "System reliability" },
            ].map((item, i) => (
              <div key={i} className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/8 via-white/4 to-transparent p-8 backdrop-blur-2xl hover:border-white/25 transition-all duration-300">
                <div className={`mb-2 text-xs font-bold uppercase tracking-widest ${item.textColor}`}>{item.label}</div>
                <div className="text-4xl font-black text-white my-3">{item.value}</div>
                <p className="text-sm text-white/60 mb-4">{item.desc}</p>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000`} style={{ width: item.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 flex min-h-screen snap-start items-center justify-center px-6 py-24">
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative w-full max-w-5xl rounded-[2rem] border border-white/15 bg-white/5 p-5 shadow-[0_30px_120px_rgba(2,6,23,0.5)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div className="mx-auto max-w-2xl space-y-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-cyan-200/80">
              Try now
            </p>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Experience SwarmGrid AI
            </h2>
            <p className="mx-auto max-w-xl text-base leading-7 text-white/70 sm:text-lg">
              Open the optimizer, test live data, and explore how the grid shifts across cost, resilience, and sustainability goals.
            </p>
          </div>

          <div className="mx-auto mt-8 w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-white/15 bg-black/25 shadow-2xl">
            <video autoPlay muted loop playsInline preload="auto" className="h-[220px] w-full object-cover sm:h-[280px] lg:h-[340px]">
              <source src="/video2.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="mt-8 flex justify-center">
            <AuroraButton onClick={() => router.push("/optimize")} className="px-8 py-3 text-sm sm:text-base">
              Try Now
            </AuroraButton>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4 text-center text-[11px] uppercase tracking-[0.35em] text-white/45">
          SwarmGrid AI · Multi-Objective Energy Optimization
        </div>
      </footer>

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
