"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import LoadingScreen from "@/components/LoadingScreen";

interface OptimizationResult {
  solarCapacity: number;
  windCapacity: number;
  cost: number;
  sustainability: number;
  energyOutput: number;
  disasterResilience: number;
  maintenanceFeasibility: number;
  score: number;
}

export default function OptimizePage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const runOptimization = async () => {
    setLoading(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) return prev + Math.random() * 20;
          return prev;
        });
      }, 300);

      const response = await fetch("/api/optimize", { method: "POST" });
      clearInterval(progressInterval);

      const data = await response.json();
      setProgress(100);
      setResult(data.result);
      setRecommendations(data.recommendations);

      // Keep loading screen visible for 1 second after completion
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Optimization failed:", error);
      setLoading(false);
    }
  };

  const comparisonData = [
    {
      name: "Solar",
      baseline: 40,
      optimized: result?.solarCapacity || 0,
    },
    {
      name: "Wind",
      baseline: 30,
      optimized: result?.windCapacity || 0,
    },
    {
      name: "Cost ($M)",
      baseline: 80,
      optimized: result?.cost || 0,
    },
    {
      name: "Resilience",
      baseline: 60,
      optimized: result?.disasterResilience || 0,
    },
  ];

  const objectiveData = result
    ? [
        {
          name: "Cost",
          value: Math.round(result.cost),
          color: "#ef4444",
        },
        {
          name: "Sustainability",
          value: Math.round(result.sustainability),
          color: "#10b981",
        },
        {
          name: "Energy",
          value: Math.round(result.energyOutput),
          color: "#f59e0b",
        },
        {
          name: "Resilience",
          value: Math.round(result.disasterResilience),
          color: "#0ea5e9",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      {loading && <LoadingScreen message="Running PSO Optimization" progress={progress} />}
      <div className="max-w-6xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 gradient-text text-center"
        >
          Swarm Optimization
        </motion.h1>

        {/* Control Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center mb-8"
        >
          <p className="text-slate-300 mb-6">
            Click to run multi-objective PSO algorithm across 5 optimization
            dimensions
          </p>
          <button
            onClick={runOptimization}
            disabled={loading}
            className={`btn-primary px-8 py-3 text-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Optimizing..." : "Run PSO Algorithm"}
          </button>
        </motion.div>

        {/* Results Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <p className="text-slate-400 mb-1">Solar Capacity</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {result.solarCapacity.toFixed(1)} MW
                </p>
              </div>
              <div className="card">
                <p className="text-slate-400 mb-1">Wind Capacity</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {result.windCapacity.toFixed(1)} MW
                </p>
              </div>
              <div className="card">
                <p className="text-slate-400 mb-1">Total Cost</p>
                <p className="text-3xl font-bold text-red-400">
                  ${result.cost.toFixed(1)}M
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Comparison Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Baseline vs Optimized
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="baseline" fill="#64748b" />
                    <Bar dataKey="optimized" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Objectives Pie Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="card"
              >
                <h3 className="text-lg font-semibold mb-4">Objective Score</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={objectiveData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {objectiveData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <ul className="space-y-2">
                {recommendations.map((rec, i) => (
                  <li key={i} className="text-slate-300">
                    {rec}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Detailed Metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Sustainability</p>
                  <p className="text-2xl font-bold text-green-400">
                    {result.sustainability.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Energy Output</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {result.energyOutput.toFixed(1)} MWh/yr
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Disaster Resilience</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {result.disasterResilience.toFixed(1)}/100
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Maintenance</p>
                  <p className="text-2xl font-bold text-purple-400">
                    ${result.maintenanceFeasibility.toFixed(1)}M
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
