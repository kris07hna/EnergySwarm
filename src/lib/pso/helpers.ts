/**
 * Helper functions for PSO simulation and analysis
 */

export interface SimulationResult {
  solarCapacity: number;
  windCapacity: number;
  cost: number;
  sustainability: number;
  energyOutput: number;
  disasterResilience: number;
  maintenanceFeasibility: number;
  score: number;
}

export function interpretPSOResult(
  position: number[],
  cost: number
): SimulationResult {
  const [
    solarCapacity,
    windCapacity,
    costAllocation,
    riskMitigation,
    maintenanceBudget,
  ] = position;

  return {
    solarCapacity: Math.round(solarCapacity * 10) / 10, // MW
    windCapacity: Math.round(windCapacity * 10) / 10, // MW
    cost: Math.round(costAllocation * 1000) / 10, // $M
    sustainability: Math.round((solarCapacity + windCapacity) * 10) / 10, // %
    energyOutput: Math.max(solarCapacity, windCapacity), // MWh/year
    disasterResilience: Math.round(riskMitigation * 10) / 10, // score 0-100
    maintenanceFeasibility: Math.round(maintenanceBudget * 10) / 10, // $M
    score: Math.abs(Math.round(cost * 100) / 100), // lower is better
  };
}

export function getRecommendations(result: SimulationResult): string[] {
  const recommendations: string[] = [];

  if (result.solarCapacity > 60) {
    recommendations.push(
      "✓ High solar capacity - focus on panel maintenance schedules"
    );
  } else {
    recommendations.push(
      "⚠ Consider increasing solar capacity in this region"
    );
  }

  if (result.windCapacity > 40) {
    recommendations.push("✓ Strong wind resource utilization");
  }

  if (result.disasterResilience > 70) {
    recommendations.push("✓ Good disaster resilience - infrastructure secured");
  } else {
    recommendations.push(
      "⚠ Increase disaster resilience investments for grid stability"
    );
  }

  if (result.cost < 50) {
    recommendations.push("✓ Cost-effective deployment strategy");
  } else {
    recommendations.push(
      "⚠ Optimize costs - consider phased deployment approach"
    );
  }

  if (result.maintenanceFeasibility > 30) {
    recommendations.push("✓ Adequate maintenance budget allocated");
  }

  return recommendations;
}

export function compareMetrics(
  baseline: SimulationResult,
  optimized: SimulationResult
): Record<string, { baseline: number; optimized: number; improvement: string }> {
  return {
    solarCapacity: {
      baseline: baseline.solarCapacity,
      optimized: optimized.solarCapacity,
      improvement: `${((optimized.solarCapacity / baseline.solarCapacity - 1) * 100).toFixed(1)}%`,
    },
    windCapacity: {
      baseline: baseline.windCapacity,
      optimized: optimized.windCapacity,
      improvement: `${((optimized.windCapacity / baseline.windCapacity - 1) * 100).toFixed(1)}%`,
    },
    cost: {
      baseline: baseline.cost,
      optimized: optimized.cost,
      improvement: `${((1 - optimized.cost / baseline.cost) * 100).toFixed(1)}% reduction`,
    },
    disasterResilience: {
      baseline: baseline.disasterResilience,
      optimized: optimized.disasterResilience,
      improvement: `${((optimized.disasterResilience / baseline.disasterResilience - 1) * 100).toFixed(1)}%`,
    },
  };
}
