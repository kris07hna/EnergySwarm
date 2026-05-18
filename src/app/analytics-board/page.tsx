import type { Metadata } from "next";
import ResearchGradeDashboard from "@/components/ResearchGradeDashboard";

export const metadata: Metadata = {
  title: "Analytics Board - SwarmGrid AI",
  description:
    "Live analytics board for grid intelligence, forecasts, storage, resilience, and Gemini summaries.",
};

export default function AnalyticsBoardPage() {
  return <ResearchGradeDashboard />;
}
