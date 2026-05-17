"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { AlertCircle, Zap, Wind, Leaf, Shield, Battery } from "lucide-react";

interface ResearchGradeDashboardProps {
  latitude?: number;
  longitude?: number;
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

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Parallel fetch all APIs
        const [gridRes, forecastRes, resilienceRes, storageRes, marketRes] = await Promise.all([
          fetch("/api/grid-status?region=us-east&hours=24"),
          fetch(`/api/forecast?latitude=${latitude}&longitude=${longitude}&hours=168`),
          fetch(`/api/resilience?latitude=${latitude}&longitude=${longitude}`),
          fetch(`/api/storage?latitude=${latitude}&longitude=${longitude}&horizon_hours=24`),
          fetch("/api/market-data?region=PJM&horizon_hours=24"),
        ]);

        const [gridData, forecastData, resilienceData, storageData, marketData] = await Promise.all([
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
        setMarketData(marketData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 300000); // 5 minute refresh
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-400/30 border-t-blue-400 animate-spin"></div>
        <p className="text-sm text-gray-400">Loading research-grade data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700 overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: "📊" },
          { id: "forecasting", label: "AI Forecasting", icon: "🔮" },
          { id: "resilience", label: "Resilience & Hazards", icon: "🛡️" },
          { id: "storage", label: "Energy Storage", icon: "🔋" },
          { id: "markets", label: "Market Data", icon: "💹" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top Metrics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <MetricCard
              title="Resilience Score"
              value={resilience?.resilience.overall_score || "—"}
              unit="/100"
              icon={Shield}
              color="from-emerald-500 to-teal-600"
              trend={resilience?.resilience.risk_level}
            />
            <MetricCard
              title="Grid Demand"
              value={gridMetrics?.gridStatus.averageDemand.split(" ")[0] || "—"}
              unit="GW"
              icon={Zap}
              color="from-yellow-500 to-orange-600"
              trend="Peak expected 18:00-21:00"
            />
            <MetricCard
              title="Carbon Intensity"
              value={forecasts?.insights.highestCarbonHour || "—"}
              unit="Hour"
              icon={Leaf}
              color="from-green-500 to-teal-600"
              trend="Lowest at peak solar"
            />
            <MetricCard
              title="Storage Capacity"
              value={storage?.storage.total_capacity_mwh || "—"}
              unit="MWh"
              icon={Battery}
              color="from-purple-500 to-pink-600"
              trend={`${storage?.dispatch.schedule[0]?.expected_soc}% SOC`}
            />
          </motion.div>

          {/* Critical Alerts */}
          {resilience?.active_alerts && resilience.active_alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  {resilience.active_alerts.map((alert: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <p className="text-red-300 font-medium">{alert.message}</p>
                      <p className="text-gray-400 text-xs">{alert.duration_hours}h duration</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 24-Hour Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demand & Price */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900/40 border border-gray-700 rounded-lg p-4"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> 24-Hour Demand & Pricing
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={gridMetrics?.gridStatus.demandForecast || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="hour" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="demand"
                    fill="#fbbf24"
                    stroke="#fbbf24"
                    fillOpacity={0.3}
                    name="Demand (GW)"
                  />
                  <Line
                    type="monotone"
                    dataKey="voltage"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    name="Voltage (V)"
                    yAxisId="right"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Carbon & Renewable Mix */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900/40 border border-gray-700 rounded-lg p-4"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wind className="w-5 h-5 text-cyan-400" /> Renewable Generation Mix
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart
                  data={[
                    { hour: 0, solar: 0, wind: 2.1, hydro: 1.5, other: 0.8 },
                    { hour: 6, solar: 0.5, wind: 2.3, hydro: 1.5, other: 0.9 },
                    { hour: 12, solar: 4.2, wind: 1.8, hydro: 1.5, other: 0.8 },
                    { hour: 18, solar: 1.2, wind: 2.8, hydro: 1.5, other: 0.7 },
                    { hour: 24, solar: 0, wind: 3.2, hydro: 1.5, other: 0.9 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="hour" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="solar"
                    stackId="1"
                    stroke="#fbbf24"
                    fill="#fbbf24"
                    fillOpacity={0.7}
                    name="Solar"
                  />
                  <Area
                    type="monotone"
                    dataKey="wind"
                    stackId="1"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.7}
                    name="Wind"
                  />
                  <Area
                    type="monotone"
                    dataKey="hydro"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.7}
                    name="Hydro"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      )}

      {/* FORECASTING TAB */}
      {activeTab === "forecasting" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            {forecasts?.model && (
              <>
                <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Model Type</p>
                  <p className="text-lg font-semibold capitalize">
                    {forecasts.model.type}
                  </p>
                </div>
                <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Accuracy (MAPE)</p>
                  <p className="text-lg font-semibold text-green-400">
                    {forecasts.model.metrics.mape}%
                  </p>
                </div>
                <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Horizon</p>
                  <p className="text-lg font-semibold">
                    {forecasts.model.horizon_hours}h
                  </p>
                </div>
                <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Confidence</p>
                  <p className="text-lg font-semibold text-blue-400">95%</p>
                </div>
              </>
            )}
          </div>

          {/* Demand Forecast with CI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/40 border border-gray-700 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold mb-4">
              7-Day Demand Forecast with Confidence Intervals
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecasts?.forecasts.demand || []}>
                <defs>
                  <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="hour" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => value?.toFixed(2)}
                />
                <Area
                  type="monotone"
                  dataKey="upper_bound"
                  stroke="transparent"
                  fill="#0ea5e9"
                  fillOpacity={0.1}
                  name="Upper Bound (95%)"
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="#0ea5e9"
                  fill="url(#demandGradient)"
                  strokeWidth={2}
                  name="Forecast"
                />
                <Area
                  type="monotone"
                  dataKey="lower_bound"
                  stroke="transparent"
                  fill="#0ea5e9"
                  fillOpacity={0.1}
                  name="Lower Bound (95%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Multi-Source Forecasting */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Solar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900/40 border border-gray-700 rounded-lg p-4"
            >
              <h3 className="text-lg font-semibold mb-4 text-yellow-400">Solar Forecast</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={forecasts?.forecasts.solar || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="hour" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    stroke="#fbbf24"
                    fill="#fbbf24"
                    fillOpacity={0.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Wind */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900/40 border border-gray-700 rounded-lg p-4"
            >
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">Wind Forecast</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={forecasts?.forecasts.wind || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="hour" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Price */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900/40 border border-gray-700 rounded-lg p-4"
            >
              <h3 className="text-lg font-semibold mb-4 text-green-400">Price Forecast</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={forecasts?.forecasts.price || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="hour" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Key Insights */}
          {forecasts?.insights && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <InsightCard
                title="Demand Peak"
                value={`Hour ${forecasts.insights.demandPeakHour}`}
                icon="⚡"
              />
              <InsightCard
                title="Solar Peak Generation"
                value={`${forecasts.insights.solarPeakGeneration.toFixed(2)} GW`}
                icon="☀️"
              />
              <InsightCard
                title="Lowest Price Hour"
                value={`Hour ${forecasts.insights.lowestPriceHour}`}
                icon="💰"
              />
              <InsightCard
                title="Highest Carbon Hour"
                value={`Hour ${forecasts.insights.highestCarbonHour}`}
                icon="🌍"
              />
            </div>
          )}
        </div>
      )}

      {/* RESILIENCE TAB */}
      {activeTab === "resilience" && (
        <div className="space-y-6">
          {resilience && (
            <>
              {/* Hazard Assessment Radar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/40 border border-gray-700 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold mb-4">Hazard Assessment Profile</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart
                    data={[
                      {
                        name: "Earthquake",
                        value: resilience.resilience.hazard_assessment.earthquake,
                      },
                      {
                        name: "Hurricane",
                        value: resilience.resilience.hazard_assessment.hurricane,
                      },
                      {
                        name: "Flood",
                        value: resilience.resilience.hazard_assessment.flood,
                      },
                      {
                        name: "Severe Weather",
                        value: resilience.resilience.hazard_assessment.severe_weather,
                      },
                      {
                        name: "Wildfire",
                        value: resilience.resilience.hazard_assessment.wildfire,
                      },
                      {
                        name: "Grid Failure",
                        value: resilience.resilience.hazard_assessment.grid_failure,
                      },
                    ]}
                  >
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis dataKey="name" stroke="#94a3b8" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                    <Radar
                      name="Risk Level"
                      dataKey="value"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Vulnerabilities */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/40 border border-gray-700 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold mb-4">Infrastructure Vulnerabilities</h3>
                <div className="space-y-3">
                  {resilience.vulnerabilities.slice(0, 3).map((vuln: any, idx: number) => (
                    <div key={idx} className="bg-gray-800/50 rounded p-3 border-l-2 border-red-500">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-red-400">{vuln.title}</p>
                          <p className="text-xs text-gray-400">{vuln.recommendation}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-500">{vuln.severity}%</p>
                          <p className="text-xs text-gray-400">Severity</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Mitigation Strategies ROI */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/40 border border-gray-700 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Mitigation Strategies & ROI Analysis
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={resilience.mitigation_strategies.map((s: any) => ({
                      strategy: s.strategy.slice(0, 15) + "...",
                      roi: s.roi_percentage,
                      resilience: s.resilienceGain,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="strategy" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="roi" fill="#10b981" name="ROI %" />
                    <Bar dataKey="resilience" fill="#3b82f6" name="Resilience Gain %" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </>
          )}
        </div>
      )}

      {/* STORAGE TAB */}
      {activeTab === "storage" && (
        <div className="space-y-6">
          {storage && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Total Capacity</p>
                  <p className="text-2xl font-bold">
                    {storage.storage.total_capacity_mwh} MWh
                  </p>
                </div>
                <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Total Power Rating</p>
                  <p className="text-2xl font-bold">{storage.storage.total_power_mw} MW</p>
                </div>
                <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Weighted Efficiency</p>
                  <p className="text-2xl font-bold">
                    {(storage.storage.weighted_efficiency * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Dispatch Schedule */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/40 border border-gray-700 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold mb-4">24-Hour Optimal Dispatch</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={storage.dispatch.schedule}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="hour" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="charge_rate_mw"
                      fill="#22c55e"
                      name="Charge Rate (MW)"
                    />
                    <Bar
                      dataKey="discharge_rate_mw"
                      fill="#ef4444"
                      name="Discharge Rate (MW)"
                    />
                    <Line
                      type="monotone"
                      dataKey="arbitrage_revenue_usd"
                      stroke="#fbbf24"
                      yAxisId="right"
                      name="Arbitrage Revenue ($)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Cycling Strategies */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/40 border border-gray-700 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold mb-4">Cycling Strategy Comparison</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {storage.cycling_strategies.map((strategy: any, idx: number) => (
                    <div key={idx} className="bg-gray-800/50 rounded p-3 border-l-2 border-green-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-green-400">{strategy.strategy}</p>
                          <p className="text-xs text-gray-400">{strategy.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">
                            ${(strategy.net_benefit / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-gray-400">Net Benefit/year</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      )}

      {/* MARKETS TAB */}
      {activeTab === "markets" && (
        <div className="space-y-6">
          {marketData && (
            <>
              {/* Price Curves */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/40 border border-gray-700 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold mb-4">Day-Ahead & Forward Market Curve</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={marketData.forward_curve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="period" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any) => `$${value.toFixed(2)}/MWh`}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      dot={{ fill: "#0ea5e9", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Ancillary Services */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/40 border border-gray-700 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold mb-4">Ancillary Services Pricing</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(marketData.ancillary_services).map(([service, price]: any) => (
                    <div key={service} className="bg-gray-800/50 rounded p-3">
                      <p className="text-xs text-gray-400 capitalize">
                        {service.replace(/_/g, " ")}
                      </p>
                      <p className="text-xl font-bold text-purple-400">${price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Congestion Points */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/40 border border-gray-700 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold mb-4">Transmission Congestion Hotspots</h3>
                <div className="space-y-2">
                  {marketData.congestion_pricing.map((point: any, idx: number) => (
                    <div key={idx} className="bg-gray-800/50 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{point.location}</p>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-400">
                            ${point.current_marginal_congestion.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">Current</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded h-2">
                        <div
                          className="bg-red-500 h-2 rounded"
                          style={{ width: `${point.severity * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  unit: string;
  icon: any;
  color: string;
  trend?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${color} p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-gray-300 opacity-75">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-gray-200 opacity-75">{unit}</p>
        </div>
        <Icon className="w-6 h-6 opacity-50" />
      </div>
      {trend && <p className="text-xs text-gray-100 opacity-70">{trend}</p>}
    </motion.div>
  );
}

function InsightCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-3 text-center">
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xs text-gray-400 mb-1">{title}</p>
      <p className="text-sm font-bold text-blue-400">{value}</p>
    </div>
  );
}
