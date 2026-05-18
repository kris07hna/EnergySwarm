import fs from "fs";

const path = "src/components/ResearchGradeDashboard.tsx";
let s = fs.readFileSync(path, "utf8");

// Fix loading JSX
s = s.replace(
  /(<p className="text-sm uppercase tracking-\[0\.35em\] text-white\/50">Loading analytics board<\/p>\n)(      <\/div>)(\n    \);)/,
  "$1        </div>\n      </motion.div>$3"
);

const oldHeader = `  return (
    <motion.div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl md:p-6">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <motion.div className="space-y-2">
          <motion.div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">
            <Sparkles className="h-4 w-4" />
            Analytics board
          </motion.div>
          <h2 className="text-3xl font-black text-white md:text-5xl">Research-grade grid intelligence</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/60 md:text-base">
            Live demand, forecasts, storage, resilience, and market signals in one organized board with Gemini-generated summaries and Excel export.
          </p>
        </motion.div>`;

// grep showed div not motion - fix
const oldHeader2 = oldHeader
  .replace(/<motion.div className="space-y-8/g, '<motion.div className="space-y-8')
  .replace(/<motion.div className="flex/g, '<motion.div className="flex')
  .replace(/<motion.div className="space-y-2">/g, '<motion.div className="space-y-2">');

const oldHeaderDiv = `  return (
    <motion.div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl md:p-6">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <motion.div className="space-y-2">`;

// Read actual lines from file
const match = s.match(/  return \(\n    <motion.div className="space-y-8[\s\S]*?Analytics board[\s\S]*?<\/p>\n        <\/motion.div>/);
if (match) console.log("found block length", match[0].length);

const newHeader = `  return (
    <motion.div className="relative min-h-screen text-white">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: \`url('\${BG_IMAGE}')\` }}
        aria-hidden
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/35 via-slate-950/45 to-black/55" />
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_42%)]"
        aria-hidden
      />
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
            Research analytics
          </div>
          <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">Grid intelligence board</h1>
          <p className="max-w-3xl text-base leading-7 text-white/68 md:text-lg">
            Live demand, forecasts, storage, resilience, and market signals — unified in one glass surface with Gemini summaries and Excel export.
          </p>
          </div>
        </div>`;

const oldHeaderActual = `  return (
    <motion.div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl md:p-6">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <motion.div className="space-y-2">
          <motion.div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">
            <Sparkles className="h-4 w-4" />
            Analytics board
          </motion.div>
          <h2 className="text-3xl font-black text-white md:text-5xl">Research-grade grid intelligence</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/60 md:text-base">
            Live demand, forecasts, storage, resilience, and market signals in one organized board with Gemini-generated summaries and Excel export.
          </p>
        </motion.div>`;

// Use div version from file
const oldHeaderFile = `  return (
    <motion.div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl md:p-6">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <motion.div className="space-y-2">
          <motion.div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">
            <Sparkles className="h-4 w-4" />
            Analytics board
          </motion.div>
          <h2 className="text-3xl font-black text-white md:text-5xl">Research-grade grid intelligence</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/60 md:text-base">
            Live demand, forecasts, storage, resilience, and market signals in one organized board with Gemini-generated summaries and Excel export.
          </p>
        </motion.div>`;

const oldHeaderFileDiv = `  return (
    <motion.div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl md:p-6">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <motion.div className="space-y-2">
          <motion.div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">
            <Sparkles className="h-4 w-4" />
            Analytics board
          </motion.div>
          <h2 className="text-3xl font-black text-white md:text-5xl">Research-grade grid intelligence</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/60 md:text-base">
            Live demand, forecasts, storage, resilience, and market signals in one organized board with Gemini-generated summaries and Excel export.
          </p>
        </motion.div>`;

const oldHeaderReal = `  return (
    <motion.div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl md:p-6">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <motion.div className="space-y-2">
          <motion.div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">
            <Sparkles className="h-4 w-4" />
            Analytics board
          </motion.div>
          <h2 className="text-3xl font-black text-white md:text-5xl">Research-grade grid intelligence</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/60 md:text-base">
            Live demand, forecasts, storage, resilience, and market signals in one organized board with Gemini-generated summaries and Excel export.
          </p>
        </motion.div>`;

const oldHeaderRealDiv = `  return (
    <motion.div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl md:p-6">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <motion.div className="space-y-2">
          <motion.div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">
            <Sparkles className="h-4 w-4" />
            Analytics board
          </motion.div>
          <h2 className="text-3xl font-black text-white md:text-5xl">Research-grade grid intelligence</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/60 md:text-base">
            Live demand, forecasts, storage, resilience, and market signals in one organized board with Gemini-generated summaries and Excel export.
          </p>
        </motion.div>`;

// Actual from grep - uses div
const OLD = `  return (
    <motion.div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl md:p-6">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <motion.div className="space-y-2">
          <motion.div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">
            <Sparkles className="h-4 w-4" />
            Analytics board
          </motion.div>
          <h2 className="text-3xl font-black text-white md:text-5xl">Research-grade grid intelligence</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/60 md:text-base">
            Live demand, forecasts, storage, resilience, and market signals in one organized board with Gemini-generated summaries and Excel export.
          </p>
        </motion.div>`;

const OLD_DIV = `  return (
    <motion.div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl md:p-6">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <motion.div className="space-y-2">
          <motion.div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">
            <Sparkles className="h-4 w-4" />
            Analytics board
          </motion.div>
          <h2 className="text-3xl font-black text-white md:text-5xl">Research-grade grid intelligence</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/60 md:text-base">
            Live demand, forecasts, storage, resilience, and market signals in one organized board with Gemini-generated summaries and Excel export.
          </p>
        </motion.div>`;

const OLD_REAL = `  return (
    <motion.div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl md:p-6">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <motion.div className="space-y-2">
          <motion.div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">
            <Sparkles className="h-4 w-4" />
            Analytics board
          </motion.div>
          <h2 className="text-3xl font-black text-white md:text-5xl">Research-grade grid intelligence</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/60 md:text-base">
            Live demand, forecasts, storage, resilience, and market signals in one organized board with Gemini-generated summaries and Excel export.
          </p>
        </motion.div>`;

// FINAL - exact from file with DIV tags
const OLD_EXACT = `  return (
    <motion.div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl md:p-6">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <motion.div className="space-y-2">
          <motion.div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">
            <Sparkles className="h-4 w-4" />
            Analytics board
          </motion.div>
          <h2 className="text-3xl font-black text-white md:text-5xl">Research-grade grid intelligence</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/60 md:text-base">
            Live demand, forecasts, storage, resilience, and market signals in one organized board with Gemini-generated summaries and Excel export.
          </p>
        </motion.div>`;

const OLD_EXACT_DIV = `  return (
    <motion.div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl md:p-6">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <motion.div className="space-y-2">
          <motion.div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">
            <Sparkles className="h-4 w-4" />
            Analytics board
          </motion.div>
          <h2 className="text-3xl font-black text-white md:text-5xl">Research-grade grid intelligence</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/60 md:text-base">
            Live demand, forecasts, storage, resilience, and market signals in one organized board with Gemini-generated summaries and Excel export.
          </p>
        </motion.div>`;

const target = `  return (
    <motion.div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl md:p-6">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <motion.div className="space-y-2">
          <motion.div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">
            <Sparkles className="h-4 w-4" />
            Analytics board
          </motion.div>
          <h2 className="text-3xl font-black text-white md:text-5xl">Research-grade grid intelligence</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/60 md:text-base">
            Live demand, forecasts, storage, resilience, and market signals in one organized board with Gemini-generated summaries and Excel export.
          </p>
        </motion.div>`;

const targetDiv = `  return (
    <motion.div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl md:p-6">
      <motion.div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <motion.div className="space-y-2">
          <motion.div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">
            <Sparkles className="h-4 w-4" />
            Analytics board
          </motion.div>
          <h2 className="text-3xl font-black text-white md:text-5xl">Research-grade grid intelligence</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/60 md:text-base">
            Live demand, forecasts, storage, resilience, and market signals in one organized board with Gemini-generated summaries and Excel export.
          </p>
        </motion.div>`;

// STOP - use regex on file directly
const re = /  return \(\n    <div className="space-y-8 rounded-\[2rem\][\s\S]*?        <\/div>\n\n        <div className="flex flex-wrap items-center gap-3">/;
const m = s.match(re);
console.log("header match", !!m);

if (m) {
  s = s.replace(
    m[0],
    newHeader + `\n\n        <div className="flex flex-wrap items-center gap-3">`
  );
  console.log("header ok");
}

// Close hero card after buttons
s = s.replace(
  /(\{exporting \? "Exporting\.\.\." : "Export Excel"\}\s*<\/button>\s*<\/div>\s*)<\/motion.div>\s*\n\s*\{exportMessage/,
  `$1        </motion.div>\n\n      {exportMessage`
);

// Tabs
s = s.replace(
  /      \{\/\* Tab Navigation \*\/\}[\s\S]*?      <\/div>\n\n      \{\/\* OVERVIEW TAB \*\/\}/,
  `        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={\`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition \${
                  active
                    ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25"
                    : "border border-white/10 bg-white/5 text-white/60 backdrop-blur-xl hover:border-white/20 hover:bg-white/10 hover:text-white"
                }\`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        <div className="mt-6 space-y-6">

      {/* OVERVIEW TAB */}`
);

// Fix end closing
const endRe = /(\{\/\* MARKETS TAB \*\/\}[\s\S]*?\)\s*\}\s*)\n    <\/motion.div>\n  \);/;
if (endRe.test(s)) {
  s = s.replace(
    endRe,
    `$1
        </motion.div>
      </motion.div>
    </motion.div>
  );`
  );
  console.log("end ok");
}

// Styles
const compact = "rounded-[1.5rem] border border-cyan-500/10 bg-gradient-to-br from-white/8 to-white/3 p-5 backdrop-blur-2xl transition hover:border-cyan-400/20";
s = s.replaceAll('contentStyle={{\n                      backgroundColor: "#1e293b",\n                      border: "1px solid #475569",\n                      borderRadius: "8px",\n                    }}', `contentStyle={chartTooltipStyle}`);
s = s.replaceAll("bg-gray-800/50", "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl");
s = s.replaceAll("bg-gray-900/40 border border-gray-700 rounded-lg p-4", compact);
s = s.replaceAll('className="bg-gray-800/50 rounded p-3"', 'className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl"');
s = s.replaceAll("bg-gray-700", "bg-white/10");
s = s.replaceAll("text-gray-400", "text-white/50");
s = s.replaceAll("text-gray-300", "text-white/60");
s = s.replace(
  `className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg p-4"`,
  `className="rounded-[1.5rem] border border-red-400/25 bg-gradient-to-r from-red-500/10 to-orange-500/10 p-5 backdrop-blur-2xl"`
);
s = s.replace(
  `className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70"`,
  `className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100/90 backdrop-blur-xl"`
);

fs.writeFileSync(path, s);
console.log("done, length", s.length);
