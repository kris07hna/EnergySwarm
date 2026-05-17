"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from "recharts";
import { TrendingUp, AlertCircle, Zap, Wind, Leaf } from "lucide-react";

interface GridData {
  carbonIntensity: number;
  electricityPrice: number;
  demand: number;
  capacity: number;
  reliability: number;
}

export default function DataDashboard() {
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [demandForecast, setDemandForecast] = useState<any[]>([]);
  const [priceForecast, setPriceForecast] = useState<any[]>([]);
  const [carbonForecast, setCarbonForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch grid status
        const gridRes = await fetch("/api/grid-status?region=us-east&hours=24");
        const gridJson = await gridRes.json();

        if (gridJson.gridStatus && gridJson.gridStatus.demandForecast) {
          const forecast = gridJson.gridStatus.demandForecast;
          setDemandForecast(forecast);

          const firstHour = forecast[0];
          setGridData({
            carbonIntensity: 420 + Math.random() * 80,
            electricityPrice:
              65 + Math.random() * 30,
            demand: parseFloat(firstHour.demand) || 75,
            capacity: 120,
            reliability: parseFloat(
              gridJson.gridStatus.reliability
            ),
          });
        }

        // Fetch electricity prices
        const pricesRes = await fetch("/api/prices?region=US");
        const pricesJson = await pricesRes.json();
        if (pricesJson.electricityPrices) {
          setPriceForecast(pricesJson.electricityPrices.hourlyPrices);
        }

        // Fetch carbon intensity
        const carbonRes = await fetch("/api/carbon?latitude=40&longitude=-95");
        const carbonJson = await carbonRes.json();
        if (carbonJson.carbonIntensity) {
          setCarbonForecast(carbonJson.carbonIntensity.forecast);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 rounded-full border-4 border-blue-400/30 border-t-blue-400 animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <MetricCard
          title="Carbon Intensity"
          value={gridData?.carbonIntensity.toFixed(0) || "—"}
          unit="g CO₂/kWh"
          icon={Leaf}
          color="from-green-500 to-teal-600"
          trend="↓ 12%"
        />
        <MetricCard
          title="Electricity Price"
          value={gridData?.electricityPrice.toFixed(2) || "—"}
          unit="$/MWh"
          icon={TrendingUp}
          color="from-blue-500 to-cyan-600"
          trend="↑ 5%"
        />
        <MetricCard
          title="Grid Demand"
          value={gridData?.demand.toFixed(1) || "—"}
          unit="GW"
          icon={Zap}
          color="from-yellow-500 to-orange-600"
          trend="Normal"
        />
        <MetricCard
          title="Capacity"
          value={gridData?.capacity?.toString() || "—"}
          unit="GW"
          icon={Wind}
          color="from-cyan-500 to-blue-600"
          trend={`${((gridData ? (gridData.demand / gridData.capacity) * 100 : 0)).toFixed(0)}% used`}
        />
        <MetricCard
          title="Reliability"
          value={gridData?.reliability.toFixed(1) || "—"}
          unit="%"
          icon={AlertCircle}
          color="from-purple-500 to-pink-600"
          trend="Stable"
        />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand Forecast */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">24-Hour Demand Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={demandForecast}>
              <defs>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
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
                }}
              />
              <Area
                type="monotone"
                dataKey="demand"
                stroke="#0ea5e9"
                fillOpacity={1}
                fill="url(#colorDemand)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Price Forecast */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">
            Hourly Electricity Prices
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="hour" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                }}
              />
              <Bar dataKey="price" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Carbon Intensity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-lg font-semibold mb-4">Carbon Intensity Forecast</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={carbonForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="hour" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="intensity"
              stroke="#10b981"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
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
  value: string;
  unit: string;
  icon: any;
  color: string;
  trend: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className="card group hover:border-blue-500/50 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-xs font-semibold text-green-400">{trend}</span>
      </div>
      <h3 className="text-xs text-slate-400 mb-1 uppercase tracking-wide">
        {title}
      </h3>
      <div className="flex items-baseline gap-1">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-slate-400">{unit}</p>
      </div>
    </motion.div>
  );
}
