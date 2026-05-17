"use client";

import { useEffect, useState } from "react";

interface SwarmParticle {
  x: number;
  y: number;
  fitness: number;
  isBest: boolean;
}

export function SwarmVisualization({ isVisible = true }: { isVisible?: boolean }) {
  const [particles, setParticles] = useState<SwarmParticle[]>([]);

  useEffect(() => {
    if (!isVisible) return;

    // Generate random particles
    const newParticles: SwarmParticle[] = Array.from({ length: 50 }, () => ({
      x: Math.random(),
      y: Math.random(),
      fitness: Math.random() * 100,
      isBest: Math.random() < 0.05,
    }));
    setParticles(newParticles);

    // Animate particles moving
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: (p.x + (Math.random() - 0.5) * 0.1) % 1,
          y: (p.y + (Math.random() - 0.5) * 0.1) % 1,
          fitness: Math.random() * 100,
        }))
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
      {particles.map((particle, i) => (
        <g key={i}>
          {/* Particle dot */}
          <circle
            cx={`${particle.x * 100}%`}
            cy={`${particle.y * 100}%`}
            r="3"
            fill={particle.isBest ? "#10b981" : "#0ea5e9"}
            opacity={particle.isBest ? 0.9 : 0.6}
          />
          {/* Connection lines to nearby particles */}
          {i < 5 && (
            <line
              x1={`${particle.x * 100}%`}
              y1={`${particle.y * 100}%`}
              x2={`${particles[(i + 1) % particles.length].x * 100}%`}
              y2={`${particles[(i + 1) % particles.length].y * 100}%`}
              stroke="#0ea5e9"
              strokeWidth="0.5"
              opacity="0.3"
            />
          )}
        </g>
      ))}
    </svg>
  );
}

export function useSwarmOptimization(enabled: boolean = false) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startOptimization = async () => {
    if (!enabled) return;
    setIsLoading(true);
    setProgress(0);

    // Simulate optimization progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => {
      clearInterval(interval);
      setIsLoading(false);
    };
  };

  return { isLoading, progress, startOptimization };
}
