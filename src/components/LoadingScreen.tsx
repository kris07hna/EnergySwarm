"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  x: number;
  y: number;
  color: string;
}

export default function LoadingScreen({
  message = "Optimizing Swarm",
  progress = 0,
}: {
  message?: string;
  progress?: number;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#a78bfa"][
        Math.floor(Math.random() * 5)
      ],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center z-50">
      {/* Swarm Animation Background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {particles.map((particle, i) => (
            <motion.circle
              key={i}
              cx={`${particle.x}%`}
              cy={`${particle.y}%`}
              r="4"
              fill={particle.color}
              opacity="0.6"
              animate={{
                x: [0, Math.sin(i) * 50, 0],
                y: [0, Math.cos(i) * 50, 0],
              }}
              transition={{
                duration: 4 + (i % 3),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </svg>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        <div className="mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-blue-400/30 border-t-blue-400"
          />
        </div>

        <h1 className="text-4xl font-bold mb-4 gradient-text">{message}</h1>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-green-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <p className="text-slate-300 text-lg mb-8">{Math.round(progress)}%</p>

        {/* Swarm Status */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                backgroundColor: ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#a78bfa"][i],
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              {i + 1}
            </motion.div>
          ))}
        </div>

        <p className="text-slate-400 text-sm">
          Running 50-particle multi-objective PSO...
        </p>
      </motion.div>
    </div>
  );
}
