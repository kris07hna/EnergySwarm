/**
 * Enhanced PSO Optimizer with Real-Time Iteration Tracking
 * Tracks particle positions and fitness at each iteration for visualization
 */

export interface Particle {
  position: number[];
  velocity: number[];
  bestPosition: number[];
  bestCost: number;
  crowdingDistance?: number;
}

export interface ParticleState {
  iteration: number;
  particles: Array<{ x: number; y: number; fitness: number; isBest: boolean }>;
  globalBest: {
    position: number[];
    cost: number;
  };
  progress: number;
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
  w: number;
  c1: number;
  c2: number;
  dimensions: number;
  bounds: { min: number; max: number };
}

export class EnhancedPSOOptimizer {
  private particles: Particle[] = [];
  private globalBestPosition: number[] = [];
  private globalBestCost: number = Infinity;
  private config: SwarmConfig;
  private objectives: ObjectiveWeights;
  private iteration: number = 0;
  private history: ParticleState[] = [];

  constructor(config: SwarmConfig, objectives: ObjectiveWeights) {
    this.config = config;
    this.objectives = objectives;
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
      };

      this.particles.push(particle);

      if (particle.bestCost < this.globalBestCost) {
        this.globalBestCost = particle.bestCost;
        this.globalBestPosition = [...particle.bestPosition];
      }
    }
  }

  private evaluateFitness(position: number[]): number {
    const [
      solarCapacity,
      windCapacity,
      costAllocation,
      riskMitigation,
      maintenanceBudget,
    ] = position;

    const normalized = {
      cost: this.normalizeCost(costAllocation),
      sustainability:
        this.normalizeSustainability(solarCapacity) +
        this.normalizeSustainability(windCapacity),
      energyOutput: Math.max(solarCapacity, windCapacity),
      disasterResilience: this.normalizeResilience(riskMitigation),
      maintenanceFeasibility: this.normalizeMaintenance(maintenanceBudget),
    };

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
    return Math.min(1, value / 100);
  }

  private normalizeSustainability(value: number): number {
    return Math.min(1, value / 500);
  }

  private normalizeResilience(value: number): number {
    return Math.min(1, value / 100);
  }

  private normalizeMaintenance(value: number): number {
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

  public step(): ParticleState {
    for (const particle of this.particles) {
      const r1 = Math.random();
      const r2 = Math.random();

      particle.velocity = particle.velocity.map((v, i) => {
        const cognitive =
          this.config.c1 * r1 * (particle.bestPosition[i] - particle.position[i]);
        const social =
          this.config.c2 * r2 * (this.globalBestPosition[i] - particle.position[i]);
        return this.config.w * v + cognitive + social;
      });

      particle.position = particle.position.map(
        (p, i) => p + particle.velocity[i]
      );
      particle.position = this.clampVector(particle.position);

      const fitness = this.evaluateFitness(particle.position);

      if (fitness < particle.bestCost) {
        particle.bestCost = fitness;
        particle.bestPosition = [...particle.position];

        if (fitness < this.globalBestCost) {
          this.globalBestCost = fitness;
          this.globalBestPosition = [...particle.bestPosition];
        }
      }
    }

    this.iteration++;

    // Record state for visualization
    const state: ParticleState = {
      iteration: this.iteration,
      particles: this.particles.map((p, i) => ({
        x: p.position[0] / this.config.bounds.max,
        y: p.position[1] / this.config.bounds.max,
        fitness: p.bestCost,
        isBest: this.particles[i].bestPosition === this.globalBestPosition,
      })),
      globalBest: {
        position: this.globalBestPosition,
        cost: this.globalBestCost,
      },
      progress: (this.iteration / this.config.numIterations) * 100,
    };

    this.history.push(state);
    return state;
  }

  public optimize(onProgress?: (state: ParticleState) => void): {
    position: number[];
    cost: number;
    iterations: number;
    history: ParticleState[];
  } {
    for (let i = 0; i < this.config.numIterations; i++) {
      const state = this.step();
      if (onProgress) {
        onProgress(state);
      }
    }

    return {
      position: this.globalBestPosition,
      cost: this.globalBestCost,
      iterations: this.iteration,
      history: this.history,
    };
  }

  public getParticles(): Particle[] {
    return this.particles;
  }

  public getGlobalBest(): { position: number[]; cost: number } {
    return {
      position: this.globalBestPosition,
      cost: this.globalBestCost,
    };
  }

  public getIterationCount(): number {
    return this.iteration;
  }

  public getProgress(): number {
    return (this.iteration / this.config.numIterations) * 100;
  }

  public getHistory(): ParticleState[] {
    return this.history;
  }
}

export function createDefaultSwarmConfig(
  numParticles: number = 50,
  numIterations: number = 150,
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

export function createDefaultObjectives(): ObjectiveWeights {
  return {
    cost: 0.2,
    sustainability: 0.25,
    energyOutput: 0.25,
    disasterResilience: 0.15,
    maintenanceFeasibility: 0.15,
  };
}
