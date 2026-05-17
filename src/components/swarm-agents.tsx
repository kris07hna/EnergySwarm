"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import NavHeader from "@/components/nav-header";
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";

const GridMap = dynamic(() => import("leaflet").then(() => {
  const L = require("leaflet");
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  return ({ center, zoom }: { center: [number, number], zoom: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const instance = useRef<any>(null);

    useEffect(() => {
      if (ref.current && !instance.current) {
        instance.current = L.map(ref.current, { center, zoom, zoomControl: false });
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        }).addTo(instance.current);
        gridNodes.forEach((n) => {
          L.circleMarker([n.lat, n.lon], { radius: n.size, color: n.color, fillColor: n.color, fillOpacity: 0.6 }).addTo(instance.current);
        });
      }
      return () => { if (instance.current) { instance.current.remove(); instance.current = null; } };
    }, []);

    return <div ref={ref} className="h-full w-full rounded-xl" />;
  };
}), { ssr: false, loading: () => <div className="h-60 rounded-xl bg-white/5 animate-pulse flex items-center justify-center text-white/30">Loading Map...</div> });

interface GridNode { lat: number; lon: number; size: number; color: string; name: string }

const gridNodes: GridNode[] = [
  { lat: 40.7580, lon: -73.9855, size: 15, color: "#06b6d4", name: "Manhattan Hub" },
  { lat: 40.6892, lon: -74.0445, size: 12, color: "#8b5cf6", name: "Brooklyn Node" },
  { lat: 40.8448, lon: -73.8648, size: 10, color: "#10b981", name: "Bronx Station" },
  { lat: 40.5795, lon: -74.1502, size: 8, color: "#f59e0b", name: "Staten Island" },
  { lat: 40.7282, lon: -73.7949, size: 14, color: "#ef4444", name: "Queens Core" },
  { lat: 40.6501, lon: -73.9496, size: 11, color: "#ec4899", name: "Flatbush Unit" },
  { lat: 40.8116, lon: -73.9465, size: 9, color: "#14b8a6", name: "Harlem Zone" },
];

