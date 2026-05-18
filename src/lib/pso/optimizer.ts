/**
 * Multi-Objective Particle Swarm Optimization (MOPSO)
 * Optimizes for: Cost, Sustainability, Energy Output, Disaster Resilience, Maintenance Feasibility
 */

export interface Particle {
  position: number[];
  velocity: number[];
  bestPosition: number[];
  bestCost: number;
  crowdingDistance?: number;
  stagnation?: number;
}

export interface ObjectiveWeights {
  cost: number;
  sustainability: number;
  energyOutput: number;
  disasterResilience: number;
  maintenanceFeasibility: number;
}

export interface SwarmConfig {
  numParticles: number;
  numIterations: number;
  w: number; // inertia weight
  c1: number; // cognitive parameter
  c2: number; // social parameter
  dimensions: number;
  bounds: { min: number; max: number };
}

export class PSOOptimizer {
  private particles: Particle[] = [];
  private globalBestPosition: number[] = [];
  private globalBestCost: number = Infinity;
  private config: SwarmConfig;
  private objectives: ObjectiveWeights;
  private iteration: number = 0;
  private maxVelocity: number;
  private stagnationThreshold = 8;
  private mutationChance = 0.18;
  private mutationScale: number;

  constructor(config: SwarmConfig, objectives: ObjectiveWeights) {
    this.config = config;
    this.objectives = objectives;
    this.maxVelocity = Math.max(3, (config.bounds.max - config.bounds.min) * 0.18);
    this.mutationScale = (config.bounds.max - config.bounds.min) * 0.08;
    this.initializeSwarm();
  }

  private initializeSwarm(): void {
    for (let i = 0; i < this.config.numParticles; i++) {
      const position = this.randomVector(
        this.config.dimensions,
        this.config.bounds
      );
      const velocity = this.randomVector(
        this.config.dimensions,
        { min: -1, max: 1 }
      );

      const particle: Particle = {
        position,
        velocity,
        bestPosition: [...position],
        bestCost: this.evaluateFitness(position),
        stagnation: 0,
      };

      this.particles.push(particle);

      if (particle.bestCost < this.globalBestCost) {
        this.globalBestCost = particle.bestCost;
        this.globalBestPosition = [...particle.bestPosition];
      }
    }
  }

  /**
   * Multi-objective fitness evaluation
   * Lower cost is better (minimize)
   */
  private evaluateFitness(position: number[]): number {
    const [
      solarCapacity,
      windCapacity,
      costAllocation,
      riskMitigation,
      maintenanceBudget,
    ] = position;

    // Normalize to 0-1 range
    const normalized = {
      cost: this.normalizeCost(costAllocation),
      sustainability:
        this.normalizeSustainability(solarCapacity) +
        this.normalizeSustainability(windCapacity),
      energyOutput: Math.max(solarCapacity, windCapacity),
      disasterResilience: this.normalizeResilience(riskMitigation),
      maintenanceFeasibility: this.normalizeMaintenance(maintenanceBudget),
    };

    // Weighted combination
    const fitness =
      normalized.cost * this.objectives.cost -
      (normalized.sustainability * this.objectives.sustainability +
        normalized.energyOutput * this.objectives.energyOutput +
        normalized.disasterResilience * this.objectives.disasterResilience +
        normalized.maintenanceFeasibility *
          this.objectives.maintenanceFeasibility);

    return fitness;
  }

  private normalizeCost(value: number): number {
    // Assume cost is between 0-100M
    return Math.min(1, value / 100);
  }

  private normalizeSustainability(value: number): number {
    // Solar/Wind capacity normalized to 0-1 (0-500MW)
    return Math.min(1, value / 500);
  }

  private normalizeResilience(value: number): number {
    // Risk mitigation score 0-100
    return Math.min(1, value / 100);
  }

  private normalizeMaintenance(value: number): number {
    // Maintenance budget 0-50M
    return Math.min(1, value / 50);
  }

