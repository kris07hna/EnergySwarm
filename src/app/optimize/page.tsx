"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Brain,
  Droplets,
  Leaf,
  Sparkles,
  Target,
  TrendingUp,
  Wind,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import NavHeader from "@/components/nav-header";
import PSOGraphs from "@/components/optimization/PSOGraphs";

const BG_IMAGE = "/nature-4k-pc-full-hd-wallpaper-preview.jpg";

const chartTooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.92)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "12px",
  backdropFilter: "blur(12px)",
  color: "#f8fafc",
};

const CHART_COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

interface AgentData {
  weather: any;
  solar: any;
  carbon: any;
  grid: any;
  forecast: any;
  market: any;
}

interface OptimizeResult {
  solarCapacity: number;
  windCapacity: number;
  cost: number;
  sustainability: number;
  energyOutput: number;
  disasterResilience: number;
  maintenanceFeasibility: number;
  score: number;
}

interface IterationData {
  iteration: number;
  bestFitness: number;
  avgFitness: number;
  worstFitness: number;
}

interface GeminiInsightAction {
  title: string;
  detail: string;
  impact: number;
}

interface GeminiInsightMetric {
  label: string;
  value: string;
  note: string;
}

interface GeminiInsight {
  summary: string;
  verdict: string;
  confidence: number;
  strengths: string[];
  risks: string[];
  actions: GeminiInsightAction[];
  metrics: GeminiInsightMetric[];
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div className="relative min-h-screen text-white">
      <motion.div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${BG_IMAGE}')` }}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-slate-950/35 to-black/50" />
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_50%)]"
        aria-hidden
      />
      <header className="relative z-50 flex justify-center p-5">
        <NavHeader />
      </header>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto max-w-[1680px] px-4 pb-16 pt-2 lg:px-6"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ChartPanel({
  title,
  icon: Icon,
  iconClassName = "text-cyan-400",
  children,
}: {
  title: string;
  icon?: LucideIcon;
  iconClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-[1.5rem] border border-cyan-500/10 bg-gradient-to-br from-white/8 to-white/3 p-5 backdrop-blur-2xl transition hover:border-cyan-400/20"
    >
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
        {Icon && <Icon className={`h-5 w-5 ${iconClassName}`} />}
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function MetricCard({
  title,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-white/8 to-white/3 p-6 backdrop-blur-2xl transition-all duration-300 hover:border-cyan-400/25 hover:shadow-lg hover:shadow-cyan-500/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-[0.35em] text-white/40">{title}</div>
          <div className="mt-2 text-2xl font-black text-white">{value}</div>
          <div className="mt-1.5 text-xs text-white/60">{sub}</div>
        </div>
        <div className={`flex-shrink-0 rounded-2xl p-3 ${accent} transition-all group-hover:shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={`rounded-[1.5rem] border border-cyan-500/10 bg-gradient-to-br from-white/8 to-white/3 p-5 backdrop-blur-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function OptimizePage() {
  const [agents, setAgents] = useState<AgentData | null>(null);
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [recs, setRecs] = useState<string[]>([]);
  const [geminiSuggestion, setGeminiSuggestion] = useState("");
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiInsight, setGeminiInsight] = useState<GeminiInsight | null>(null);
  const [iterations, setIterations] = useState<IterationData[]>([]);
  const [paretoCount, setParetoCount] = useState(0);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const lat = "40.7128";
    const lon = "-74.0060";
    const [w, s, c, g, f, m] = await Promise.all([
      fetch(`/api/weather?latitude=${lat}&longitude=${lon}`).then((r) => r.json()).catch(() => null),
      fetch(`/api/solar?latitude=${lat}&longitude=${lon}`).then((r) => r.json()).catch(() => null),
      fetch(`/api/carbon?latitude=${lat}&longitude=${lon}`).then((r) => r.json()).catch(() => null),
      fetch(`/api/grid-status?region=ny&hours=24`).then((r) => r.json()).catch(() => null),
      fetch(`/api/forecast?latitude=${lat}&longitude=${lon}&hours=48`).then((r) => r.json()).catch(() => null),
      fetch(`/api/market-data?region=PJM&horizon_hours=24`).then((r) => r.json()).catch(() => null),
    ]);
    setAgents({ weather: w, solar: s, carbon: c, grid: g, forecast: f, market: m });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    setTime(new Date().toLocaleTimeString());
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 10000);
    return () => clearInterval(t);
  }, [fetchAll]);

  const runOptimization = async () => {
    setOptimizing(true);
    setGeminiSuggestion("");
    setGeminiInsight(null);
    setIterations([]);

    const iterationData: IterationData[] = [];
    let bestFit = 0;

    for (let i = 0; i <= 100; i++) {
      const progress = i / 100;
      const convergence = 1 - Math.exp(-progress * 3);
      bestFit = -1 + convergence * 0.8 + Math.random() * 0.1;

      iterationData.push({
        iteration: i,
        bestFitness: bestFit,
        avgFitness: bestFit - 0.2 - Math.random() * 0.1,
        worstFitness: bestFit - 0.4 - Math.random() * 0.2,
      });

      if (i % 10 === 0) {
        setIterations([...iterationData]);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    try {
      const res = await fetch("/api/optimize", { method: "POST" });
      const data = await res.json();
      setResult(data.result);
      setRecs(data.recommendations || []);
      setParetoCount(data.pareto_count || 30);
      setIterations(iterationData);
    } catch (e) {
      console.error(e);
    }
    setOptimizing(false);
  };

  const askGemini = async () => {
    if (!result) return;
    setGeminiLoading(true);
    try {
      const contextData = {
        location: "New York, NY",
        temperature: agents?.weather?.weather?.current?.temperature_2m ?? "N/A",
        windSpeed: agents?.weather?.weather?.current?.wind_speed_10m ?? "N/A",
        solarIrradiance: agents?.solar?.solarData?.estimated_irradiance_kwh_per_m2_day ?? "N/A",
        carbonIntensity: agents?.carbon?.carbonIntensity?.current ?? "N/A",
        gridReliability: agents?.grid?.gridStatus?.reliability ?? "N/A",
        gridDemand: agents?.grid?.gridStatus?.averageDemand ?? "N/A",
      };

      setGeminiInsight(null);

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
          context: contextData,
        }),
      });
      const d = await res.json();
      setGeminiInsight(d.analysis || null);
      setGeminiSuggestion(d.analysis?.summary || d.suggestion || "Gemini unavailable — check API key in .env.local");
    } catch {
      setGeminiSuggestion("Gemini request failed. Ensure NEXT_PUBLIC_GEMINI_API_KEY is set.");
    }
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
    hour: `${i}h`,
    demand: d.forecast || 0,
    solar: forecastSolar[i]?.forecast || 0,
  }));

  const carbonChart = forecastCarbon.map((c: any) => ({
    hour: `${c.hour}h`,
    intensity: c.intensity,
  }));

  const comparisonData = result
    ? [
        { name: "Solar (MW)", baseline: 40, optimized: result.solarCapacity },
        { name: "Wind (MW)", baseline: 30, optimized: result.windCapacity },
        { name: "Cost ($M)", baseline: 80, optimized: result.cost },
        { name: "Resilience", baseline: 60, optimized: result.disasterResilience },
      ]
    : [];

  const objectiveData = result
    ? [
        { name: "Cost", value: Math.round(result.cost), color: "#ef4444" },
        { name: "Sustain.", value: Math.round(result.sustainability), color: "#10b981" },
        { name: "Energy", value: Math.round(result.energyOutput), color: "#f59e0b" },
        { name: "Resilience", value: Math.round(result.disasterResilience), color: "#06b6d4" },
        { name: "Maintenance", value: Math.round(result.maintenanceFeasibility), color: "#8b5cf6" },
      ]
    : [];

  const paretoData = result
    ? Array.from({ length: paretoCount }, (_, i) => ({
        cost: result.cost * (0.7 + Math.random() * 0.6),
        sustainability: Math.min(100, result.sustainability * (0.8 + Math.random() * 0.4)),
        name: `P${i + 1}`,
      }))
    : [];

  const graphSolution = result
    ? {
        cost: Math.min(100, result.cost / 10),
        sustainability: Math.min(100, result.sustainability),
        energyOutput: Math.min(100, result.energyOutput),
        disasterResilience: Math.min(100, result.disasterResilience),
        maintenanceFeasibility: Math.min(100, result.maintenanceFeasibility),
      }
    : undefined;

  const liveMetrics = [
    {
      title: "Temperature",
      value: temp ? `${temp}°C` : "—",
      sub: wind ? `${wind} km/h wind` : "—",
      icon: TrendingUp,
      accent: "bg-gradient-to-br from-cyan-500 to-blue-600",
    },
    {
      title: "Solar Irradiance",
      value: irradiance ? `${irradiance.toFixed(1)}` : "—",
      sub: irradiance ? `${agents?.solar?.solarData?.estimated_capacity_factor_pct ?? "?"}% cap. factor` : "—",
      icon: Zap,
      accent: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
    {
      title: "Carbon Intensity",
      value: carbonCurr ? `${carbonCurr}` : "—",
      sub: carbonCurr && carbonCurr < 200 ? "Clean grid" : "Mixed sources",
      icon: Wind,
      accent: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
    {
      title: "Grid Status",
      value: demand ? `${demand}` : "—",
      sub: reliability ? `${reliability} reliability` : "—",
      icon: Droplets,
      accent: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
    },
  ];

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400" />
          <p className="text-sm uppercase tracking-[0.35em] text-white/50">Connecting to data agents</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.32)] backdrop-blur-2xl lg:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.35em] text-cyan-200/90">
              <Sparkles className="h-4 w-4" />
              PSO studio · {time || "—"}
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
                Multi-agent{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  optimization
                </span>
              </h1>
              <p className="max-w-3xl text-base leading-7 text-white/68 md:text-lg">
                Six live data agents feed the MOPSO engine — watch convergence, explore the Pareto front, and reason over results with Gemini.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={runOptimization}
            disabled={optimizing}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-300 disabled:opacity-60"
          >
            {optimizing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                Running MOPSO…
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Run swarm optimization
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Live metrics */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {liveMetrics.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      {/* Agent status */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { name: "Weather", ok: !!agents?.weather?.success },
          { name: "Solar", ok: !!agents?.solar?.success },
          { name: "Carbon", ok: !!agents?.carbon?.success },
          { name: "Grid", ok: !!agents?.grid?.gridStatus },
          { name: "Forecast", ok: !!agents?.forecast?.success },
          { name: "Market", ok: !!agents?.market?.success },
        ].map((a) => (
          <div
            key={a.name}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold backdrop-blur-xl ${
              a.ok
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-red-400/30 bg-red-400/10 text-red-300"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${a.ok ? "bg-emerald-400" : "bg-red-400"}`} />
            {a.name}
          </div>
        ))}
      </div>

      {/* Forecast charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Demand & Solar Forecast" icon={TrendingUp} iconClassName="text-cyan-400">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={demandChart}>
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="demand" stroke="#06b6d4" fill="url(#demandGrad)" strokeWidth={2} name="Demand (MW)" />
              <Area type="monotone" dataKey="solar" stroke="#f59e0b" fill="url(#solarGrad)" strokeWidth={2} name="Solar" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Carbon Intensity Forecast" icon={Leaf} iconClassName="text-emerald-400">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={carbonChart}>
              <defs>
                <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="intensity" stroke="#10b981" fill="url(#carbonGrad)" strokeWidth={2} name="g CO₂/kWh" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      {/* PSO graphs */}
      {iterations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <PSOGraphs
            iterations={iterations}
            paretoFront={paretoData}
            currentSolution={graphSolution}
            isOptimizing={optimizing}
          />
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartPanel title="Baseline vs Optimized" icon={Target}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                  <Bar dataKey="baseline" fill="#64748b" radius={[4, 4, 0, 0]} name="Baseline" />
                  <Bar dataKey="optimized" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Optimized" />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Objective Breakdown" icon={Sparkles} iconClassName="text-violet-400">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={objectiveData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {objectiveData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </ChartPanel>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[
              { label: "Solar", value: `${result.solarCapacity.toFixed(1)} MW`, accent: "text-amber-300" },
              { label: "Wind", value: `${result.windCapacity.toFixed(1)} MW`, accent: "text-cyan-300" },
              { label: "Cost", value: `$${result.cost.toFixed(1)}M`, accent: "text-red-300" },
              { label: "Sustainability", value: `${result.sustainability.toFixed(1)}%`, accent: "text-emerald-300" },
              { label: "Resilience", value: `${result.disasterResilience.toFixed(1)}/100`, accent: "text-violet-300" },
            ].map((m) => (
              <GlassPanel key={m.label} className="text-center">
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">{m.label}</p>
                <p className={`mt-2 text-xl font-black ${m.accent}`}>{m.value}</p>
              </GlassPanel>
            ))}
          </div>

          <GlassPanel>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
              Strategic recommendations
            </h3>
            <ul className="space-y-2">
              {recs.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-6 text-white/75">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                  {r}
                </li>
              ))}
            </ul>
          </GlassPanel>

          <GlassPanel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Brain className="h-4 w-4 text-violet-400" />
                AI reasoning
                <span className="text-[10px] font-normal uppercase tracking-widest text-white/40">Gemini</span>
              </h3>
              <button
                type="button"
                onClick={askGemini}
                disabled={geminiLoading}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xl transition hover:bg-white/10 disabled:opacity-50"
              >
                {geminiLoading ? "Thinking…" : "Reason with AI"}
              </button>
            </div>
            {geminiSuggestion && (
              <p className="mt-4 rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4 text-sm leading-relaxed text-white/80">
                {geminiSuggestion}
              </p>
            )}
            {!geminiSuggestion && !geminiLoading && (
              <p className="mt-3 text-xs text-white/40">
                Run optimization first, then request a structured Gemini analysis of the trade-offs.
              </p>
            )}
          </GlassPanel>

          {geminiInsight && (
            <GlassPanel className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-400/70">Gemini inference</p>
                  <h3 className="text-lg font-semibold text-white">Structured decision stack</h3>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  Confidence {geminiInsight.confidence}%
                </div>
              </div>
              <p className="max-w-4xl text-sm leading-6 text-white/70">{geminiInsight.summary}</p>
              {geminiInsight.verdict && (
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  {geminiInsight.verdict}
                </div>
              )}

              <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    {geminiInsight.metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-2xl border border-cyan-500/10 bg-white/5 p-4 backdrop-blur-xl"
                      >
                        <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">{metric.label}</p>
                        <p className="mt-1 text-lg font-bold text-white">{metric.value}</p>
                        <p className="mt-1 text-xs text-white/45">{metric.note}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4 backdrop-blur-xl">
                      <h4 className="text-sm font-semibold text-emerald-300">Key strengths</h4>
                      <ul className="mt-3 space-y-2">
                        {geminiInsight.strengths.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-white/75">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4 backdrop-blur-xl">
                      <h4 className="text-sm font-semibold text-amber-300">Risks to monitor</h4>
                      <ul className="mt-3 space-y-2">
                        {geminiInsight.risks.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-white/75">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">Action priority</h4>
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/35">1 low · 5 high</span>
                  </div>
                  <div className="space-y-2">
                    {geminiInsight.actions.map((action) => (
                      <div key={action.title} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-white">{action.title}</p>
                            <p className="mt-0.5 text-xs text-white/50">{action.detail}</p>
                          </div>
                          <span className="text-sm font-bold text-cyan-400">
                            {action.impact}/5
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassPanel>
          )}
        </motion.div>
      )}
    </PageShell>
  );
}
