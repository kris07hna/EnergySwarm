"use client"

import { motion, useScroll, useTransform } from "framer-motion"

const faces = [
  { id: "front",  cubeImg: "/1.jpg",     bgImg: "/nature1.jpg", title: "Solar",       subtitle: "Maximize PV placement & algorithmic yield optimization" },
  { id: "back",   cubeImg: "/2.avif",    bgImg: "/nature2.jpg", title: "Wind",        subtitle: "Smart siting, turbine maintenance & micro-siting" },
  { id: "right",  cubeImg: "/3.jpg",     bgImg: "/nature3.jpg", title: "Storage",     subtitle: "Battery arbitrage, cycling strategies & grid buffering" },
  { id: "left",   cubeImg: "/4.jpg",     bgImg: "/nature4.jpg", title: "Grid",        subtitle: "Distributed node balancing & fault rerouting" },
  { id: "top",    cubeImg: "/5.webp",    bgImg: "/nature5.jpg", title: "Resilience",  subtitle: "Disaster recovery, adaptive topology & failover" },
  { id: "bottom", cubeImg: "/6.jpg",     bgImg: "/nature6.jpg", title: "Markets",     subtitle: "Day-ahead pricing, ancillary services & REC trading" },
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
              <div className="relative max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-0.5 text-xs uppercase tracking-wider text-cyan-400 backdrop-blur-sm">
                  Face {i + 1} / 6
                </div>
                <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">{f.title}</h2>
                <p className="mt-2 text-white/70">{f.subtitle}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
