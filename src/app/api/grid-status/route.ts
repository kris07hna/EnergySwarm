import { NextResponse } from "next/server";

/**
 * Get grid stability and demand data
 * Predicts load patterns and grid stress
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || "us-east";
    const hours = parseInt(searchParams.get("hours") || "24");

    // Generate realistic demand curve
    const demandData = Array.from({ length: hours }, (_, hour) => {
      const baseLoad = 70;
      const peakLoad = 95;
      const nightLoad = 50;

      // Simulate daily load pattern
      let load = baseLoad;
      if (hour >= 6 && hour <= 10) load = peakLoad - (hour - 6) * 3;
      if (hour >= 10 && hour <= 17) load = peakLoad - 10;
      if (hour >= 17 && hour <= 21) load = peakLoad;
      if (hour >= 21) load = peakLoad - (hour - 21) * 5;
      if (hour < 6) load = nightLoad + hour * 2;

      return {
        hour,
        demand: load + Math.random() * 5,
        capacity: 120,
        reserve: 120 - (load + Math.random() * 5),
        frequency: 59.9 + Math.random() * 0.2, // Hz
        voltage: 240 + Math.random() * 5, // V
      };
    });

    const avgDemand =
      demandData.reduce((sum, d) => sum + d.demand, 0) / demandData.length;
    const reliability = Math.min(
      100,
      (avgDemand / 120) * 100 + Math.random() * 20
    );

    return NextResponse.json({
      success: true,
      gridStatus: {
        region,
        timestamp: new Date().toISOString(),
        averageDemand: avgDemand.toFixed(2) + " GW",
        peakDemand: Math.max(...demandData.map((d) => d.demand)).toFixed(2) + " GW",
        capacity: "120 GW",
        reliability: reliability.toFixed(1) + "%",
        demandForecast: demandData,
        alerts: [
          {
            level: "warning",
            message: "High demand expected 17:00-21:00",
          },
          {
            level: "info",
            message: "Renewable generation above 35%",
          },
        ],
      },
    });
  } catch (error) {
    console.error("Grid Status API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch grid status data" },
      { status: 500 }
    );
  }
}
