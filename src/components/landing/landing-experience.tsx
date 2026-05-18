"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, ChevronRight, Zap, ShieldCheck, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useScreenSize } from "@/hooks/use-screen-size";
import { PixelTrail } from "@/components/ui/pixel-trail";
import { GooeyFilter } from "@/components/ui/gooey-filter";
import { FloatingHeader } from "./floating-header";
import { FloatingFooter } from "./floating-footer";
import { NatureSwarmCanvas } from "./nature-swarm-canvas";

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

export function LandingExperience() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [showHeroContent, setShowHeroContent] = useState(false);
  const screenSize = useScreenSize();

  const shouldAnimate = motionEnabled && !prefersReducedMotion;

  useEffect(() => {
    const onScroll = () => {
      if (typeof window !== "undefined" && window.scrollY > 20) {
        setShowHeroContent(true);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // If page loaded already scrolled, reveal immediately
    if (typeof window !== "undefined" && window.scrollY > 20) setShowHeroContent(true);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  

  return (
    <div ref={rootRef} className="relative min-h-screen overflow-x-hidden bg-[#020617] text-white">
      <FloatingHeader motionEnabled={shouldAnimate} onToggleMotion={() => setMotionEnabled((value) => !value)} />

      <main className="snap-y snap-mandatory">
        <section
          id="home"
          className="landing-section relative min-h-screen snap-start overflow-hidden border-b border-white/5"
        >
          <NatureSwarmCanvas
            imageSrc="/mystical-forest-2880x1800-14976.jpg"
            imageAlt="Nature-backed swarm canvas"
          />

          <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-28 sm:px-6 lg:px-8">
            {/* Only show the hero overlay after the user scrolls so the nature canvas stays visible on first paint. */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showHeroContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              {showHeroContent ? (
                <>
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100 backdrop-blur-xl">
                    <Sparkles className="h-4 w-4" />
                    Research-grade swarm intelligence
                  </div>

                  <div className="mb-6 grid max-w-3xl gap-3 sm:grid-cols-3">
                    {[
                      { title: "Operator", note: "Starts the swarm and monitors map motion." },
                      { title: "Analyst", note: "Reads the tables, graphs, and recommendations." },
                      { title: "Planner", note: "Uses the PSO summary to stage the next action." },
                    ].map((role) => (
                      <div key={role.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                        <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">{role.title}</div>
                        <p className="mt-2 text-sm leading-6 text-white/68">{role.note}</p>
                      </div>
                    ))}
                  </div>

                  <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
                    Speaking things into existence with energy AI.
                  </h1>

                  <p className="mt-6 max-w-2xl text-lg leading-8 text-white/74 sm:text-xl">
                    SwarmGrid AI combines multi-objective PSO, live forecasting, and glossy motion design into a fast landing experience built for research, demos, and decision support.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                      href="/optimize"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/15 transition hover:scale-[1.02]"
                    >
                      Run PSO
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="#use-case"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/10"
                    >
                      See the scroll demo
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="mx-auto flex w-full items-center justify-center">
                  {/* Empty spacer to preserve layout when hero content hidden */}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <section
          id="use-case"
          className="landing-section relative min-h-screen snap-start overflow-hidden border-b border-white/5 bg-black"
        >
          <img
            src="/nature2.jpg"
            alt="Nature background"
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

          <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-28 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-cyan-200/80">
                Use case
              </p>
              <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl">
                Speaking things into existence
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
                The second scroll section keeps your original gooey pixel-trail concept, now wrapped in a polished, adaptive glass layout for demos and product storytelling.
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

        <section
          id="pso"
          className="landing-section relative min-h-screen snap-start overflow-hidden bg-[#020617]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_32%),linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,1))]" />

          <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-28 sm:px-6 lg:px-8">
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
                  <Link href="/optimize" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
                    Open optimization
                  </Link>
                  <Link href="/maps" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
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
      </main>

      <FloatingFooter onBackToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
    </div>
  );
}