  private randomVector(
    dimensions: number,
    bounds: { min: number; max: number }
  ): number[] {
    return Array.from({ length: dimensions }, () =>
      Math.random() * (bounds.max - bounds.min) + bounds.min
    );
  }

  private clampVector(vector: number[]): number[] {
    return vector.map((v) =>
      Math.max(
        this.config.bounds.min,
        Math.min(this.config.bounds.max, v)
      )
    );
  }

  private clampVelocity(value: number): number {
    return Math.max(-this.maxVelocity, Math.min(this.maxVelocity, value));
  }

  private mutateParticle(particle: Particle): number {
    const spread = this.mutationScale * Math.max(0.35, 1 - this.iteration / Math.max(1, this.config.numIterations));

    particle.position = particle.bestPosition.map((value) =>
      Math.max(
        this.config.bounds.min,
        Math.min(this.config.bounds.max, value + (Math.random() - 0.5) * spread)
      )
    );

    particle.velocity = particle.velocity.map((value) =>
      this.clampVelocity(value * 0.35 + (Math.random() - 0.5) * 1.5)
    );

    return this.evaluateFitness(particle.position);
  }

  public step(): void {
    const progress = this.iteration / Math.max(1, this.config.numIterations);
    const inertia = Math.max(0.38, this.config.w * (1 - progress) + 0.12);

    for (const particle of this.particles) {
      particle.velocity = particle.velocity.map((v, i) => {
        const r1 = Math.random();
        const r2 = Math.random();
        const cognitive = this.config.c1 * r1 * (particle.bestPosition[i] - particle.position[i]);
        const social = this.config.c2 * r2 * (this.globalBestPosition[i] - particle.position[i]);
        return this.clampVelocity(inertia * v + cognitive + social);
      });

      particle.position = particle.position.map(
        (p, i) => p + particle.velocity[i]
      );
      particle.position = this.clampVector(particle.position);

      let fitness = this.evaluateFitness(particle.position);

      if (fitness < particle.bestCost) {
        particle.bestCost = fitness;
        particle.bestPosition = [...particle.position];
        particle.stagnation = 0;

        if (fitness < this.globalBestCost) {
          this.globalBestCost = fitness;
          this.globalBestPosition = [...particle.bestPosition];
        }
      } else {
        particle.stagnation = (particle.stagnation ?? 0) + 1;

        if (particle.stagnation >= this.stagnationThreshold && Math.random() < this.mutationChance) {
          fitness = this.mutateParticle(particle);
          particle.stagnation = 0;

          if (fitness < particle.bestCost) {
            particle.bestCost = fitness;
            particle.bestPosition = [...particle.position];

            if (fitness < this.globalBestCost) {
              this.globalBestCost = fitness;
              this.globalBestPosition = [...particle.bestPosition];
            }
          }
        }
      }
    }

    this.iteration++;
  }

  public optimize(): { position: number[]; cost: number; iterations: number } {
    for (let i = 0; i < this.config.numIterations; i++) {
      this.step();
    }

    return {
      position: this.globalBestPosition,
      cost: this.globalBestCost,
      iterations: this.iteration,
    };
  }

  public getParticles(): Particle[] {
    return this.particles;
  }

  public getGlobalBest(): {
    position: number[];
    cost: number;
  } {
    return {
      position: this.globalBestPosition,
      cost: this.globalBestCost,
    };
  }

  public getIterationCount(): number {
    return this.iteration;
  }
}

/**
 * Helper function to create default swarm configuration
 */
export function createDefaultSwarmConfig(
  numParticles: number = 30,
  numIterations: number = 100,
  dimensions: number = 5
): SwarmConfig {
  return {
    numParticles,
    numIterations,
    w: 0.7,
    c1: 1.5,
    c2: 1.5,
    dimensions,
    bounds: { min: 0, max: 100 },
  };
}

/**
 * Default objective weights - can be adjusted
 */
export function createDefaultObjectives(): ObjectiveWeights {
  return {
    cost: 0.2,
    sustainability: 0.25,
    energyOutput: 0.25,
    disasterResilience: 0.15,
    maintenanceFeasibility: 0.15,
  };
}
