"use client"

import { motion, useScroll, useTransform } from "framer-motion"

const faces = [
  {
    id: "front",
    cubeImg: "/1.jpg",
    bgImg: "/nature1.jpg",
    title: "Assess",
    subtitle: "Map site potential, demand signals, and renewable fit before any deployment decision.",
    points: ["Check solar, wind, storage, and grid context in one pass.", "Surface the strongest locations before capital is spent."],
  },
  {
    id: "back",
    cubeImg: "/2.avif",
    bgImg: "/nature2.jpg",
    title: "Optimize",
    subtitle: "Use multi-objective PSO to balance cost, output, sustainability, and resilience together.",
    points: ["Search many trade-offs at once instead of optimizing one metric.", "Return a clearer Pareto set for planning decisions."],
  },
  {
    id: "right",
    cubeImg: "/3.jpg",
    bgImg: "/nature3.jpg",
    title: "Forecast",
    subtitle: "Pull live weather, solar, and market data so recommendations stay current.",
    points: ["Ingest live signals from open APIs and current conditions.", "Keep every recommendation tied to up-to-date data."],
  },
  {
    id: "left",
    cubeImg: "/4.jpg",
    bgImg: "/nature4.jpg",
    title: "Stabilize",
    subtitle: "Shift load, storage, and routing decisions to keep the grid reliable under stress.",
    points: ["Use storage and dispatch logic to smooth volatility.", "Preserve uptime when demand or supply changes fast."],
  },
  {
    id: "top",
    cubeImg: "/5.webp",
    bgImg: "/nature5.jpg",
    title: "Recover",
    subtitle: "Adapt topology and backup logic to recover faster from outages and extreme events.",
    points: ["Prioritize fallback paths and failover behavior.", "Reduce downtime after storms, faults, or disruptions."],
  },
  {
    id: "bottom",
    cubeImg: "/6.jpg",
    bgImg: "/nature6.jpg",
    title: "Decide",
    subtitle: "Turn optimization results into clear next actions for planners and operators.",
    points: ["Convert raw scores into readable guidance.", "Help teams choose the next best action quickly."],
  },
]

export default function PerfectScroll(): JSX.Element {
  const { scrollYProgress } = useScroll()

  const rotateY = useTransform(scrollYProgress, [0, 1], [0, 720])
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 360])

  const cubeX = useTransform(scrollYProgress, [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1], [300, -300, -300, 300, 300, -300, -300])
  const cubeTransform = useTransform(cubeX, (v) => `translateX(${v}px)`)

  return (
    <section className="perfect-scroll">
      <div className="sticky">
        <div className="flex h-full items-center justify-center">
          <motion.div className="scene" style={{ width: "min(40vmin, 400px)", height: "min(40vmin, 400px)", transform: cubeTransform }}>
            <motion.div className="cube" style={{ rotateY, rotateX }}>
              {faces.map((f) => (
                <div
                  key={f.id}
                  className={`cube-face ${f.id}`}
                  style={{
                    backgroundImage: `url(${f.cubeImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="scroll-content">
        {faces.map((f, i) => {
          const textOnLeft = i % 2 === 0
          return (
            <div key={i} className={`relative flex min-h-[100vh] items-center overflow-hidden ${textOnLeft ? "justify-start pl-8 md:pl-16" : "justify-end pr-8 md:pr-16"}`} style={{ backgroundImage: `url(${f.bgImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative max-w-lg rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl md:p-10">
                <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">{f.title}</h2>
                <p className="mt-3 text-base leading-7 text-white/75 md:text-lg">{f.subtitle}</p>
                <div className="mt-6 space-y-3">
                  {f.points.map((point) => (
                    <div key={point} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white/80">
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