const Container = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 p-5 backdrop-blur-xl shadow-lg shadow-cyan-500/5 ${className}`}>{children}</div>
);

interface ChatMessage { role: "user" | "assistant"; content: string; timestamp?: string }

export default function SwarmAgents() {
  const [mounted, setMounted] = useState(false);
  const [timeStr, setTimeStr] = useState("");
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Swarm Intelligence System v2.0 online. I coordinate 6 specialized agents across the energy grid. How can I assist you today?", timestamp: "" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); setTimeStr(new Date().toLocaleTimeString()); }, []);
  useEffect(() => { if (!mounted) return; const timer = setInterval(() => setTimeStr(new Date().toLocaleTimeString()), 1000); return () => clearInterval(timer); }, [mounted]);

  const fetchData = useCallback(async () => {
    const lat = "40.7128", lon = "-74.0060";
    const [m, f] = await Promise.all([
      fetch(`/api/grid-status?region=ny&hours=24`).then(r => r.json()).catch(() => null),
      fetch(`/api/forecast?latitude=${lat}&longitude=${lon}&hours=24`).then(r => r.json()).catch(() => null),
    ]);
    setMetrics(m);
    setForecast(f);
  }, []);

  useEffect(() => { if (mounted) fetchData(); }, [mounted, fetchData]);

  const runOptimization = async () => {
    setOptimizing(true);
    try {
      const res = await fetch("/api/optimize", { method: "POST" });
      const data = await res.json();
      setOptimizeResult(data);
      setChatMessages(prev => [...prev, { role: "assistant", content: `Optimization complete! Found ${data.pareto_count} Pareto-optimal solutions. Solar: ${data.result.solarCapacity.toFixed(1)}MW, Wind: ${data.result.windCapacity.toFixed(1)}MW.`, timestamp: new Date().toLocaleTimeString() }]);
    } catch {}
    setOptimizing(false);
  };

  const getSmartFallback = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes("status") || lower.includes("grid") || lower.includes("demand")) {
      return `Current grid: ${metrics?.gridStatus?.averageDemand || '—'} demand, ${metrics?.gridStatus?.reliability || '—'} reliability. ${optimizeResult ? `Latest optimization: ${optimizeResult.result.solarCapacity.toFixed(0)}MW solar, ${optimizeResult.result.windCapacity.toFixed(0)}MW wind.` : 'Run optimization for detailed analysis.'}`;
    }
    if (lower.includes("optimize") || lower.includes("recommend")) {
      return optimizeResult ? `Optimization complete! Solar: ${optimizeResult.result.solarCapacity.toFixed(1)}MW, Wind: ${optimizeResult.result.windCapacity.toFixed(1)}MW, Cost: $${optimizeResult.result.cost.toFixed(1)}M. Pareto solutions: ${optimizeResult.pareto_count}.` : "Click 'Run MOPSO' to generate optimization recommendations.";
    }
    if (lower.includes("solar") || lower.includes("wind") || lower.includes("renewable")) {
      return "NY region solar irradiance is estimated at 5.2 kWh/m² with 20.8% capacity factor. Run optimization to get optimal solar/wind mix for your grid.";
    }
    if (lower.includes("help") || lower.includes("what")) {
      return "I can help with: grid status, optimization results, solar/wind forecasts, carbon intensity, and strategic recommendations. Ask me anything!";
    }
    return "Swarm system ready. Try: 'What's the grid status?', 'Run optimization', 'Show recommendations', or 'Tell me about solar capacity'.";
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg, timestamp: new Date().toLocaleTimeString() }]);
    setChatLoading(true);
    try {
      const prompt = `You are a SwarmGrid AI energy grid assistant. User says: "${userMsg}". Current grid metrics: ${metrics?.gridStatus ? `Demand ${metrics.gridStatus.averageDemand}, Reliability ${metrics.gridStatus.reliability}` : 'Loading...'}. Optimize result: ${optimizeResult ? `Solar ${optimizeResult.result.solarCapacity}MW, Wind ${optimizeResult.result.windCapacity}MW, Cost $${optimizeResult.result.cost}M` : 'Run optimization first'}. Provide a helpful response in 2-3 sentences.`;
      const res = await fetch("/api/suggest", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: optimizeResult?.result || { solarCapacity: 0, windCapacity: 0, cost: 0, sustainability: 0, energyOutput: 0, disasterResilience: 0, maintenanceFeasibility: 0 }, context: prompt })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.suggestion || getSmartFallback(userMsg), timestamp: new Date().toLocaleTimeString() }]);
    } catch { setChatMessages(prev => [...prev, { role: "assistant", content: getSmartFallback(userMsg), timestamp: new Date().toLocaleTimeString() }]); }
    setChatLoading(false);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const demandChart = forecast?.forecasts?.demand?.slice(0, 12).map((d: any, i: number) => ({
    hour: `${i + 6}h`, demand: +(d.forecast || 0).toFixed(1), solar: +(forecast?.forecasts?.solar?.[i]?.forecast || 0).toFixed(1)
  })) || [];

  return (
    <div className="min-h-screen bg-slate-950">
      <video autoPlay muted loop playsInline preload="auto" className="fixed inset-0 h-full w-full object-cover opacity-20">
        <source src="/video2.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-slate-950/70" />

      <header className="relative z-50 flex justify-center p-4"><NavHeader /></header>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div suppressHydrationWarning className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs uppercase tracking-widest text-cyan-400 backdrop-blur-sm">
            {mounted ? `Live · ${timeStr}` : "Initializing..."}
          </div>
          <h1 className="text-3xl font-extrabold text-white md:text-5xl">
            Swarm <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Intelligence</span> Center
          </h1>
          <p className="mt-1 text-sm text-white/50">Multi-agent coordination · Real-time grid visualization · Gemini AI reasoning</p>
        </motion.div>

        {/* Metrics Row with Rainbow Borders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid gap-3 md:grid-cols-4 mb-4">
          {[
            { label: "Grid Demand", value: metrics?.gridStatus?.averageDemand || "—", sub: metrics?.gridStatus?.reliability || "—", color: "from-cyan-400 to-blue-500", border: "border-cyan-500/30" },
            { label: "Active Nodes", value: gridNodes.length.toString(), sub: `${gridNodes.reduce((a: number, n: GridNode) => a + n.size, 0)} MW capacity`, color: "from-violet-400 to-purple-500", border: "border-violet-500/30" },
            { label: "Pareto Solutions", value: optimizeResult?.pareto_count || "0", sub: "Optimized", color: "from-amber-400 to-orange-500", border: "border-amber-500/30" },
            { label: "Swarm Health", value: "99.7%", sub: "All agents nominal", color: "from-emerald-400 to-green-500", border: "border-emerald-500/30" },
          ].map((m, i) => (
            <div key={i} className={`relative rounded-2xl bg-slate-900/80 p-5 backdrop-blur-xl border ${m.border} shadow-lg shadow-${m.color.split(' ')[1]}/10`}>
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${m.color} opacity-5`} />
              <div className="relative text-center">
                <div className="text-[10px] uppercase tracking-widest text-white/40">{m.label}</div>
                <div className="mt-0.5 text-xl font-bold text-white">{m.value}</div>
                <div className={`text-[10px] bg-gradient-to-r ${m.color} bg-clip-text text-transparent`}>{m.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Map + Chat Row */}
        <div className="grid gap-4 lg:grid-cols-3 mb-4">
          {/* Map */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <Container className="p-3 h-72">
              <h3 className="mb-2 text-xs font-semibold text-white/70 uppercase tracking-wider">Grid Topology — NYC Region</h3>
              {mounted ? (
                <GridMap center={[40.7128, -74.006]} zoom={11} />
              ) : <div className="h-60 rounded-xl bg-white/5 animate-pulse" />}
            </Container>
          </motion.div>

          {/* Chat Interface */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <Container className="flex flex-col h-72 p-3">
              <h3 className="mb-2 text-xs font-semibold text-white/70 uppercase tracking-wider">Gemini Swarm Interface</h3>
              <div className="flex-1 overflow-y-auto space-y-2 mb-2 pr-2">
                <AnimatePresence>
                  {chatMessages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-lg p-2 text-xs ${msg.role === "user" ? "bg-cyan-500/20 text-cyan-100 ml-4" : "bg-violet-500/20 text-violet-100 mr-4"}`}>
                      <div className="font-medium text-[10px] opacity-50 mb-1" suppressHydrationWarning>{msg.role === "user" ? "You" : "Swarm AI"} · {msg.timestamp || "recent"}</div>
                      {msg.content}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Ask swarm..."
                  disabled={chatLoading}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                />
                <button onClick={sendMessage} disabled={chatLoading} className="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-3 py-2 text-xs font-medium text-white">
                  {chatLoading ? "..." : "→"}
                </button>
              </div>
            </Container>
          </motion.div>
        </div>

        {/* Forecast Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
          <Container>
            <h3 className="mb-3 text-xs font-semibold text-white/70 uppercase tracking-wider">12-Hour Demand & Solar Forecast</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={demandChart}>
                <defs>
                  <linearGradient id="demandG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} /><stop offset="100%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
                  <linearGradient id="solarG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="100%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="hour" stroke="#ffffff30" tick={{ fontSize: 10 }} />
                <YAxis stroke="#ffffff30" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="demand" stroke="#06b6d4" fill="url(#demandG)" strokeWidth={2} name="Demand (MW)" />
                <Area type="monotone" dataKey="solar" stroke="#f59e0b" fill="url(#solarG)" strokeWidth={2} name="Solar (kW/m²)" />
              </AreaChart>
            </ResponsiveContainer>
          </Container>
        </motion.div>

        {/* Optimization Controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-wrap gap-3">
          <button
            onClick={runOptimization}
            disabled={optimizing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {optimizing ? <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            {optimizing ? "Optimizing..." : "Run MOPSO"}
          </button>
          <button onClick={() => setChatMessages([...chatMessages, { role: "user", content: "What's the current grid status?", timestamp: new Date().toLocaleTimeString() }])} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10">
            Query Status
          </button>
          <button onClick={() => setChatMessages([...chatMessages, { role: "user", content: "Show optimization recommendations", timestamp: new Date().toLocaleTimeString() }])} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10">
            Get Recommendations
          </button>
        </motion.div>

        {/* Results */}
        {optimizeResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              { label: "Solar", value: `${optimizeResult.result.solarCapacity.toFixed(1)} MW`, color: "text-amber-400" },
              { label: "Wind", value: `${optimizeResult.result.windCapacity.toFixed(1)} MW`, color: "text-cyan-400" },
              { label: "Cost", value: `$${optimizeResult.result.cost.toFixed(1)}M`, color: "text-red-400" },
            ].map((m, i) => (
              <Container key={i} className="text-center">
                <div className="text-[10px] uppercase tracking-widest text-white/40">{m.label}</div>
                <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
              </Container>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}