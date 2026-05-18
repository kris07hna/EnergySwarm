import { NextResponse } from "next/server";
import { createDefaultObjectives } from "@/lib/pso/optimizer";
import { MOPSO, createDefaultSwarmConfig } from "@/lib/pso/mopso";
import { interpretPSOResult, getRecommendations } from "@/lib/pso/helpers";

export async function POST() {
  try {
    const config = createDefaultSwarmConfig(
      42, // Slightly smaller swarm with stronger adaptive search
      120 // Fewer iterations; better convergence behavior
    );
    config.archiveLimit = 80;
    config.leaderPoolSize = 5;
    config.mutationRate = 0.2;
    config.mutationScale = 3.5;
    config.stagnationThreshold = 10;

    const objectives = createDefaultObjectives();

    const optimizer = new MOPSO(config);
    const { archive } = optimizer.optimize();

    // Pick a representative solution from the Pareto archive by scalarizing
    let best: { position: number[]; costScalar: number } | null = null;
    for (const item of archive) {
      const [solarCapacity, windCapacity, costAllocation, riskMitigation, maintenanceBudget] = item.position;
      const normalized = {
        cost: Math.min(1, costAllocation / 100),
        sustainability: Math.min(1, solarCapacity / 500) + Math.min(1, windCapacity / 500),
        energyOutput: Math.max(solarCapacity, windCapacity),
        disasterResilience: Math.min(1, riskMitigation / 100),
        maintenanceFeasibility: Math.min(1, maintenanceBudget / 50),
      };
      const scalar =
        normalized.cost * objectives.cost -
        (normalized.sustainability * objectives.sustainability +
          normalized.energyOutput * objectives.energyOutput +
          normalized.disasterResilience * objectives.disasterResilience +
          normalized.maintenanceFeasibility * objectives.maintenanceFeasibility);

      if (!best || scalar < best.costScalar) {
        best = { position: item.position, costScalar: scalar };
      }
    }

    if (!best) throw new Error("No solution found in Pareto archive");

    const interpretedResult = interpretPSOResult(best.position, best.costScalar);
    const recommendations = getRecommendations(interpretedResult);

    return NextResponse.json({
      success: true,
      result: interpretedResult,
      recommendations,
      iterations: config.numIterations,
      pareto_count: archive.length,
    });
  } catch (error) {
    console.error("Optimization error:", error);
    return NextResponse.json(
      { error: "Optimization failed" },
      { status: 500 }
    );
  }
}
