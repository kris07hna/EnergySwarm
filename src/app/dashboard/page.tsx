"use client";

import { motion } from "framer-motion";
import { Zap, Wind, Droplets, TrendingUp } from "lucide-react";
import ResearchGradeDashboard from "@/components/ResearchGradeDashboard";

export default function DashboardPage() {
  const metrics = [
    {
      title: "Total Capacity",
      value: "450 MW",
      icon: Zap,
      color: "from-blue-500 to-blue-600",
      trend: "+12%",
    },
    {
      title: "Solar Output",
      value: "280 MW",
      icon: TrendingUp,
      color: "from-yellow-500 to-orange-600",
      trend: "+8%",
    },
    {
      title: "Wind Output",
      value: "170 MW",
      icon: Wind,
      color: "from-cyan-500 to-blue-600",
      trend: "+15%",
    },
    {
      title: "Water Usage",
      value: "45%",
      icon: Droplets,
      color: "from-green-500 to-teal-600",
      trend: "-20%",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="gradient-text mb-4 text-5xl font-bold">SwarmGrid AI</h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            Research-grade multi-objective swarm optimization for sustainable energy grid management.
            AI-powered forecasting, disaster resilience assessment, and energy storage optimization.
          </p>
        </motion.div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card group transition-all duration-300 hover:border-blue-500/50"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className={`rounded-lg bg-gradient-to-br p-3 ${metric.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-green-400">{metric.trend}</span>
                </div>
                <h3 className="mb-1 text-sm text-slate-400">{metric.title}</h3>
                <p className="text-2xl font-bold">{metric.value}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <div className="card">
            <h2 className="mb-3 text-2xl font-bold">Run Optimization</h2>
            <p className="mb-4 text-slate-300">
              Use swarm intelligence to find the optimal balance between all objectives.
              PSO algorithm optimizes across 5 key dimensions simultaneously.
            </p>
            <a href="/optimize" className="btn-primary inline-block">
              Start Optimization →
            </a>
          </div>

          <div className="card">
            <h2 className="mb-3 text-2xl font-bold">View Maps</h2>
            <p className="mb-4 text-slate-300">
              Interactive maps powered by Leaflet and OpenStreetMap. Visualize solar, wind,
              and resource distribution across regions.
            </p>
            <a href="/maps" className="btn-primary inline-block">
              Explore Maps →
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="card mb-12"
        >
          <h2 className="mb-6 text-2xl font-bold">Research-Grade Capabilities</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h3 className="mb-2 font-semibold text-blue-400">🔮 AI Forecasting (ARIMA/Prophet)</h3>
              <p className="text-sm text-slate-300">
                7-day demand, solar, wind, price, and carbon intensity forecasts with 95% confidence intervals
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-green-400">🛡️ Disaster Resilience Assessment</h3>
              <p className="text-sm text-slate-300">
                Earthquake, hurricane, flood, wildfire, and severe weather hazard analysis with mitigation ROI
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-yellow-400">🔋 Energy Storage Optimization</h3>
              <p className="text-sm text-slate-300">
                Dispatch scheduling, cycling strategies, and economic modeling for batteries & storage
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-purple-400">💹 Grid Market Data</h3>
              <p className="text-sm text-slate-300">
                Day-ahead/real-time pricing, ancillary services, capacity markets, and congestion analysis
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-cyan-400">⚡ Multi-Objective PSO</h3>
              <p className="text-sm text-slate-300">
                Optimizes across 5 key dimensions: cost, sustainability, output, resilience, maintainability
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-pink-400">🌐 Free & Gemini APIs</h3>
              <p className="text-sm text-slate-300">
                NASA POWER, NOAA, EIA, USGS, Open-Meteo, Gemini AI integration
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <h2 className="gradient-text mb-6 text-2xl font-bold">Research-Grade Grid Analytics</h2>
          <ResearchGradeDashboard />
        </motion.div>
      </div>
    </div>
  );
}
