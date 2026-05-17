"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("@/components/MapComponent"),
  { ssr: false }
);

export default function MapsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 gradient-text text-center"
        >
          Energy Resource Maps
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-300 text-center mb-8 max-w-2xl mx-auto"
        >
          Interactive maps showing solar potential, wind resources, and optimal
          deployment zones powered by OpenStreetMap and Leaflet.js
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-0 overflow-hidden h-[600px]"
        >
          <MapComponent />
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
        >
          <div className="card">
            <div className="w-4 h-4 bg-yellow-400 rounded-full mb-2"></div>
            <p className="text-sm">High Solar Potential</p>
          </div>
          <div className="card">
            <div className="w-4 h-4 bg-cyan-400 rounded-full mb-2"></div>
            <p className="text-sm">High Wind Potential</p>
          </div>
          <div className="card">
            <div className="w-4 h-4 bg-green-400 rounded-full mb-2"></div>
            <p className="text-sm">Suitable Area</p>
          </div>
          <div className="card">
            <div className="w-4 h-4 bg-red-400 rounded-full mb-2"></div>
            <p className="text-sm">Restricted Zone</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
