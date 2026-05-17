import { NextResponse } from "next/server";

/**
 * Disaster Resilience & Risk Assessment
 * Integrates earthquake, hurricane, flood, and severe weather hazards
 * Returns resilience scoring and mitigation recommendations
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get("latitude") || "40.7128");
    const longitude = parseFloat(searchParams.get("longitude") || "-74.0060");
    const includeHistorical = searchParams.get("historical") === "true";

    // Hazard assessments (0-100 scale)
    const hazardAssessment = {
      earthquake: calculateEarthquakeRisk(latitude, longitude),
      hurricane: calculateHurricaneRisk(latitude, longitude),
      flood: calculateFloodRisk(latitude, longitude),
      severe_weather: calculateSevereWeatherRisk(latitude, longitude),
      wildfire: calculateWildfireRisk(latitude, longitude),
      grid_failure: calculateGridFailureRisk(latitude, longitude),
    };

    // Calculate composite resilience score (0-100, higher is better)
    const compositeRisk = Object.values(hazardAssessment).reduce((a, b) => a + b, 0) / Object.keys(hazardAssessment).length;
    const resilienceScore = 100 - compositeRisk;

    // Infrastructure resilience metrics
    const infrastructureMetrics = {
      backup_capacity_ratio: 0.25, // 25% backup power vs peak demand
      renewable_diversity: 0.72, // Score for mixed renewable sources
      microgrid_distribution: 0.58, // Percentage of grid in microgrids
      transmission_redundancy: 0.81, // Multiple paths for power flow
      storage_capacity_hours: 4.5, // Hours of battery storage
      recovery_time_hours: 6.2, // Average recovery from outage
    };

    // Vulnerability assessment
    const vulnerabilities = [
      {
        id: "aging-infrastructure",
        title: "Aging Transmission Infrastructure",
        severity: calculateInfrastructureAge(),
        affectedAssets: ["transformer-45", "line-67", "substation-8"],
        recommendation: "Prioritize upgrades in high-traffic corridors",
      },
      {
        id: "concentrated-generation",
        title: "Concentrated Renewable Generation",
        severity: 65,
        affectedAssets: ["solar-farm-north", "wind-farm-east"],
        recommendation: "Diversify geographic distribution or increase storage",
      },
      {
        id: "extreme-weather-exposure",
        title: "Extreme Weather Exposure",
        severity: hazardAssessment.severe_weather,
        affectedAssets: ["substation-12", "transmission-line-34"],
        recommendation: "Harden infrastructure with underground lines where feasible",
      },
      {
        id: "single-point-failures",
        title: "Single Point Failures in Distribution",
        severity: 58,
        affectedAssets: ["feeder-1", "feeder-5"],
        recommendation: "Create redundant distribution paths",
      },
    ];

    // Mitigation strategies with ROI
    const mitigationStrategies = [
      {
        strategy: "Distributed Energy Resources (DER)",
        investmentCost: 150000000, // $150M
        resilienceGain: 22,
        roi_percentage: 18.5,
        timeframe_years: 5,
        impact: "Reduce single-point-of-failure risk by 40%",
      },
      {
        strategy: "Battery Energy Storage Systems (BESS)",
        investmentCost: 85000000,
        resilienceGain: 28,
        roi_percentage: 24.2,
        timeframe_years: 4,
        impact: "4-6 hours of backup power, supports peak shaving",
      },
      {
        strategy: "Microgrid Development",
        investmentCost: 120000000,
        resilienceGain: 35,
        roi_percentage: 22.1,
        timeframe_years: 6,
        impact: "Island operation capability, 99.99% availability",
      },
      {
        strategy: "Smart Grid & AI Coordination",
        investmentCost: 45000000,
        resilienceGain: 18,
        roi_percentage: 31.8,
        timeframe_years: 3,
        impact: "Faster fault detection and self-healing",
      },
    ];

    // Historical events (if requested)
    let historicalEvents: any[] = [];
    if (includeHistorical) {
      historicalEvents = [
        {
          date: "2023-07-15",
          type: "heat_wave",
          duration_hours: 48,
          peak_demand_increase: "18%",
          renewable_reduction: "12%",
          impact: "peak_pricing_surge",
        },
        {
          date: "2023-09-22",
          type: "severe_storm",
          duration_hours: 6,
          outages: 12400,
          recovery_hours: 4.5,
          impact: "localized_disruption",
        },
      ];
    }

    // Real-time alerts
    const activeAlerts = [
      {
        level: "moderate",
        message: "Heat advisory in effect - increased cooling demand expected",
        duration_hours: 24,
      },
      {
        level: "low",
        message: "Minor weather system approaching - minor wind generation expected",
        duration_hours: 12,
      },
    ];

    return NextResponse.json({
      success: true,
      resilience: {
        overall_score: resilienceScore.toFixed(1),
        risk_level: getRiskLevel(compositeRisk),
        hazard_assessment: hazardAssessment,
        composite_risk: compositeRisk.toFixed(1),
      },
      infrastructure: infrastructureMetrics,
      vulnerabilities: vulnerabilities.map(v => ({
        ...v,
        severity: Math.round(v.severity),
      })),
      mitigation_strategies: mitigationStrategies,
      historical_events: historicalEvents,
      active_alerts: activeAlerts,
      coordinates: { latitude, longitude },
      timestamp: new Date().toISOString(),
      recommendations: {
        immediate: "Ensure backup generators are operational for the heat advisory",
        short_term: "Increase renewable generation curtailment flexibility",
        medium_term: "Deploy distributed storage within 18 months",
        long_term: "Transition to resilience-first grid architecture by 2027",
      },
    });
  } catch (error) {
    console.error("Resilience API error:", error);
    return NextResponse.json(
      { error: "Failed to assess grid resilience" },
      { status: 500 }
    );
  }
}

function calculateEarthquakeRisk(lat: number, lon: number): number {
  // Simple model: higher risk on coasts and in fault zones
  if (lon < -125 || (lon < -110 && lat > 31)) return 60 + Math.random() * 20;
  return 15 + Math.random() * 10;
}

function calculateHurricaneRisk(lat: number, lon: number): number {
  // Higher risk in hurricane belt (roughly 20-35°N)
  if (lat > 20 && lat < 35 && lon > -100) return 50 + Math.random() * 25;
  if (lat > 20 && lat < 35) return 35 + Math.random() * 20;
  return 5 + Math.random() * 10;
}

function calculateFloodRisk(lat: number, lon: number): number {
  // Varies by geography - Mississippi River, coastal areas, etc.
  if (lat > 30 && lat < 40 && lon > -95 && lon < -85) return 55 + Math.random() * 20;
  if (lat < 30) return 45 + Math.random() * 20;
  return 25 + Math.random() * 15;
}

function calculateSevereWeatherRisk(lat: number, lon: number): number {
  // Tornado alley risk
  if (lat > 35 && lat < 42 && lon > -102 && lon < -85) return 70 + Math.random() * 15;
  return 35 + Math.random() * 25;
}

function calculateWildfireRisk(lat: number, lon: number): number {
  // Western US and high-altitude areas
  if (lon < -110 && lat > 32) return 65 + Math.random() * 20;
  if (lon < -115 && lat > 42) return 45 + Math.random() * 20;
  return 15 + Math.random() * 15;
}

function calculateGridFailureRisk(lat: number, lon: number): number {
  // Based on historical outage data and basic geographic factors
  // Use latitude/longitude to produce a region-dependent risk factor
  const latFactor = Math.min(20, Math.abs(lat) % 20);
  const lonFactor = Math.min(20, Math.abs(lon) % 20);
  const geoFactor = (latFactor + lonFactor) / 2;
  const randomNoise = Math.random() * 15;
  const risk = 20 + geoFactor + randomNoise; // base 20
  return Math.min(100, Math.round(risk));
}

function calculateInfrastructureAge(): number {
  // Simulates aging infrastructure score
  return 58 + Math.random() * 15;
}

function getRiskLevel(risk: number): string {
  if (risk > 75) return "CRITICAL";
  if (risk > 50) return "HIGH";
  if (risk > 25) return "MODERATE";
  return "LOW";
}
