"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Sun, Wind, Zap, MapPin, Compass, Globe, Layers, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import NavHeader from "@/components/nav-header";

const EnhancedMapComponent = dynamic(
  () => import("@/components/EnhancedMapComponent"),
  { ssr: false }
);

const BG_IMAGE = "/nature-4k-pc-full-hd-wallpaper-preview.jpg";

function GlassPanel({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className={`rounded-[1.5rem] border border-cyan-500/10 bg-gradient-to-br from-white/8 to-white/3 p-5 backdrop-blur-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ResourceCard({
  title,
  subtitle,
  icon: Icon,
  accent,
  data,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
  data: { label: string; value: string }[];
}) {
  return (
    <GlassPanel>
      <div className="flex items-center gap-3 mb-4">
        <div className={`rounded-xl p-2.5 ${accent}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-[11px] text-white/45">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between text-sm">
            <span className="text-white/50">{d.label}</span>
            <span className="font-medium text-white">{d.value}</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

export default function MapsPage() {
  const [time, setTime] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "analysis" | "export">("overview");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 10000);
    return () => clearInterval(t);
  }, []);

  const tabs = [
    { id: "overview" as const, label: "Map Overview", icon: Globe },
    { id: "analysis" as const, label: "Data Analysis", icon: Info },
    { id: "export" as const, label: "Export Tools", icon: Layers },
  ];

  return (
    <motion.div className="relative min-h-screen text-white">
      {/* Background */}
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
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)]"
        aria-hidden
      />

      {/* Header */}
      <header className="relative z-50 flex justify-center p-5">
        <NavHeader />
      </header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto max-w-[1680px] px-4 pb-16 pt-2 lg:px-6"
      >
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.32)] backdrop-blur-2xl lg:p-8"
        >
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.35em] text-emerald-200/90">
              <Compass className="h-4 w-4" />
              Geospatial Intelligence · {time || "—"}
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
              Energy{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
                Resource Maps
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-base leading-7 text-white/68 md:text-lg">
              Research-grade geospatial analysis for renewable energy site selection, resource assessment,
              and grid infrastructure planning using real-time data from NASA POWER, Open-Meteo, and OpenStreetMap.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 flex justify-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25"
                    : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-6 overflow-hidden rounded-[1.5rem] border border-cyan-500/10 bg-gradient-to-br from-white/8 to-white/3 p-0 backdrop-blur-2xl shadow-[0_20px_80px_rgba(2,6,23,0.35)]"
        >
          <div className="h-[700px]">
            <EnhancedMapComponent />
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <ResourceCard
              title="Solar Potential"
              subtitle="High irradiance zones"
              icon={Sun}
              accent="bg-gradient-to-br from-yellow-500 to-orange-600"
              data={[
                { label: "Peak Irradiance", value: "5.5–7.5 kWh/m²/day" },
                { label: "Capacity Factor", value: "18–25%" },
                { label: "Best Regions", value: "Southwest US" },
              ]}
            />
            <ResourceCard
              title="Wind Resources"
              subtitle="Optimal wind corridors"
              icon={Wind}
              accent="bg-gradient-to-br from-cyan-500 to-blue-600"
              data={[
                { label: "Wind Speed", value: "6–11 m/s" },
                { label: "Capacity Factor", value: "30–45%" },
                { label: "Best Regions", value: "Great Plains" },
              ]}
            />
            <ResourceCard
              title="Grid Infrastructure"
              subtitle="Transmission network"
              icon={Zap}
              accent="bg-gradient-to-br from-purple-500 to-pink-600"
              data={[
                { label: "Substations", value: "345–765 kV" },
                { label: "Capacity", value: "500–2000 MW" },
                { label: "Coverage", value: "National Grid" },
              ]}
            />
            <ResourceCard
              title="Site Selection"
              subtitle="Optimal deployment"
              icon={MapPin}
              accent="bg-gradient-to-br from-green-500 to-emerald-600"
              data={[
                { label: "Criteria", value: "Multi-objective" },
                { label: "Analysis", value: "GIS-based" },
                { label: "Accuracy", value: "Research-grade" },
              ]}
            />
          </motion.div>
        )}

        {activeTab === "analysis" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 grid gap-6 lg:grid-cols-2"
          >
            <GlassPanel delay={0.1}>
              <h3 className="mb-4 text-lg font-semibold text-white">Data Sources & Methodology</h3>
              <div className="space-y-4 text-sm text-white/70">
                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">Solar Irradiance Data</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>NASA POWER API — Global solar radiation database</li>
                    <li>Temporal resolution: Monthly averages (2023–2024)</li>
                    <li>Spatial resolution: 0.5° × 0.5° grid</li>
                    <li>Parameters: GHI, DNI, DHI, clearness index</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-2">Wind Resource Assessment</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Open-Meteo API — Real-time weather data</li>
                    <li>Wind speed at 10 m and 100 m heights</li>
                    <li>Wind direction and gust analysis</li>
                    <li>Capacity factor estimation using Weibull distribution</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-violet-400 mb-2">Geospatial Analysis</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>OpenStreetMap — Infrastructure mapping</li>
                    <li>Terrain analysis using elevation models</li>
                    <li>Land use classification and constraints</li>
                    <li>Distance to grid connection points</li>
                  </ul>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel delay={0.2}>
              <h3 className="mb-4 text-lg font-semibold text-white">Site Selection Criteria</h3>
              <div className="space-y-4 text-sm text-white/70">
                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">Technical Factors</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Resource availability (solar/wind intensity)</li>
                    <li>Grid connection proximity (&lt;50 km preferred)</li>
                    <li>Terrain suitability (slope &lt;5° for solar)</li>
                    <li>Land area requirements (min 10 hectares)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-2">Economic Factors</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Levelized Cost of Energy (LCOE) optimization</li>
                    <li>Transmission infrastructure costs</li>
                    <li>Land acquisition and permitting</li>
                    <li>Operations & maintenance accessibility</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-400 mb-2">Environmental Constraints</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Protected areas and wildlife habitats</li>
                    <li>Water resource availability</li>
                    <li>Visual impact and community acceptance</li>
                    <li>Climate resilience and disaster risk</li>
                  </ul>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {activeTab === "export" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 space-y-6"
          >
            <GlassPanel>
              <h3 className="mb-5 text-lg font-semibold text-white">Export & Integration Tools</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <button className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:bg-white/10">
                  <div className="rounded-xl bg-blue-500/20 p-3">
                    <Zap className="h-7 w-7 text-blue-400" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-white mb-1">Export Map Data</h4>
                    <p className="text-xs text-white/45">Download GeoJSON, KML, or CSV formats</p>
                  </div>
                </button>
                <button className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:bg-white/10">
                  <div className="rounded-xl bg-emerald-500/20 p-3">
                    <Globe className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-white mb-1">Share Analysis</h4>
                    <p className="text-xs text-white/45">Generate shareable reports and links</p>
                  </div>
                </button>
                <button className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:bg-white/10">
                  <div className="rounded-xl bg-violet-500/20 p-3">
                    <Layers className="h-7 w-7 text-violet-400" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-white mb-1">API Integration</h4>
                    <p className="text-xs text-white/45">Connect to external GIS systems</p>
                  </div>
                </button>
              </div>
            </GlassPanel>

            <GlassPanel delay={0.15}>
              <h3 className="mb-3 text-sm font-semibold text-white/50 uppercase tracking-[0.3em]">Academic References</h3>
              <div className="space-y-1 text-xs text-white/50">
                <p>1. Longley, P.A. et al. (2015). Geographic Information Science & Systems. 4th ed. Wiley.</p>
                <p>2. NREL (2023). Renewable Energy Data Book. National Renewable Energy Laboratory.</p>
                <p>3. IEA (2024). World Energy Outlook. International Energy Agency.</p>
                <p>4. Malczewski, J. (2006). GIS-based multicriteria decision analysis. Geography Compass.</p>
                <p>5. Hoogwijk, M. et al. (2004). Assessment of global renewable energy potential. Energy Policy.</p>
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center text-sm text-white/40"
        >
          <p>Data sources: NASA POWER API · Open-Meteo · OpenStreetMap · Research-grade analysis</p>
          <p className="mt-1">Click anywhere on the map to analyze location-specific renewable energy potential</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
