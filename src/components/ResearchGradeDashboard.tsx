"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  BarChart3,
  Battery,
  Download,
  Leaf,
  RefreshCcw,
  Shield,
  Sparkles,
  Sun,
  TrendingDown,
  TrendingUp,
  Wind,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import NavHeader from "@/components/nav-header";

const BG_IMAGE = "/nature-4k-pc-full-hd-wallpaper-preview.jpg";

const chartTooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.92)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "12px",
  backdropFilter: "blur(12px)",
  color: "#f8fafc",
};

const RENEWABLE_MIX = [
  { hour: 0, solar: 0, wind: 2.1, hydro: 1.5, other: 0.8 },
  { hour: 6, solar: 0.5, wind: 2.3, hydro: 1.5, other: 0.9 },
  { hour: 12, solar: 4.2, wind: 1.8, hydro: 1.5, other: 0.8 },
  { hour: 18, solar: 1.2, wind: 2.8, hydro: 1.5, other: 0.7 },
  { hour: 24, solar: 0, wind: 3.2, hydro: 1.5, other: 0.9 },
];

interface ResearchGradeDashboardProps {
  latitude?: number;
  longitude?: number;
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

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "forecasting", label: "AI Forecasting", icon: Sparkles },
  { id: "resilience", label: "Resilience", icon: Shield },
  { id: "storage", label: "Storage", icon: Battery },
  { id: "markets", label: "Markets", icon: TrendingUp },
] as const;

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen text-white">
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
    </div>
  );
}

function ChartPanel({
  title,
  icon: Icon,
  iconClassName = "text-cyan-400",
  children,
  className = "",
}: {
  title: string;
  icon?: LucideIcon;
  iconClassName?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-[1.5rem] border border-cyan-500/10 bg-gradient-to-br from-white/8 to-white/3 p-5 backdrop-blur-2xl transition hover:border-cyan-400/20 ${className}`}
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
  value: string | number;
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
      className="group cursor-pointer rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-white/8 to-white/3 p-6 backdrop-blur-2xl transition-all duration-300 hover:border-cyan-400/25 hover:shadow-lg hover:shadow-cyan-500/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-[0.35em] text-white/40">{title}</div>
          <div className="mt-2 text-3xl font-black text-white">{value}</div>
          <div className="mt-1.5 text-xs text-white/60">{sub}</div>
        </div>
        <div className={`flex-shrink-0 rounded-2xl p-3 ${accent} transition-all group-hover:shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function InsightCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-white/8 to-white/3 p-4 text-center backdrop-blur-2xl transition hover:border-cyan-400/25"
    >
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">{title}</p>
      <p className="mt-1 text-sm font-bold text-cyan-200">{value}</p>
    </motion.div>
  );
}

function ListRow({
  title,
  subtitle,
  value,
  valueLabel,
  accent = "border-cyan-400/30",
}: {
  title: string;
  subtitle?: string;
  value: string;
  valueLabel?: string;
  accent?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 border-l-2 bg-white/5 p-3 backdrop-blur-xl ${accent}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{title}</p>
          {subtitle && <p className="mt-0.5 text-xs text-white/50">{subtitle}</p>}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">{value}</p>
          {valueLabel && <p className="text-xs text-white/45">{valueLabel}</p>}
        </div>
      </div>
    </div>
  );
}

