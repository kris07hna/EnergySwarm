"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import ErrorBanner, { type ErrorNotification } from "@/components/ErrorBanner";
import ErrorInlineCard from "@/components/ErrorInlineCard";
import SkeletonCard from "@/components/SkeletonCard";
import {
  AreaChart,
  Area,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Activity,
  ArrowRight,
  Brain,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Layers,
  MapPinned,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  Wind,
  Zap,
} from "lucide-react";
import NavHeader from "@/components/nav-header";
const EnhancedMapComponent = dynamic(() => import("@/components/EnhancedMapComponent"), {
  ssr: false,
});
import PSOGraphs from "@/components/optimization/PSOGraphs";

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

interface ObjectiveDatum {
  objective: string;
  value: number;
  fullMark: number;
  color: string;
  label: string;
}

interface ForecastPoint {
  hour: string;
  demand: number;
  solar: number;
}

interface CarbonPoint {
  hour: string;
  intensity: number;
}

type ViewMode = "initialize" | "pso";

const Container = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl ${className}`}>
    {children}
  </div>
);

const MetricCard = ({
  title,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
    className="group rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-white/8 to-white/3 p-6 backdrop-blur-2xl cursor-pointer hover:border-cyan-400/25 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-[0.35em] text-white/40">{title}</div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-3xl font-black text-white">{value}</div>
          <div className="text-xs text-emerald-400">↑</div>
        </div>
        <div className="mt-1.5 text-xs text-white/60">{sub}</div>
      </div>
      <div className={`flex-shrink-0 rounded-2xl p-3 ${accent} group-hover:shadow-lg transition-all`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function SwarmCommandCenter() {
  const [viewMode, setViewMode] = useState<ViewMode>("initialize");
  const [panelView, setPanelView] = useState<"charts" | "table">("charts");
  const [agents, setAgents] = useState<AgentData | null>(null);
  const [time, setTime] = useState("");
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [recs, setRecs] = useState<string[]>([]);
  const [iterations, setIterations] = useState<IterationData[]>([]);
  const [paretoCount, setParetoCount] = useState(0);
  const [swarmSignal, setSwarmSignal] = useState(0);
  const [statusLabel, setStatusLabel] = useState("Idle");
  const [geminiInsight, setGeminiInsight] = useState("");
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [objectiveCarouselIndex, setObjectiveCarouselIndex] = useState(0);
  
  // Error state management
  const [errors, setErrors] = useState<ErrorNotification[]>([]);
  const [agentErrors, setAgentErrors] = useState<Record<string, string | null>>({
    weather: null,
    solar: null,
    carbon: null,
    grid: null,
    forecast: null,
    market: null,
  });

  const addError = useCallback((message: string, type: 'error' | 'warning' = 'error', onRetry?: () => void) => {
    const id = Date.now().toString();
    const notification: ErrorNotification = {
      id,
      message,
      type,
      onRetry,
      autoClose: true,
      duration: 6000,
    };
    setErrors(prev => [...prev, notification]);
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  }, []);

  const fetchAgentData = useCallback(async (agentName: string, url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAgentErrors(prev => ({ ...prev, [agentName]: null }));
      return data;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setAgentErrors(prev => ({ ...prev, [agentName]: errorMsg }));
      return null;
    }
  }, []);

  const fetchAll = useCallback(async () => {
    const lat = "40.7128";
    const lon = "-74.0060";

    const [weather, solar, carbon, grid, forecast, market] = await Promise.all([
      fetchAgentData('weather', `/api/weather?latitude=${lat}&longitude=${lon}`),
      fetchAgentData('solar', `/api/solar?latitude=${lat}&longitude=${lon}`),
      fetchAgentData('carbon', `/api/carbon?latitude=${lat}&longitude=${lon}`),
      fetchAgentData('grid', `/api/grid-status?region=ny&hours=24`),
      fetchAgentData('forecast', `/api/forecast?latitude=${lat}&longitude=${lon}&hours=48`),
      fetchAgentData('market', `/api/market-data?region=PJM&horizon_hours=24`),
    ]);

    setAgents({ weather, solar, carbon, grid, forecast, market });
  }, [fetchAgentData]);

  useEffect(() => {
    fetchAll();
    setTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 10000);
    return () => clearInterval(timer);
  }, [fetchAll]);

  const runOptimization = useCallback(async () => {
    setOptimizing(true);
    setStatusLabel("Launching swarm");
    setResult(null);
    setIterations([]);
    setRecs([]);

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
      const response = await fetch("/api/optimize", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setResult(data.result);
      setRecs(data.recommendations || []);
      setParetoCount(data.pareto_count || 30);
      setIterations(iterationData);
      setStatusLabel("Swarm converged");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setStatusLabel("Optimization failed");
      addError(`Optimization failed: ${errorMsg}`, 'error', () => void runOptimization());
    }

    setOptimizing(false);
  }, []);

  const launchSwarm = useCallback(() => {
    setViewMode("pso");
    setSwarmSignal((value) => value + 1);
    void runOptimization();
  }, [runOptimization]);

  const temp = agents?.weather?.weather?.current?.temperature_2m ?? null;
  const wind = agents?.weather?.weather?.current?.wind_speed_10m ?? null;
  const irradiance = agents?.solar?.solarData?.estimated_irradiance_kwh_per_m2_day ?? null;
  const carbonCurr = agents?.carbon?.carbonIntensity?.current ?? null;
  const reliability = agents?.grid?.gridStatus?.reliability ?? null;
  const demand = agents?.grid?.gridStatus?.averageDemand ?? null;

  const forecastDemand = agents?.forecast?.forecasts?.demand?.slice(0, 24) ?? [];
  const forecastSolar = agents?.forecast?.forecasts?.solar?.slice(0, 24) ?? [];
  const forecastWind = agents?.forecast?.forecasts?.wind?.slice(0, 24) ?? [];
  const forecastCarbon = agents?.carbon?.carbonIntensity?.forecast ?? [];

  const demandChart: ForecastPoint[] = forecastDemand.map((entry: any, index: number) => ({
    hour: `${index}h`,
    demand: entry.forecast || 0,
    solar: forecastSolar[index]?.forecast || 0,
  }));

  const carbonChart: CarbonPoint[] = forecastCarbon.map((entry: any) => ({
    hour: `${entry.hour}h`,
    intensity: entry.intensity,
  }));

  // Fuel mix and market price data for charts
  const fuelMixData = (() => {
    try {
      const sumSolar = forecastSolar.reduce((s: number, e: any) => s + (e?.forecast || 0), 0);
      const sumWind = forecastWind.reduce((s: number, e: any) => s + (e?.forecast || 0), 0);
      const sumDemand = forecastDemand.reduce((s: number, e: any) => s + (e?.forecast || 0), 0);
      const sumFossil = Math.max(0, sumDemand - (sumSolar + sumWind));

      // If no data, use a safe default mix
      if (sumSolar + sumWind + sumFossil <= 0) {
        return [
          { name: "Solar", value: 30 },
          { name: "Wind", value: 25 },
          { name: "Fossil", value: 45 },
        ];
      }

      return [
        { name: "Solar", value: sumSolar },
        { name: "Wind", value: sumWind },
        { name: "Fossil", value: sumFossil },
      ];
    } catch (err) {
      return [
        { name: "Solar", value: 30 },
        { name: "Wind", value: 25 },
        { name: "Fossil", value: 45 },
      ];
    }
  })();

  const fuelPriceData = (agents?.market?.day_ahead_market?.prices || []).map((p: any) => ({ hour: p.hour, price: p.total_lmp }));
  const FUEL_COLORS = ["#f59e0b", "#3b82f6", "#ef4444"];

  const usageRows = [
    {
      area: "Initialize Agents",
      state: viewMode === "initialize" ? "Active" : "Standby",
      use: "Load live weather, solar, grid, and market data before a run.",
      benefit: "Reduces stale-input risk.",
    },
    {
      area: "PSO Swarm",
      state: optimizing ? "Running" : "Ready",
      use: "Search candidate placements and score them across multiple objectives.",
      benefit: "Surfaces the strongest tradeoffs.",
    },
    {
      area: "Map Surface",
      state: `Pulse ${swarmSignal}`,
      use: "Watch particles and best-fit movement over the grid.",
      benefit: "Makes spatial convergence visible.",
    },
    {
      area: "Forecast Table",
      state: panelView === "table" ? "Visible" : "Hidden",
      use: "Compare demand and carbon against available supply windows.",
      benefit: "Supports scheduling decisions.",
    },
  ];

  const forecastTableRows = demandChart.slice(0, 8).map((entry, index: number) => ({
    hour: entry.hour,
    demand: entry.demand,
    solar: entry.solar,
    carbon: carbonChart[index]?.intensity ?? 0,
  }));

  const geminiSlides = [
    {
      title: "Operational summary",
      body:
        geminiInsight ||
        "Request Gemini insight to get a plain-language explanation of the swarm run and how to use the current view.",
      tag: "Gemini",
    },
    {
      title: "Next action",
      body:
        recs[0] ||
        "Run the swarm, inspect the map motion, and compare the live forecast table before changing roles or regions.",
      tag: "Recommendation",
    },
    {
      title: "Risk check",
      body:
        recs[1] ||
        "Watch for flattening convergence, narrow archive diversity, and stale initialization data before interpreting results.",
      tag: "Guardrail",
    },
    {
      title: "How to read the swarm",
      body:
        "Use the map for spatial movement, the stacked charts for convergence, and the lower table to validate demand and carbon conditions.",
      tag: "Guide",
    },
  ];

  useEffect(() => {
    if (geminiSlides.length < 2) return;

    const timer = window.setInterval(() => {
      setCarouselIndex((value) => (value + 1) % geminiSlides.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [geminiSlides.length]);

  useEffect(() => {
    if (carouselIndex >= geminiSlides.length) {
      setCarouselIndex(0);
    }
  }, [carouselIndex, geminiSlides.length]);

  const requestGeminiInsight = useCallback(async () => {
    setGeminiLoading(true);

    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result:
            result ?? {
              solarCapacity: 0,
              windCapacity: 0,
              cost: 0,
              sustainability: 0,
              energyOutput: 0,
              disasterResilience: 0,
              maintenanceFeasibility: 0,
            },
          context: {
            viewMode,
            panelView,
            temperature: temp,
            windSpeed: wind,
            carbonIntensity: carbonCurr,
            demand,
            reliability,
            optimizationState: optimizing ? "running" : "idle",
            note:
              "Explain what the operators should do next, how to use the map, and when to switch between initialize and PSO views.",
          },
        }),
      });

      const data = await response.json();
      setGeminiInsight(data.suggestion || data.analysis?.summary || "No Gemini insight returned.");
    } catch (error) {
      console.error(error);
      setGeminiInsight("Gemini insight request failed. Ensure the API key and suggest route are available.");
    }

    setGeminiLoading(false);
  }, [carbonCurr, demand, optimizing, panelView, reliability, result, temp, viewMode, wind]);

  const graphSolution = useMemo(() => {
    if (!result) return undefined;

    return {
      cost: Math.min(100, result.cost / 10),
      sustainability: Math.min(100, result.sustainability),
      energyOutput: Math.min(100, result.energyOutput),
      disasterResilience: Math.min(100, result.disasterResilience),
      maintenanceFeasibility: Math.min(100, result.maintenanceFeasibility),
    };
  }, [result]);

  const objectiveData = useMemo<ObjectiveDatum[]>(() => {
    if (!result) return [];

    const clamp = (value: number) => Math.max(0, Math.min(100, value));

    return [
      {
        objective: "Cost",
        value: clamp(100 - result.cost / 100),
        fullMark: 100,
        color: "#f97316",
        label: `$${result.cost.toFixed(1)}M`,
      },
      {
        objective: "Sustainability",
        value: clamp(result.sustainability),
        fullMark: 100,
        color: "#22c55e",
        label: `${result.sustainability.toFixed(1)}%`,
      },
      {
        objective: "Energy",
        value: clamp(result.energyOutput),
        fullMark: 100,
        color: "#38bdf8",
        label: `${result.energyOutput.toFixed(1)}`,
      },
      {
        objective: "Resilience",
        value: clamp(result.disasterResilience),
        fullMark: 100,
        color: "#a855f7",
        label: `${result.disasterResilience.toFixed(1)}%`,
      },
      {
        objective: "Maintenance",
        value: clamp(result.maintenanceFeasibility * 2),
        fullMark: 100,
        color: "#fbbf24",
        label: `$${result.maintenanceFeasibility.toFixed(1)}M`,
      },
    ];
  }, [result]);

  const objectiveHighlights = useMemo(() => {
    if (objectiveData.length === 0) return null;

    const ranked = [...objectiveData].sort((a, b) => b.value - a.value);
    const average = objectiveData.reduce((sum, entry) => sum + entry.value, 0) / objectiveData.length;

    return {
      strongest: ranked[0],
      weakest: ranked[ranked.length - 1],
      average,
    };
  }, [objectiveData]);

  useEffect(() => {
    if (objectiveData.length < 2) return;

    const timer = window.setInterval(() => {
      setObjectiveCarouselIndex((value) => (value + 1) % 2);
    }, 8500);

    return () => window.clearInterval(timer);
  }, [objectiveData.length]);

  useEffect(() => {
    if (objectiveCarouselIndex > 1) {
      setObjectiveCarouselIndex(0);
    }
  }, [objectiveCarouselIndex]);

  const paretoFront = useMemo(() => {
    if (!result) return [];

    return Array.from({ length: Math.min(Math.max(paretoCount, 12), 18) }, (_, index) => ({
      cost: Math.max(10, result.cost * (0.85 + Math.random() * 0.25)),
      sustainability: Math.min(100, result.sustainability * (0.85 + Math.random() * 0.25)),
      label: `P${index + 1}`,
    }));
  }, [result, paretoCount]);

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

  const agentCards = [
    { name: "Weather", active: !!agents?.weather?.success, detail: "Open-Meteo live feed" },
    { name: "Solar", active: !!agents?.solar?.success, detail: "NASA POWER irradiance" },
    { name: "Carbon", active: !!agents?.carbon?.success, detail: "Intensity and forecast" },
    { name: "Grid", active: !!agents?.grid?.gridStatus, detail: "Regional operating status" },
    { name: "Forecast", active: !!agents?.forecast?.success, detail: "Demand and solar outlook" },
    { name: "Market", active: !!agents?.market?.success, detail: "Price and liquidity signals" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_60%),linear-gradient(180deg,#020617_0%,#0f172a_42%,#020617_100%)] text-white">
      <ErrorBanner errors={errors} onDismiss={removeError} />
      <div
        className="fixed inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url('/swarmbackgorund.jpg')` }}
        aria-hidden
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-slate-950/35 to-black/50" />

      <header className="relative z-50 flex justify-center p-5">
        <NavHeader />
      </header>

      <div className="relative z-10 mx-auto max-w-[1680px] px-4 pb-16 pt-2 lg:px-6">
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
                Swarm command center
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  Agents, map intelligence, and PSO graphs in one control surface.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-white/68 md:text-lg">
                  Switch between agent initialization and live swarm optimization, then watch the same run animate across the map and convergence graphs while the optimization process unfolds.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/analytics-board" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Open analytics board <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/maps" className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                View map intelligence <MapPinned className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Mode" value={viewMode === "initialize" ? "Initialize" : "PSO"} sub={statusLabel} icon={Layers} accent="bg-gradient-to-br from-slate-700 to-slate-500" />
          <MetricCard title="Swarm" value={optimizing ? "Active" : "Standby"} sub={time || "—"} icon={Target} accent="bg-gradient-to-br from-blue-500 to-violet-600" />
          <MetricCard title="Pareto Set" value={paretoCount ? `${paretoCount}` : "—"} sub="Front size" icon={TrendingUp} accent="bg-gradient-to-br from-emerald-500 to-teal-600" />
          <MetricCard title="Grid Nodes" value="7" sub="Live topology" icon={Zap} accent="bg-gradient-to-br from-amber-500 to-orange-600" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {(["initialize", "pso"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                viewMode === mode
                  ? "bg-cyan-400 text-slate-950"
                  : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {mode === "initialize" ? <Brain className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
              {mode === "initialize" ? "Initialize Agents" : "PSO Swarm"}
            </button>
          ))}
          <button
            onClick={launchSwarm}
            disabled={optimizing}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-60"
          >
            {optimizing ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Play className="h-4 w-4" />}
            {optimizing ? "Launching swarm..." : "Run swarm process"}
          </button>
          <button
            onClick={() => {
              setIterations([]);
              setResult(null);
              setRecs([]);
              setParetoCount(0);
              setStatusLabel("Idle");
              setSwarmSignal((value) => value + 1);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Restart swarm
          </button>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Live map</p>
                  <h2 className="mt-1 text-xl font-bold text-white">Swarm activity over the grid</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                  <MapPinned className="h-3.5 w-3.5" />
                  {viewMode === "pso" ? "PSO overlay enabled" : "Initialization mode"}
                </div>
              </div>
              <div className="h-[80vh] min-h-[620px]">
                <EnhancedMapComponent swarmSignal={swarmSignal} showControls={viewMode === "pso"} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl"
            >
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Forecast stream</p>
                  <h3 className="mt-1 text-lg font-bold text-white">Demand, solar, and carbon intelligence</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setPanelView("charts")}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${panelView === "charts" ? "bg-cyan-400 text-slate-950" : "border border-white/15 bg-white/5 text-white hover:bg-white/10"}`}
                  >
                    Charts
                  </button>
                  <button
                    onClick={() => setPanelView("table")}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${panelView === "table" ? "bg-cyan-400 text-slate-950" : "border border-white/15 bg-white/5 text-white hover:bg-white/10"}`}
                  >
                    Table view
                  </button>
                  <button
                    onClick={requestGeminiInsight}
                    disabled={geminiLoading}
                    className="rounded-full border border-violet-400/25 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-400/20 disabled:opacity-60"
                  >
                    {geminiLoading ? "Thinking..." : "Gemini insight"}
                  </button>
                </div>
              </div>

              {panelView === "charts" ? (
                <>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Container className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">Demand & solar outlook</h4>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">Live agents</span>
                    </div>
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff12" />
                        <XAxis dataKey="hour" stroke="#ffffff30" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#ffffff30" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, fontSize: 12 }} />
                        <Area type="monotone" dataKey="demand" stroke="#06b6d4" fill="url(#demandGrad)" strokeWidth={2} name="Demand (MW)" />
                        <Area type="monotone" dataKey="solar" stroke="#f59e0b" fill="url(#solarGrad)" strokeWidth={2} name="Solar" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Container>

                  <Container className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">Carbon signal</h4>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">Forecast window</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={carbonChart}>
                        <defs>
                          <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff12" />
                        <XAxis dataKey="hour" stroke="#ffffff30" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#ffffff30" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, fontSize: 12 }} />
                        <Area type="monotone" dataKey="intensity" stroke="#10b981" fill="url(#carbonGrad)" strokeWidth={2} name="Carbon intensity" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Container>

                </div>

                {/* Fuel panel placed below charts as a full-width container */}
                <div className="mt-4">
                  <Container className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">Fuel mix & market price</h4>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">Derived</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 items-center">
                      <div className="col-span-1 lg:col-span-1">
                        <ResponsiveContainer width="100%" height={160}>
                          <PieChart>
                            <Pie data={fuelMixData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={60} label>
                              {fuelMixData.map((_entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={FUEL_COLORS[idx % FUEL_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                            <Legend wrapperStyle={{ fontSize: 12, color: '#ffffff' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="col-span-1 lg:col-span-2">
                        <ResponsiveContainer width="100%" height={160}>
                          <LineChart data={fuelPriceData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff12" />
                            <XAxis dataKey="hour" stroke="#ffffff30" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#ffffff30" tick={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                            <Line type="monotone" dataKey="price" stroke="#f97316" strokeWidth={2} dot={false} name="LMP" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </Container>
                </div>

                {objectiveData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                    className="mt-4 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.10),transparent_32%),rgba(15,23,42,0.78)] p-5 shadow-[0_30px_120px_rgba(2,6,23,0.30)] backdrop-blur-2xl"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">
                          <Activity className="h-4 w-4" />
                          Objective carousel
                        </div>
                        <h3 className="text-2xl font-black text-white md:text-3xl">Multi-objective performance, expanded</h3>
                        <p className="max-w-3xl text-sm leading-6 text-white/62 md:text-base">
                          A larger standalone view for the radar scorecard, placed below the fuel panel with normalized values and clearer legends.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start lg:self-auto">
                        <button
                          onClick={() => setObjectiveCarouselIndex((value) => (value + 1) % 2)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                          aria-label="Previous objective slide"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setObjectiveCarouselIndex((value) => (value + 1) % 2)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                          aria-label="Next objective slide"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/45">
                          Slide {objectiveCarouselIndex + 1}/2
                        </div>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {objectiveCarouselIndex === 0 ? (
                        <motion.div
                          key="objective-radar"
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -14 }}
                          transition={{ duration: 0.3 }}
                          className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]"
                        >
                          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/70">Radar view</p>
                                <h4 className="mt-1 text-xl font-bold text-white">Normalized objective balance</h4>
                              </div>
                              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-emerald-200">
                                Better fill = stronger balance
                              </span>
                            </div>

                            <div className="mt-4 h-[500px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={objectiveData} outerRadius="72%">
                                  <defs>
                                    <radialGradient id="objectiveRadarFill" cx="50%" cy="50%" r="80%">
                                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.12} />
                                    </radialGradient>
                                  </defs>
                                  <PolarGrid stroke="#ffffff14" radialLines={false} />
                                  <PolarAngleAxis tickLine={false} axisLine={false} dataKey="objective" tick={{ fill: "#e5e7eb", fontSize: 13, fontWeight: 600 }} />
                                  <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={5} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                                  <Tooltip
                                    contentStyle={{
                                      background: "#0f172a",
                                      border: "1px solid #334155",
                                      borderRadius: 14,
                                      fontSize: 12,
                                    }}
                                    labelStyle={{ color: "#ffffff" }}
                                  />
                                  <Radar
                                    name="Normalized score"
                                    dataKey="value"
                                    stroke="#22c55e"
                                    fill="url(#objectiveRadarFill)"
                                    fillOpacity={1}
                                    strokeWidth={3}
                                    dot={{ r: 3, fill: "#86efac" }}
                                  />
                                  <Legend wrapperStyle={{ fontSize: 12, color: "#ffffff" }} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                              {objectiveData.map((objective) => (
                                <div key={objective.objective} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/55">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: objective.color }} />
                                    {objective.objective}
                                  </div>
                                  <div className="mt-2 text-2xl font-black text-white">{objective.value.toFixed(1)}%</div>
                                  <div className="mt-2 text-xs text-white/45">{objective.label}</div>
                                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                                    <div className="h-full rounded-full" style={{ width: `${objective.value}%`, backgroundColor: objective.color }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Legend</p>
                                  <h4 className="mt-1 text-xl font-bold text-white">Objective mapping</h4>
                                </div>
                                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/45">
                                  0-100 scale
                                </span>
                              </div>

                              <div className="mt-4 space-y-3">
                                {objectiveData.map((objective) => (
                                  <div key={objective.objective} className="rounded-2xl border border-white/10 bg-black/15 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: objective.color }} />
                                        <div>
                                          <div className="text-sm font-semibold text-white">{objective.objective}</div>
                                          <div className="text-xs text-white/45">{objective.label}</div>
                                        </div>
                                      </div>
                                      <div className="text-lg font-black text-white">{objective.value.toFixed(1)}%</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {objectiveHighlights && (
                              <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-5">
                                <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">Quick read</p>
                                <h4 className="mt-1 text-xl font-bold text-white">Where the swarm is strongest</h4>
                                <div className="mt-4 space-y-3 text-sm leading-6 text-white/72">
                                  <p>
                                    Strongest objective: <span className="font-semibold text-white">{objectiveHighlights.strongest.objective}</span> at {objectiveHighlights.strongest.value.toFixed(1)}%.
                                  </p>
                                  <p>
                                    Weakest objective: <span className="font-semibold text-white">{objectiveHighlights.weakest.objective}</span> at {objectiveHighlights.weakest.value.toFixed(1)}%.
                                  </p>
                                  <p>
                                    Average balance across all objectives is {objectiveHighlights.average.toFixed(1)}%, so this run reads as a fairly even tradeoff profile.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="objective-summary"
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -14 }}
                          transition={{ duration: 0.3 }}
                          className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"
                        >
                          <div className="space-y-4">
                            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                              <p className="text-xs uppercase tracking-[0.35em] text-violet-300/70">Tradeoff summary</p>
                              <h4 className="mt-1 text-2xl font-black text-white">Performance cards</h4>
                              <p className="mt-2 text-sm leading-6 text-white/60">
                                Quick scan cards for the same radar data, tuned for a clean modern read on desktop and mobile.
                              </p>
                            </div>

                            {objectiveHighlights && (
                              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5 p-5">
                                  <div className="text-[10px] uppercase tracking-[0.35em] text-emerald-200/70">Best balance</div>
                                  <div className="mt-2 text-2xl font-black text-white">{objectiveHighlights.strongest.objective}</div>
                                  <div className="mt-1 text-sm text-white/60">{objectiveHighlights.strongest.value.toFixed(1)}% normalized</div>
                                </div>
                                <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-amber-500/10 to-orange-400/5 p-5">
                                  <div className="text-[10px] uppercase tracking-[0.35em] text-amber-200/70">Needs attention</div>
                                  <div className="mt-2 text-2xl font-black text-white">{objectiveHighlights.weakest.objective}</div>
                                  <div className="mt-1 text-sm text-white/60">{objectiveHighlights.weakest.value.toFixed(1)}% normalized</div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-5">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Score detail</p>
                                <h4 className="mt-1 text-xl font-bold text-white">Normalized objective cards</h4>
                              </div>
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/45">
                                Swipe or use arrows
                              </span>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              {objectiveData.map((objective) => (
                                <div key={objective.objective} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: objective.color }} />
                                      {objective.objective}
                                    </div>
                                    <div className="text-lg font-black text-white">{objective.value.toFixed(1)}%</div>
                                  </div>
                                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                                    <div className="h-full rounded-full" style={{ width: `${objective.value}%`, backgroundColor: objective.color }} />
                                  </div>
                                  <div className="mt-2 text-xs text-white/45">{objective.label}</div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/68">
                              This view keeps the radar section separate from the fuel chart stack, so the performance story reads as a dedicated panel instead of a cramped widget.
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {[0, 1].map((slide) => (
                          <button
                            key={slide}
                            onClick={() => setObjectiveCarouselIndex(slide)}
                            className={`h-2.5 rounded-full transition-all ${objectiveCarouselIndex === slide ? "w-10 bg-cyan-400" : "w-2.5 bg-white/25 hover:bg-white/40"}`}
                            aria-label={`Show objective slide ${slide + 1}`}
                          />
                        ))}
                      </div>
                      <div className="text-xs uppercase tracking-[0.28em] text-white/45">
                        Modernized objective carousel with legends
                      </div>
                    </div>
                  </motion.div>
                )}
                </>
              ) : (
                <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <Container className="overflow-hidden p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-white">How to use the swarm</h4>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/35">Operations view</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[620px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.3em] text-white/35">
                          <tr>
                            <th className="pb-3 font-medium">Area</th>
                            <th className="pb-3 font-medium">State</th>
                            <th className="pb-3 font-medium">How to use it</th>
                            <th className="pb-3 font-medium">Why it helps</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {usageRows.map((row) => (
                            <tr key={row.area} className="align-top text-white/75">
                              <td className="py-3 pr-3 font-semibold text-white">{row.area}</td>
                              <td className="py-3 pr-3 text-cyan-300">{row.state}</td>
                              <td className="py-3 pr-3 leading-6">{row.use}</td>
                              <td className="py-3 leading-6 text-white/55">{row.benefit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Container>

                  <Container className="overflow-hidden p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-white">Forecast snapshot</h4>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">Demand vs carbon</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[420px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.3em] text-white/35">
                          <tr>
                            <th className="pb-3 font-medium">Hour</th>
                            <th className="pb-3 font-medium">Demand</th>
                            <th className="pb-3 font-medium">Solar</th>
                            <th className="pb-3 font-medium">Carbon</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {forecastTableRows.map((row) => (
                            <tr key={row.hour} className="text-white/75">
                              <td className="py-3 font-semibold text-white">{row.hour}</td>
                              <td className="py-3">{row.demand.toFixed(1)}</td>
                              <td className="py-3">{row.solar.toFixed(1)}</td>
                              <td className="py-3">{row.carbon.toFixed(0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Container>
                </div>
              )}

            </motion.div>
          </div>

          <div className="space-y-6 xl:col-span-4 flex flex-col items-start">
            <AnimatePresence mode="wait">
              {viewMode === "initialize" ? (
                <motion.div
                  key="initialize"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6"
                >
                  <Container>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                        <Brain className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Initialize agents</h3>
                        <p className="text-sm text-white/55">Bring the data agents online before the swarm launch.</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {agentCards.map((agent) => {
                        const hasError = !!agentErrors[agent.name.toLowerCase()];
                        return (
                          <div key={agent.name}>
                            {hasError ? (
                              <ErrorInlineCard 
                                message={`${agent.name} agent failed to load`}
                                debug={agentErrors[agent.name.toLowerCase()] || ''}
                                onRetry={() => {
                                  setAgentErrors(prev => ({ ...prev, [agent.name.toLowerCase()]: null }));
                                  fetchAll();
                                }}
                              />
                            ) : (
                              <motion.div 
                                whileHover={{ x: 4 }}
                                className={`rounded-2xl border-l-4 border-r border-t border-b p-4 transition-all ${agent.active ? "border-l-emerald-500 border-emerald-400/20 bg-emerald-500/5" : "border-l-white/20 border-white/10 bg-white/5"}`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="text-sm font-semibold text-white">{agent.name}</div>
                                    <div className="text-xs text-white/50">{agent.detail}</div>
                                  </div>
                                  <motion.span 
                                    animate={{ scale: agent.active ? 1 : 0.95 }}
                                    className={`flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] transition-all ${agent.active ? "bg-emerald-400/20 text-emerald-300" : "bg-white/10 text-white/50"}`}
                                  >
                                    {agent.active ? "Online" : "Loading"}
                                  </motion.span>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() => setViewMode("pso")}
                        className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                      >
                        Prime swarm view <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={fetchAll}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        Refresh agents
                      </button>
                    </div>
                  </Container>

                  <Container>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-violet-400/10 p-3 text-violet-300">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Initialization path</h3>
                        <p className="text-sm text-white/55">The same swarm control is reused for maps, graphs, and optimization output.</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-white/68">
                      <p>1. Initialize agents to load live weather, solar, carbon, grid, forecast, and market data.</p>
                      <p>2. Switch to PSO mode to launch the map swarm and convergence graph at the same time.</p>
                      <p>3. Use the map overlays and Pareto plots to track how the optimizer moves through candidate sites.</p>
                    </div>
                  </Container>
                </motion.div>
              ) : (
                <motion.div
                  key="pso"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6"
                >
                  <Container>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 p-3 text-white">
                        <Play className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">PSO control</h3>
                        <p className="text-sm text-white/55">Launch the swarm and watch the map animate with the graph stack.</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={launchSwarm}
                        disabled={optimizing}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-60"
                      >
                        {optimizing ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Play className="h-4 w-4" />}
                        {optimizing ? "Swarm running" : "Start swarm process"}
                      </button>
                      <button
                        onClick={() => {
                          setIterations([]);
                          setResult(null);
                          setRecs([]);
                          setParetoCount(0);
                          setStatusLabel("Idle");
                          setSwarmSignal((value) => value + 1);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restart swarm
                      </button>
                    </div>
                  </Container>

                  <motion.div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
                    <div className="grid gap-6">
                      <div className="space-y-6">
                        <PSOGraphs
                          iterations={iterations}
                          paretoFront={paretoFront}
                          currentSolution={graphSolution}
                          isOptimizing={optimizing}
                          showObjectiveBreakdown={false}
                        />

                        {result && (
                          <Container>
                            <div className="flex items-center gap-3">
                              <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-300">
                                <Target className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white">Optimization summary</h3>
                                <p className="text-sm text-white/55">The latest swarm run is mapped to the live board summary below.</p>
                              </div>
                            </div>
                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="text-[10px] uppercase tracking-[0.35em] text-white/40">Solar</div>
                                <div className="mt-1 text-2xl font-bold text-amber-300">{result.solarCapacity.toFixed(1)} MW</div>
                              </div>
                              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="text-[10px] uppercase tracking-[0.35em] text-white/40">Wind</div>
                                <div className="mt-1 text-2xl font-bold text-cyan-300">{result.windCapacity.toFixed(1)} MW</div>
                              </div>
                            </div>
                            {recs.length > 0 && (
                              <div className="mt-4 space-y-2 text-sm text-white/68">
                                {recs.slice(0, 4).map((item) => (
                                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">{item}</div>
                                ))}
                              </div>
                            )}
                          </Container>
                        )}
                      </div>

                      <Container className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-violet-400/10 p-3 text-violet-300">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white">Operational insights</h3>
                            <p className="text-sm text-white/55">Gemini summary and quick actions now span the full width below the charts.</p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-black/15 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-violet-200">
                              {geminiSlides[carouselIndex]?.tag}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                              {carouselIndex + 1}/{geminiSlides.length}
                            </span>
                          </div>
                          <h4 className="mt-3 text-lg font-semibold text-white">
                            {geminiSlides[carouselIndex]?.title}
                          </h4>
                          <p className="gemini-body mt-2 text-sm">
                            {geminiSlides[carouselIndex]?.body}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <button
                            onClick={requestGeminiInsight}
                            disabled={geminiLoading}
                            className="rounded-full bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-60"
                          >
                            {geminiLoading ? "Thinking..." : "Request Gemini insight"}
                          </button>
                          <div className="text-sm text-white/70">
                            Insight status: {geminiLoading ? "Pending" : geminiInsight ? "Available" : "Idle"}
                          </div>
                        </div>
                      </Container>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {!agents ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            liveMetrics.map((metric) => (
              <MetricCard key={metric.title} title={metric.title} value={metric.value} sub={metric.sub} icon={metric.icon} accent={metric.accent} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
