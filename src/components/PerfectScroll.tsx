"use client"

import { motion, useScroll, useTransform } from "framer-motion"

const sections = [
  { title: "Optimize Solar", subtitle: "Maximize PV placement & output" },
  { title: "Harness Wind", subtitle: "Smart siting and maintenance" },
  { title: "Storage & Grid", subtitle: "Arbitrage and resilience" },
]

export default function PerfectScroll(): JSX.Element {
  const { scrollYProgress } = useScroll()

  // rotation for the cube (two full turns across the page)
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, 720])
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 360])

  // parallax orbs
  const orb1X = useTransform(scrollYProgress, [0, 1], [-120, 120])
  const orb2X = useTransform(scrollYProgress, [0, 1], [120, -120])
  const orb1Y = useTransform(scrollYProgress, [0, 1], [-40, 40])

  return (
    <section className="perfect-scroll">
      <div className="sticky">
        <div className="scene">
          <motion.div className="orb orb-1" style={{ x: orb1X, y: orb1Y }} />
          <motion.div className="orb orb-2" style={{ x: orb2X }} />

          <motion.div className="cube" style={{ rotateY, rotateX }}>
            <div className="cube-face front">Solar</div>
            <div className="cube-face back">Wind</div>
            <div className="cube-face right">Storage</div>
            <div className="cube-face left">Grid</div>
            <div className="cube-face top">Resilience</div>
            <div className="cube-face bottom">Maintenance</div>
          </motion.div>
        </div>
      </div>

      <div className="scroll-content">
        {sections.map((s, i) => (
          <div key={i} className="scroll-section card m-8 p-8 min-h-[100vh] flex items-center">
            <div>
              <h2 className="text-4xl font-bold gradient-text mb-4">{s.title}</h2>
              <p className="text-slate-300 max-w-xl">{s.subtitle}</p>
            </div>
          </div>
        ))}

        <div className="scroll-section card m-8 p-8 min-h-[100vh] flex items-center">
          <div>
            <h2 className="text-4xl font-bold gradient-text mb-4">Explore the Pareto Front</h2>
            <p className="text-slate-300 max-w-xl">Select solutions and request Gemini suggestions.</p>
            <motion.button className="btn btn-primary mt-6" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              Open Optimize
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}