export default function ResearchGradeDashboard({
  latitude = 40.7128,
  longitude = -74.0060,
}: ResearchGradeDashboardProps) {
  const [gridMetrics, setGridMetrics] = useState<any>(null);
  const [forecasts, setForecasts] = useState<any>(null);
  const [resilience, setResilience] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [boardInsight, setBoardInsight] = useState<GeminiInsight | null>(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 10000);
    return () => clearInterval(timer);
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [gridRes, forecastRes, resilienceRes, storageRes, marketRes] = await Promise.all([
        fetch("/api/grid-status?region=us-east&hours=24"),
        fetch(`/api/forecast?latitude=${latitude}&longitude=${longitude}&hours=168`),
        fetch(`/api/resilience?latitude=${latitude}&longitude=${longitude}`),
        fetch(`/api/storage?latitude=${latitude}&longitude=${longitude}&horizon_hours=24`),
        fetch("/api/market-data?region=PJM&horizon_hours=24"),
      ]);

      const [gridData, forecastData, resilienceData, storageData, market] = await Promise.all([
        gridRes.json(),
        forecastRes.json(),
        resilienceRes.json(),
        storageRes.json(),
        marketRes.json(),
      ]);

      setGridMetrics(gridData);
      setForecasts(forecastData);
      setResilience(resilienceData);
      setStorage(storageData);
      setMarketData(market);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 300000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const buildBoardInsight = useCallback(async (): Promise<GeminiInsight> => {
    const resilienceScore = Number(resilience?.resilience?.overall_score ?? 0);
    const storageEfficiency = Number(storage?.storage?.weighted_efficiency ?? 0) * 100;
    const solarPeak = Number(forecasts?.insights?.solarPeakGeneration ?? 0);
    const gridDemand = Number((gridMetrics?.gridStatus?.averageDemand ?? "0").toString().split(" ")[0] ?? 0);
    const marketSnapshot = (marketData?.day_ahead_market?.prices || []).slice(0, 8);

    const fallback: GeminiInsight = {
      summary:
        "The analytics board is steady, with live grid demand, forecast signals, storage readiness, and resilience indicators aligned for operational planning.",
      verdict: resilienceScore >= 70 ? "Operationally strong" : "Monitor and tune",
      confidence: Math.max(55, Math.min(95, Math.round((resilienceScore + storageEfficiency + solarPeak) / 3))),
      strengths: [
        "Forecast and market views are wired into the same operational surface.",
        "Storage and resilience indicators are available for immediate comparison.",
        "The live board can explain what to do next without leaving the page.",
      ],
      risks: [
        gridDemand > 80
          ? "Grid demand is elevated and should be watched during peak windows."
          : "Demand pressure is moderate, but still worth tracking across the day.",
        storageEfficiency < 60
          ? "Storage efficiency is below ideal and may limit dispatch flexibility."
          : "Storage efficiency looks healthy for near-term planning.",
        resilienceScore < 70
          ? "Resilience should be hardened before extreme-event scenarios."
          : "Resilience is acceptable, though edge cases still need review.",
      ],
      actions: [
        {
          title: "Prioritize peak windows",
          detail: "Shift attention to the highest-demand hours and align storage or demand response accordingly.",
          impact: 5,
        },
        {
          title: "Review storage readiness",
          detail: "Confirm storage dispatch headroom and round-trip efficiency before the next operating cycle.",
          impact: storageEfficiency < 60 ? 5 : 4,
        },
        {
          title: "Use the forecast signal",
          detail: "Compare forecast demand, solar, and price movement before changing grid planning assumptions.",
          impact: 4,
        },
      ],
      metrics: [
        { label: "Resilience", value: `${resilienceScore.toFixed(1)}/100`, note: "Board health" },
        { label: "Storage", value: `${storageEfficiency.toFixed(1)}%`, note: "Dispatch readiness" },
        { label: "Solar peak", value: `${solarPeak.toFixed(2)} GW`, note: "Forecast guide" },
      ],
    };

    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result: {
            solarCapacity: solarPeak,
            windCapacity: Number(forecasts?.insights?.demandPeakHour ?? 0),
            cost: Number(marketSnapshot[0]?.total_lmp ?? marketSnapshot[0]?.price ?? 0),
            sustainability: resilienceScore,
            energyOutput: gridDemand,
            disasterResilience: resilienceScore,
            maintenanceFeasibility: storageEfficiency,
          },
          context: {
            board: "Analytics Board",
            location: { latitude, longitude },
            gridMetrics,
            forecasts: forecasts?.insights,
            resilience: resilience?.resilience,
            storage: storage?.storage,
            market: marketSnapshot,
            note: "Create a concise executive summary for the analytics board with operational actions, risks, and metrics.",
          },
        }),
      });

      const data = await response.json();
      const analysis = (data.analysis || null) as GeminiInsight | null;
      return analysis || { ...fallback, summary: data.suggestion || fallback.summary };
    } catch (error) {
      console.error("Gemini board summary failed:", error);
      return fallback;
    }
  }, [forecasts, gridMetrics, latitude, longitude, marketData, resilience, storage]);

  const handleExportExcel = useCallback(async () => {
    if (!gridMetrics || !forecasts || !resilience || !storage || !marketData) {
      setExportMessage("Board data is still loading. Try again in a moment.");
      return;
    }

    setExporting(true);
    setExportMessage(null);

    try {
      const insight = boardInsight ?? (await buildBoardInsight());
      setBoardInsight(insight);

      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const addSheet = (name: string, rows: Array<Array<string | number | null>>) => {
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), name);
      };

      addSheet("Gemini Summary", [
        ["Section", "Details"],
        ["Summary", insight.summary],
        ["Verdict", insight.verdict],
        ["Confidence", insight.confidence],
        ["Strength 1", insight.strengths[0] || ""],
        ["Strength 2", insight.strengths[1] || ""],
        ["Strength 3", insight.strengths[2] || ""],
        ["Risk 1", insight.risks[0] || ""],
        ["Risk 2", insight.risks[1] || ""],
        ["Risk 3", insight.risks[2] || ""],
      ]);

      addSheet("Action Plan", [
        ["Title", "Detail", "Impact"],
        ...insight.actions.map((action) => [action.title, action.detail, action.impact]),
      ]);

      addSheet("Key Metrics", [
        ["Metric", "Value", "Note"],
        ...insight.metrics.map((metric) => [metric.label, metric.value, metric.note]),
      ]);

      const forecastRows = (forecasts?.forecasts?.demand || []).slice(0, 24).map((entry: any, index: number) => [
        entry.hour ?? `${index}h`,
        Number(entry.forecast ?? 0),
        Number(forecasts?.forecasts?.solar?.[index]?.forecast ?? 0),
        Number(forecasts?.forecasts?.wind?.[index]?.forecast ?? 0),
        Number(
          (marketData?.day_ahead_market?.prices || [])[index]?.total_lmp ??
            (marketData?.day_ahead_market?.prices || [])[index]?.price ??
            0
        ),
      ]);

      addSheet("Forecasts", [["Hour", "Demand", "Solar", "Wind", "Price"], ...forecastRows]);

      const resilienceRows = [
        ["Overall Score", Number(resilience?.resilience?.overall_score ?? 0)],
        ["Risk Level", String(resilience?.resilience?.risk_level ?? "")],
        ["Active Alerts", Array.isArray(resilience?.active_alerts) ? resilience.active_alerts.length : 0],
        ...(resilience?.vulnerabilities || [])
          .slice(0, 5)
          .map((item: any) => [item.title, item.severity, item.recommendation]),
      ];
      addSheet("Resilience", [["Metric", "Value", "Detail"], ...resilienceRows]);

      addSheet("Storage", [
        ["Metric", "Value"],
        ["Total Capacity (MWh)", storage?.storage?.total_capacity_mwh ?? ""],
        ["Total Power (MW)", storage?.storage?.total_power_mw ?? ""],
        ["Weighted Efficiency", storage?.storage?.weighted_efficiency ?? ""],
      ]);

      const marketRows = (marketData?.day_ahead_market?.prices || []).slice(0, 24).map((item: any) => [
        item.hour ?? "",
        item.total_lmp ?? item.price ?? 0,
      ]);
      addSheet("Market", [["Hour", "LMP"], ...marketRows]);

      const blob = new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-board-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

      setExportMessage("Excel export generated with Gemini summary and board sheets.");
    } catch (error) {
      console.error("Export failed:", error);
      setExportMessage("Export failed. Try again after the board finishes loading.");
    } finally {
      setExporting(false);
    }
  }, [boardInsight, buildBoardInsight, forecasts, gridMetrics, marketData, resilience, storage]);

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
          <motion.div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400" />
          <p className="text-sm uppercase tracking-[0.35em] text-white/50">Loading analytics board</p>
        </div>
      </PageShell>
    );
  }

  const demandValue = gridMetrics?.gridStatus?.averageDemand?.split?.(" ")?.[0] ?? "â€”";
  const socTrend = storage?.dispatch?.schedule?.[0]?.expected_soc
    ? `${storage.dispatch.schedule[0].expected_soc}% SOC`
    : "Dispatch schedule live";

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
              Research analytics
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
                Grid intelligence board
              </h1>
              <p className="max-w-3xl text-base leading-7 text-white/68 md:text-lg">
                Live demand, forecasts, storage, resilience, and market signals â€” unified in one glass surface with Gemini summaries and Excel export.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/50 backdrop-blur-xl">
              Last sync Â· <span className="font-semibold text-cyan-200">{time || "â€”"}</span>
            </div>
            <button
              type="button"
              onClick={fetchAllData}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/10"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void handleExportExcel()}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exportingâ€¦" : "Export Excel"}
            </button>
          </div>
        </div>
      </motion.div>

      {exportMessage && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100/90 backdrop-blur-xl"
        >
          {exportMessage}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25"
                  : "border border-white/10 bg-white/5 text-white/60 backdrop-blur-xl hover:border-white/20 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-6">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Resilience Score"
                value={resilience?.resilience?.overall_score ?? "â€”"}
                sub={`${resilience?.resilience?.risk_level ?? "Risk profile"} Â· /100`}
                icon={Shield}
                accent="bg-gradient-to-br from-emerald-500 to-teal-600"
              />
              <MetricCard
                title="Grid Demand"
                value={demandValue}
                sub="GW Â· Peak expected 18:00â€“21:00"
                icon={Zap}
                accent="bg-gradient-to-br from-amber-500 to-orange-600"
              />
              <MetricCard
                title="Carbon Peak Hour"
                value={forecasts?.insights?.highestCarbonHour ?? "â€”"}
                sub="Hour index Â· Lowest at peak solar"
                icon={Leaf}
                accent="bg-gradient-to-br from-green-500 to-teal-600"
              />
              <MetricCard
                title="Storage Capacity"
                value={storage?.storage?.total_capacity_mwh ?? "â€”"}
                sub={`MWh Â· ${socTrend}`}
                icon={Battery}
                accent="bg-gradient-to-br from-violet-500 to-fuchsia-600"
              />
            </div>

            {resilience?.active_alerts?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[1.5rem] border border-red-400/25 bg-gradient-to-r from-red-500/10 to-orange-500/10 p-5 backdrop-blur-2xl"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                  <div className="space-y-2">
                    {resilience.active_alerts.map((alert: any, idx: number) => (
                      <div key={idx} className="text-sm">
                        <p className="font-medium text-red-300">{alert.message}</p>
                        <p className="text-xs text-white/50">{alert.duration_hours}h duration</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartPanel title="24-Hour Demand & Pricing" icon={Zap} iconClassName="text-amber-400">
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={gridMetrics?.gridStatus?.demandForecast || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend />
                    <Area type="monotone" dataKey="demand" fill="#fbbf24" stroke="#fbbf24" fillOpacity={0.3} name="Demand (GW)" />
                    <Line type="monotone" dataKey="voltage" stroke="#0ea5e9" strokeWidth={2} name="Voltage (V)" yAxisId="right" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="Renewable Generation Mix" icon={Wind} iconClassName="text-cyan-400">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={RENEWABLE_MIX}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area type="monotone" dataKey="solar" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.7} name="Solar" />
                    <Area type="monotone" dataKey="wind" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.7} name="Wind" />
                    <Area type="monotone" dataKey="hydro" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.7} name="Hydro" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartPanel>
            </div>
          </div>
        )}

        {/* FORECASTING */}
        {activeTab === "forecasting" && (
          <motion.div className="space-y-6">
            {forecasts?.model && (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "Model Type", value: forecasts.model.type, accent: "" },
                  { label: "Accuracy (MAPE)", value: `${forecasts.model.metrics.mape}%`, accent: "text-emerald-400" },
                  { label: "Horizon", value: `${forecasts.model.horizon_hours}h`, accent: "" },
                  { label: "Confidence", value: "95%", accent: "text-cyan-400" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-white/8 to-white/3 p-4 backdrop-blur-2xl"
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">{stat.label}</p>
                    <p className={`mt-1 text-lg font-semibold capitalize text-white ${stat.accent}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            <ChartPanel title="7-Day Demand Forecast with Confidence Intervals">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={forecasts?.forecasts?.demand || []}>
                  <defs>
                    <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => value?.toFixed?.(2)} />
                  <Area type="monotone" dataKey="upper_bound" stroke="transparent" fill="#0ea5e9" fillOpacity={0.1} name="Upper (95%)" />
                  <Area type="monotone" dataKey="forecast" stroke="#0ea5e9" fill="url(#demandGradient)" strokeWidth={2} name="Forecast" />
                  <Area type="monotone" dataKey="lower_bound" stroke="transparent" fill="#0ea5e9" fillOpacity={0.1} name="Lower (95%)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartPanel>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <ChartPanel title="Solar Forecast" icon={Sun} iconClassName="text-amber-400">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={forecasts?.forecasts?.solar || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area type="monotone" dataKey="forecast" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="Wind Forecast" icon={Wind} iconClassName="text-cyan-400">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={forecasts?.forecasts?.wind || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area type="monotone" dataKey="forecast" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="Price Forecast" icon={TrendingDown} iconClassName="text-emerald-400">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={forecasts?.forecasts?.price || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="forecast" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>
            </div>

            {forecasts?.insights && (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <InsightCard title="Demand Peak" value={`Hour ${forecasts.insights.demandPeakHour}`} icon={Zap} />
                <InsightCard title="Solar Peak" value={`${forecasts.insights.solarPeakGeneration.toFixed(2)} GW`} icon={Sun} />
                <InsightCard title="Lowest Price" value={`Hour ${forecasts.insights.lowestPriceHour}`} icon={TrendingDown} />
                <InsightCard title="Highest Carbon" value={`Hour ${forecasts.insights.highestCarbonHour}`} icon={Leaf} />
              </div>
            )}
          </motion.div>
        )}

        {/* RESILIENCE */}
        {activeTab === "resilience" && resilience && (
          <motion.div className="space-y-6">
            <ChartPanel title="Hazard Assessment Profile" icon={Shield} iconClassName="text-red-400">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart
                  data={[
                    { name: "Earthquake", value: resilience.resilience.hazard_assessment.earthquake },
                    { name: "Hurricane", value: resilience.resilience.hazard_assessment.hurricane },
                    { name: "Flood", value: resilience.resilience.hazard_assessment.flood },
                    { name: "Severe Weather", value: resilience.resilience.hazard_assessment.severe_weather },
                    { name: "Wildfire", value: resilience.resilience.hazard_assessment.wildfire },
                    { name: "Grid Failure", value: resilience.resilience.hazard_assessment.grid_failure },
                  ]}
                >
                  <PolarGrid stroke="rgba(148,163,184,0.3)" />
                  <PolarAngleAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                  <Radar name="Risk Level" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.45} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Infrastructure Vulnerabilities" icon={AlertCircle} iconClassName="text-orange-400">
              <div className="space-y-3">
                {resilience.vulnerabilities.slice(0, 3).map((vuln: any, idx: number) => (
                  <ListRow
                    key={idx}
                    title={vuln.title}
                    subtitle={vuln.recommendation}
                    value={`${vuln.severity}%`}
                    valueLabel="Severity"
                    accent="border-l-red-500"
                  />
                ))}
              </div>
            </ChartPanel>

            <ChartPanel title="Mitigation Strategies & ROI Analysis">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={resilience.mitigation_strategies.map((s: any) => ({
                    strategy: `${s.strategy.slice(0, 15)}â€¦`,
                    roi: s.roi_percentage,
                    resilience: s.resilienceGain,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="strategy" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Bar dataKey="roi" fill="#10b981" name="ROI %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resilience" fill="#3b82f6" name="Resilience Gain %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          </motion.div>
        )}

        {/* STORAGE */}
        {activeTab === "storage" && storage && (
          <motion.div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { label: "Total Capacity", value: `${storage.storage.total_capacity_mwh} MWh` },
                { label: "Power Rating", value: `${storage.storage.total_power_mw} MW` },
                { label: "Efficiency", value: `${(storage.storage.weighted_efficiency * 100).toFixed(1)}%` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.5rem] border border-cyan-500/10 bg-gradient-to-br from-white/8 to-white/3 p-5 backdrop-blur-2xl"
                >
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">{item.label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <ChartPanel title="24-Hour Optimal Dispatch" icon={Battery} iconClassName="text-violet-400">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={storage.dispatch.schedule}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Bar dataKey="charge_rate_mw" fill="#22c55e" name="Charge (MW)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="discharge_rate_mw" fill="#ef4444" name="Discharge (MW)" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="arbitrage_revenue_usd" stroke="#fbbf24" yAxisId="right" name="Arbitrage ($)" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Cycling Strategy Comparison">
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {storage.cycling_strategies.map((strategy: any, idx: number) => (
                  <ListRow
                    key={idx}
                    title={strategy.strategy}
                    subtitle={strategy.description}
                    value={`$${(strategy.net_benefit / 1000).toFixed(0)}K`}
                    valueLabel="Net benefit / year"
                    accent="border-l-emerald-500"
                  />
                ))}
              </div>
            </ChartPanel>
          </motion.div>
        )}

        {/* MARKETS */}
        {activeTab === "markets" && marketData && (
          <motion.div className="space-y-6">
            <ChartPanel title="Day-Ahead & Forward Market Curve" icon={TrendingUp}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={marketData.forward_curve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => `$${value.toFixed(2)}/MWh`} />
                  <Line type="monotone" dataKey="price" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: "#0ea5e9", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Ancillary Services Pricing">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {Object.entries(marketData.ancillary_services).map(([service, price]: [string, any]) => (
                  <div
                    key={service}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition hover:border-violet-400/30"
                  >
                    <p className="text-xs capitalize text-white/50">{service.replace(/_/g, " ")}</p>
                    <p className="text-xl font-bold text-violet-300">${Number(price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </ChartPanel>

            <ChartPanel title="Transmission Congestion Hotspots" icon={AlertCircle} iconClassName="text-red-400">
              <div className="space-y-3">
                {marketData.congestion_pricing.map((point: any, idx: number) => (
                  <motion.div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-semibold text-white">{point.location}</p>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-400">
                          ${point.current_marginal_congestion.toFixed(2)}
                        </p>
                        <p className="text-xs text-white/45">Current</p>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
                        style={{ width: `${point.severity * 100}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </ChartPanel>
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}
