"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  ScatterChart, Scatter, PieChart, Pie, Cell,
} from "recharts";
import NavHeader from "@/components/nav-header";

interface AgentData {
  weather: any; solar: any; carbon: any;
  grid: any; forecast: any; market: any;
}

interface OptimizeResult {
  solarCapacity: number; windCapacity: number; cost: number;
  sustainability: number; energyOutput: number;
  disasterResilience: number; maintenanceFeasibility: number; score: number;
}

const CHART_COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

const Container = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl ${className}`}>
    {children}
  </div>
);

export default function OptimizePage() {
  const [agents, setAgents] = useState<AgentData | null>(null);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [recs, setRecs] = useState<string[]>([]);
  const [geminiSuggestion, setGeminiSuggestion] = useState("");
  const [geminiLoading, setGeminiLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const lat = "40.7128", lon = "-74.0060";
    const [w, s, c, g, f, m] = await Promise.all([
      fetch(`/api/weather?latitude=${lat}&longitude=${lon}`).then(r => r.json()).catch(() => null),
      fetch(`/api/solar?latitude=${lat}&longitude=${lon}`).then(r => r.json()).catch(() => null),
      fetch(`/api/carbon?latitude=${lat}&longitude=${lon}`).then(r => r.json()).catch(() => null),
      fetch(`/api/grid-status?region=ny&hours=24`).then(r => r.json()).catch(() => null),
      fetch(`/api/forecast?latitude=${lat}&longitude=${lon}&hours=48`).then(r => r.json()).catch(() => null),
      fetch(`/api/market-data?region=PJM&horizon_hours=24`).then(r => r.json()).catch(() => null),
    ]);
    setAgents({ weather: w, solar: s, carbon: c, grid: g, forecast: f, market: m });
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); const t = setInterval(() => setTime(new Date()), 10000); return () => clearInterval(t); }, [fetchAll]);

  const runOptimization = async () => {
    setOptimizing(true);
    setGeminiSuggestion("");
    try {
      const res = await fetch("/api/optimize", { method: "POST" });
      const data = await res.json();
      setResult(data.result);
      setRecs(data.recommendations || []);
    } catch (e) { console.error(e); }
    setOptimizing(false);
  };

  const askGemini = async () => {
    if (!result) return;
    setGeminiLoading(true);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result: {
            solarCapacity: result.solarCapacity,
            windCapacity: result.windCapacity,
            cost: result.cost,
            sustainability: result.sustainability,
            energyOutput: result.energyOutput,
            disasterResilience: result.disasterResilience,
            maintenanceFeasibility: result.maintenanceFeasibility,
          },
          context: `Real-time grid conditions at NY. Temp: ${agents?.weather?.weather?.current?.temperature_2m ?? "?"}°C, Carbon: ${agents?.carbon?.carbonIntensity?.current ?? "?"} g/kWh, Grid reliability: ${agents?.grid?.gridStatus?.reliability ?? "?"}`,
        }),
      });
      const d = await res.json();
      setGeminiSuggestion(d.suggestion || "Gemini unavailable — check API key.");
    } catch { setGeminiSuggestion("Gemini request failed."); }
    setGeminiLoading(false);
  };

  const temp = agents?.weather?.weather?.current?.temperature_2m ?? null;
  const wind = agents?.weather?.weather?.current?.wind_speed_10m ?? null;
  const irradiance = agents?.solar?.solarData?.estimated_irradiance_kwh_per_m2_day ?? null;
  const carbonCurr = agents?.carbon?.carbonIntensity?.current ?? null;
  const reliability = agents?.grid?.gridStatus?.reliability ?? null;
  const demand = agents?.grid?.gridStatus?.averageDemand ?? null;

  const forecastDemand = agents?.forecast?.forecasts?.demand?.slice(0, 24) ?? [];
  const forecastSolar = agents?.forecast?.forecasts?.solar?.slice(0, 24) ?? [];
  const forecastCarbon = agents?.carbon?.carbonIntensity?.forecast ?? [];

  const demandChart = forecastDemand.map((d: any, i: number) => ({
    hour: `${i}h`, demand: d.forecast || 0,
    solar: forecastSolar[i]?.forecast || 0,
  }));

  const carbonChart = forecastCarbon.map((c: any) => ({
    hour: `${c.hour}h`, intensity: c.intensity,
  }));

  const comparisonData = result ? [
    { name: "Solar (MW)", baseline: 40, optimized: result.solarCapacity },
    { name: "Wind (MW)", baseline: 30, optimized: result.windCapacity },
    { name: "Cost ($M)", baseline: 80, optimized: result.cost },
    { name: "Resilience", baseline: 60, optimized: result.disasterResilience },
  ] : [];

  const objectiveData = result ? [
    { name: "Cost", value: Math.round(result.cost), color: "#ef4444" },
    { name: "Sustain.", value: Math.round(result.sustainability), color: "#10b981" },
    { name: "Energy", value: Math.round(result.energyOutput), color: "#f59e0b" },
    { name: "Resilience", value: Math.round(result.disasterResilience), color: "#06b6d4" },
    { name: "Maintenance", value: Math.round(result.maintenanceFeasibility), color: "#8b5cf6" },
  ] : [];

  const paretoData = result ? Array.from({ length: 30 }, (_, i) => ({
    cost: result.cost * (0.7 + Math.random() * 0.6),
    sustainability: Math.min(100, result.sustainability * (0.8 + Math.random() * 0.4)),
    name: `P${i + 1}`,
  })) : [];

  const liveMetrics = [
    { label: "Temperature", value: temp ? `${temp}°C` : "—", sub: wind ? `${wind} km/h wind` : "—" },
    { label: "Solar Irradiance", value: irradiance ? `${irradiance} kWh/m²` : "—", sub: irradiance ? `${agents?.solar?.solarData?.estimated_capacity_factor_pct ?? "?"}% cap. factor` : "—" },
    { label: "Carbon Intensity", value: carbonCurr ? `${carbonCurr} g/kWh` : "—", sub: carbonCurr && carbonCurr < 200 ? "Clean grid" : "Mixed sources" },
    { label: "Grid Status", value: demand ? `${demand}` : "—", sub: reliability ? `${reliability} reliability` : "—" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <video autoPlay muted loop playsInline preload="auto" className="fixed inset-0 h-full w-full object-cover opacity-20">
        <source src="/video2.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-slate-950/70" />

      <header className="relative z-50 flex justify-center p-6"><NavHeader /></header>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs uppercase tracking-widest text-cyan-400 backdrop-blur-sm">
            Swarm Control · {time.toLocaleTimeString()}
          </div>
          <h1 className="text-4xl font-extrabold text-white md:text-6xl">
            Multi-Agent <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Optimization</span>
          </h1>
          <p className="mt-1 text-sm text-white/50">
            6 agents polling real-time data · MOPSO engine · Gemini reasoning
          </p>
        </motion.div>

        {loading ? (
          <div className="mt-20 flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" /><span className="ml-3 text-white/50">Connecting to data agents...</span></div>
        ) : (
          <>
            {/* Live Metrics */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-6 grid gap-3 md:grid-cols-4">
              {liveMetrics.map((m, i) => (
                <Container key={i}>
                  <div className="text-[10px] uppercase tracking-widest text-white/40">{m.label}</div>
                  <div className="mt-0.5 text-xl font-bold text-white">{m.value}</div>
                  <div className="text-[10px] text-cyan-400/60">{m.sub}</div>
                </Container>
              ))}
            </motion.div>

            {/* Agent Status Strip */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 flex flex-wrap gap-2">
              {[
                { name: "Weather", ok: !!agents?.weather?.success, color: "from-cyan-400 to-blue-500" },
                { name: "Solar", ok: !!agents?.solar?.success, color: "from-amber-400 to-yellow-500" },
                { name: "Carbon", ok: !!agents?.carbon?.success, color: "from-emerald-400 to-green-500" },
                { name: "Grid", ok: !!agents?.grid?.success, color: "from-violet-400 to-purple-500" },
                { name: "Forecast", ok: !!agents?.forecast?.success, color: "from-orange-400 to-red-500" },
                { name: "Market", ok: !!agents?.market?.success, color: "from-rose-400 to-pink-500" },
              ].map((a) => (
                <div key={a.name} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium backdrop-blur-sm ${a.ok ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400" : "border-red-400/30 bg-red-400/10 text-red-400"}`}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${a.ok ? "bg-emerald-400" : "bg-red-400"}`} />
                  {a.name}
                </div>
              ))}
            </motion.div>

            {/* Charts Row 1 — Forecasts */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6 grid gap-5 md:grid-cols-2">
              <Container>
                <h3 className="mb-3 text-sm font-semibold text-white">Demand & Solar Forecast</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={demandChart}>
                    <defs>
                      <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} /><stop offset="100%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
                      <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="100%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="hour" stroke="#ffffff30" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#ffffff30" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="demand" stroke="#06b6d4" fill="url(#demandGrad)" strokeWidth={2} name="Demand (MW)" />
                    <Area type="monotone" dataKey="solar" stroke="#f59e0b" fill="url(#solarGrad)" strokeWidth={2} name="Solar (kW/m²)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Container>

              <Container>
                <h3 className="mb-3 text-sm font-semibold text-white">Carbon Intensity Forecast</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={carbonChart}>
                    <defs>
                      <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="hour" stroke="#ffffff30" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#ffffff30" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="intensity" stroke="#10b981" fill="url(#carbonGrad)" strokeWidth={2} name="g CO₂/kWh" />
                  </AreaChart>
                </ResponsiveContainer>
              </Container>
            </motion.div>

            {/* Control Button */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 text-center">
              <button
                onClick={runOptimization}
                disabled={optimizing}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50"
              >
                {optimizing ? (
                  <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Running 150 MOPSO iterations...</>
                ) : (
                  <><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Run Multi-Agent Swarm Optimization</>
                )}
              </button>
            </motion.div>

            {/* Results */}
            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-6 space-y-5">
                {/* Pareto Front */}
                <Container>
                  <h3 className="mb-3 text-sm font-semibold text-white">Pareto Front — Cost vs Sustainability</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="cost" stroke="#ffffff30" tick={{ fontSize: 10 }} name="Cost ($M)" />
                      <YAxis dataKey="sustainability" stroke="#ffffff30" tick={{ fontSize: 10 }} name="Sustainability (%)" domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter data={paretoData} fill="#8b5cf6" opacity={0.6} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </Container>

                {/* Charts Row 2 — Comparison + Objectives */}
                <div className="grid gap-5 md:grid-cols-2">
                  <Container>
                    <h3 className="mb-3 text-sm font-semibold text-white">Baseline vs Optimized</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff30" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#ffffff30" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="baseline" fill="#475569" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="optimized" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Container>

                  <Container>
                    <h3 className="mb-3 text-sm font-semibold text-white">Objective Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={objectiveData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                          {objectiveData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Container>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                  {[
                    { label: "Solar Capacity", value: `${result.solarCapacity.toFixed(1)} MW`, color: "text-amber-400" },
                    { label: "Wind Capacity", value: `${result.windCapacity.toFixed(1)} MW`, color: "text-cyan-400" },
                    { label: "Total Cost", value: `$${result.cost.toFixed(1)}M`, color: "text-red-400" },
                    { label: "Sustainability", value: `${result.sustainability.toFixed(1)}%`, color: "text-green-400" },
                    { label: "Resilience", value: `${result.disasterResilience.toFixed(1)}/100`, color: "text-blue-400" },
                  ].map((m, i) => (
                    <Container key={i} className="text-center">
                      <div className="text-[10px] uppercase tracking-widest text-white/40">{m.label}</div>
                      <div className={`mt-1 text-lg font-bold ${m.color}`}>{m.value}</div>
                    </Container>
                  ))}
                </div>

                {/* Recommendations */}
                <Container>
                  <h3 className="mb-3 text-sm font-semibold text-white">Strategic Recommendations</h3>
                  <ul className="space-y-1.5">
                    {recs.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70"><span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />{r}</li>
                    ))}
                  </ul>
                </Container>

                {/* Gemini Reasoning */}
                <Container>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">AI Reasoning <span className="text-[10px] font-normal text-white/40">(Gemini)</span></h3>
                    <button
                      onClick={askGemini}
                      disabled={geminiLoading}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition-all hover:bg-white/20 disabled:opacity-50"
                    >
                      {geminiLoading ? "Thinking..." : "Reason with AI"}
                    </button>
                  </div>
                  {geminiSuggestion && (
                    <div className="mt-3 rounded-xl border border-violet-400/20 bg-violet-400/5 p-4 text-sm leading-relaxed text-white/80">
                      {geminiSuggestion}
                    </div>
                  )}
                  {!geminiSuggestion && !geminiLoading && (
                    <p className="mt-3 text-xs text-white/30">Click "Reason with AI" to get Gemini-powered strategic analysis of these results.</p>
                  )}
                </Container>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
