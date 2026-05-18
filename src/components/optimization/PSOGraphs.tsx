"use client";

/**
 * PSO Optimization Graphs Component
 * Real-time visualization of particle swarm optimization progress
 * 
 * Features:
 * - Convergence graph (fitness over iterations)
 * - Pareto front visualization
 * - Objective breakdown radar chart
 * - Real-time updates during optimization
 * 
 * References:
 * - Kennedy & Eberhart (1995): Particle Swarm Optimization
 * - Coello et al. (2004): Multi-Objective PSO
 * - Recharts Documentation: https://recharts.org/
 */

import { useMemo } from "react";
import {
  Line, ScatterChart, Scatter, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from "recharts";
import { TrendingDown, Target, Activity } from "lucide-react";

interface PSOGraphsProps {
  iterations: Array<{
    iteration: number;
    bestFitness: number;
    avgFitness: number;
    worstFitness: number;
  }>;
  paretoFront?: Array<{
    cost: number;
    sustainability: number;
    label?: string;
  }>;
  currentSolution?: {
    cost: number;
    sustainability: number;
    energyOutput: number;
    disasterResilience: number;
    maintenanceFeasibility: number;
  };
  isOptimizing?: boolean;
  showObjectiveBreakdown?: boolean;
}

export default function PSOGraphs({
  iterations,
  paretoFront = [],
  currentSolution,
  isOptimizing = false,
  showObjectiveBreakdown = true,
}: PSOGraphsProps) {
  const objectiveData = useMemo(() => {
    // If we have an explicit current solution use it.
    if (currentSolution) {
      return [
        { objective: "Cost", value: Math.max(0, Math.min(100, 100 - currentSolution.cost / 100)), fullMark: 100 },
        { objective: "Sustainability", value: Math.max(0, Math.min(100, currentSolution.sustainability)), fullMark: 100 },
        { objective: "Energy", value: Math.max(0, Math.min(100, currentSolution.energyOutput)), fullMark: 100 },
        { objective: "Resilience", value: Math.max(0, Math.min(100, currentSolution.disasterResilience)), fullMark: 100 },
        { objective: "Maintenance", value: Math.max(0, Math.min(100, currentSolution.maintenanceFeasibility)), fullMark: 100 },
      ];
    }

    // Fallback: derive approximate radar values from Pareto front if available
    if (paretoFront && paretoFront.length > 0) {
      const avgCost = paretoFront.reduce((s, p) => s + (p.cost || 0), 0) / paretoFront.length;
      const costs = paretoFront.map((p) => p.cost || 0);
      const minCost = Math.min(...costs);
      const maxCost = Math.max(...costs);
      const costNorm = maxCost > minCost ? 1 - (avgCost - minCost) / (maxCost - minCost) : 0.5;

      const avgSust = paretoFront.reduce((s, p) => s + (p.sustainability || 0), 0) / paretoFront.length;

      const costPct = Math.round(Math.min(100, Math.max(0, costNorm * 100)));
      const sustPct = Math.round(Math.min(100, Math.max(0, avgSust)));

      // Use sustainability as proxy for energy output, leave resilience/maintenance at a neutral value
      return [
        { objective: "Cost", value: costPct, fullMark: 100 },
        { objective: "Sustainability", value: sustPct, fullMark: 100 },
        { objective: "Energy", value: Math.round(Math.max(0, Math.min(100, sustPct * 0.9))), fullMark: 100 },
        { objective: "Resilience", value: 50, fullMark: 100 },
        { objective: "Maintenance", value: 50, fullMark: 100 },
      ];
    }

    return [];
  }, [currentSolution, paretoFront]);

  const paretoScatterData = useMemo(() => {
    const basePoints = paretoFront.map((point) => ({
      cost: point.cost,
      sustainability: point.sustainability,
      label: point.label,
    }));

    if (currentSolution) {
      basePoints.push({
        cost: currentSolution.cost,
        sustainability: currentSolution.sustainability,
        label: "Current Best",
      });
    }

    if (basePoints.length === 0) return [];

    const costs = basePoints.map((point) => point.cost);
    const susts = basePoints.map((point) => point.sustainability);
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const minSust = Math.min(...susts);
    const maxSust = Math.max(...susts);

    const normalize = (value: number, min: number, max: number, inverted = false) => {
      if (max <= min) return 50;
      const scaled = ((value - min) / (max - min)) * 100;
      return inverted ? 100 - scaled : scaled;
    };

    return basePoints.map((point) => ({
      cost: normalize(point.cost, minCost, maxCost, true),
      sustainability: normalize(point.sustainability, minSust, maxSust, false),
      rawCost: point.cost,
      rawSustainability: point.sustainability,
      label: point.label,
    }));
  }, [currentSolution, paretoFront]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (iterations.length === 0) return null;
    
    const latest = iterations[iterations.length - 1];
    const improvement = iterations.length > 1 
      ? ((iterations[0].bestFitness - latest.bestFitness) / Math.abs(iterations[0].bestFitness)) * 100
      : 0;
    
    return {
      currentBest: latest.bestFitness,
      improvement: improvement,
      convergence: iterations.length >= 10 
        ? Math.abs(iterations[iterations.length - 1].bestFitness - iterations[iterations.length - 10].bestFitness) < 0.001
        : false
    };
  }, [iterations]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-white/60 uppercase tracking-wider">Best Fitness</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.currentBest.toFixed(4)}</div>
            <div className="text-xs text-blue-400 mt-1">
              {stats.improvement > 0 ? '↓' : '↑'} {Math.abs(stats.improvement).toFixed(1)}% from start
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-white/60 uppercase tracking-wider">Iterations</span>
            </div>
            <div className="text-2xl font-bold text-white">{iterations.length}</div>
            <div className="text-xs text-purple-400 mt-1">
              {isOptimizing ? 'Optimizing...' : 'Complete'}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-xs text-white/60 uppercase tracking-wider">Convergence</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.convergence ? 'Yes' : 'No'}
            </div>
            <div className="text-xs text-green-400 mt-1">
              {paretoFront.length} Pareto solutions
            </div>
          </div>
        </div>
      )}

      {/* Main Graphs Stack */}
      <div className="space-y-6">
        {/* Convergence Graph */}
        <div className="rounded-3xl border border-white/10 bg-slate-800/55 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,6,23,0.18)]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-blue-400" />
            Convergence Analysis
          </h3>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={iterations}>
              <defs>
                <linearGradient id="bestGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis 
                dataKey="iteration" 
                stroke="#ffffff40" 
                tick={{ fontSize: 12, fill: '#ffffff60' }}
                label={{ value: 'Iteration', position: 'insideBottom', offset: -5, fill: '#ffffff60' }}
              />
              <YAxis 
                stroke="#ffffff40" 
                tick={{ fontSize: 12, fill: '#ffffff60' }}
                label={{ value: 'Fitness', angle: -90, position: 'insideLeft', fill: '#ffffff60' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: '#1e293b', 
                  border: '1px solid #334155', 
                  borderRadius: 8,
                  fontSize: 12
                }}
                labelStyle={{ color: '#ffffff' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: 12 }}
                iconType="line"
              />
              <Area 
                type="monotone" 
                dataKey="bestFitness" 
                stroke="#3b82f6" 
                fill="url(#bestGradient)" 
                strokeWidth={2}
                name="Best Fitness"
                dot={false}
              />
              <Area 
                type="monotone" 
                dataKey="avgFitness" 
                stroke="#8b5cf6" 
                fill="url(#avgGradient)" 
                strokeWidth={1.5}
                name="Average Fitness"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="worstFitness" 
                stroke="#ef4444" 
                strokeWidth={1}
                name="Worst Fitness"
                dot={false}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pareto Front */}
        <div className="rounded-3xl border border-white/10 bg-slate-800/55 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,6,23,0.18)]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Pareto Front
          </h3>
          <ResponsiveContainer width="100%" height={360}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis 
                type="number" 
                dataKey="cost" 
                name="Normalized Cost" 
                stroke="#ffffff40"
                tick={{ fontSize: 12, fill: '#ffffff60' }}
                domain={[0, 100]}
                label={{ value: 'Cost trade-off (normalized)', position: 'insideBottom', offset: -5, fill: '#ffffff60' }}
              />
              <YAxis 
                type="number" 
                dataKey="sustainability" 
                name="Normalized Sustainability" 
                stroke="#ffffff40"
                tick={{ fontSize: 12, fill: '#ffffff60' }}
                domain={[0, 100]}
                label={{ value: 'Sustainability (normalized)', angle: -90, position: 'insideLeft', fill: '#ffffff60' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  background: '#1e293b', 
                  border: '1px solid #334155', 
                  borderRadius: 8,
                  fontSize: 12
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: 12 }}
              />
              <Scatter 
                name="Pareto Solutions" 
                data={paretoScatterData.filter((point) => point.label !== "Current Best")} 
                fill="#8b5cf6"
                shape="circle"
              />
              {currentSolution && (
                <Scatter
                  name="Current Best"
                  data={paretoScatterData.filter((point) => point.label === "Current Best")}
                  fill="#fbbf24"
                  shape="star"
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Objective Breakdown Radar */}
      {showObjectiveBreakdown && objectiveData.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-slate-800/55 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,6,23,0.18)]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Multi-Objective Performance
          </h3>
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart data={objectiveData}>
              <PolarGrid stroke="#ffffff20" />
              <PolarAngleAxis 
                dataKey="objective" 
                tick={{ fontSize: 12, fill: '#ffffff80' }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#ffffff60' }}
              />
              <Radar 
                name="Performance (%)" 
                dataKey="value" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip 
                contentStyle={{ 
                  background: '#1e293b', 
                  border: '1px solid #334155', 
                  borderRadius: 8,
                  fontSize: 12
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
          
          {/* Objective Values */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {objectiveData.map((obj, idx) => (
              <div key={idx} className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-white/60 mb-1">{obj.objective}</div>
                <div className="text-lg font-bold text-white">{obj.value.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {iterations.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-12 backdrop-blur-xl text-center">
          <Activity className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Optimization Data</h3>
          <p className="text-sm text-white/60">
            Run the PSO algorithm to see real-time convergence graphs and Pareto front visualization
          </p>
        </div>
      )}
    </div>
  );
}

// Made with Bob
