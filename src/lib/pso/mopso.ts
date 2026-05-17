/**
 * Multi-objective PSO (MOPSO) with Pareto archive and simple crowding distance
 * Returns a pareto archive; optimizer can scalarize archive for single-solution APIs
 */

export type MOParticle = {
  position: number[];
  velocity: number[];
  pbestPos: number[];
  pbestObj: number[];
  stagnation: number;
};

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
  archiveLimit?: number;
  leaderPoolSize?: number;
  mutationRate?: number;
  mutationScale?: number;
  stagnationThreshold?: number;
}

function dominates(a: number[], b: number[]) {
  let strictlyBetter = false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] > b[i]) return false; // assuming minimization
    if (a[i] < b[i]) strictlyBetter = true;
  }
  return strictlyBetter;
}

function computeCrowding(objs: number[][]) {
  const n = objs.length;
  const m = objs[0]?.length || 0;
  const dist = new Array(n).fill(0);
  if (n === 0) return dist;
  for (let j = 0; j < m; j++) {
    const idx = objs.map((_, i) => i).sort((i, k) => objs[i][j] - objs[k][j]);
    const minV = objs[idx[0]][j];
    const maxV = objs[idx[n - 1]][j];
    dist[idx[0]] = Infinity;
    dist[idx[n - 1]] = Infinity;
    if (maxV === minV) continue;
    for (let k = 1; k < n - 1; k++) {
      dist[idx[k]] += (objs[idx[k + 1]][j] - objs[idx[k - 1]][j]) / (maxV - minV);
    }
  }
  return dist;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function jitter(scale: number) {
  return (Math.random() - 0.5) * 2 * scale;
}

export class MOPSO {
  private particles: MOParticle[] = [];
  private archive: { position: number[]; objectives: number[] }[] = [];
  private config: SwarmConfig;
  private archiveLimit: number;
  private leaderPoolSize: number;
  private mutationRate: number;
  private mutationScale: number;
  private stagnationThreshold: number;

  constructor(config: SwarmConfig) {
    this.config = config;
    this.archiveLimit = config.archiveLimit ?? 100;
    this.leaderPoolSize = Math.max(2, config.leaderPoolSize ?? 3);
    this.mutationRate = config.mutationRate ?? 0.15;
    this.mutationScale = config.mutationScale ?? 4;
    this.stagnationThreshold = config.stagnationThreshold ?? 12;
    this.initialize();
  }

  private initialize() {
    for (let i = 0; i < this.config.numParticles; i++) {
      const position = Array.from({ length: this.config.dimensions }, () =>
        Math.random() * (this.config.bounds.max - this.config.bounds.min) + this.config.bounds.min
      );
      const velocity = Array.from({ length: this.config.dimensions }, () =>
        Math.random() * 2 - 1
      );
      const particle: MOParticle = {
        position,
        velocity,
        pbestPos: [...position],
        pbestObj: [],
        stagnation: 0,
      };
      this.particles.push(particle);
    }
  }

  private selectLeader() {
    if (this.archive.length === 0) {
      return null;
    }

    const poolSize = Math.min(this.leaderPoolSize, this.archive.length);
    const pool = Array.from({ length: poolSize }, () =>
      this.archive[Math.floor(Math.random() * this.archive.length)]
    );
    const crowding = computeCrowding(pool.map((item) => item.objectives));
    let bestIndex = 0;
    for (let i = 1; i < crowding.length; i++) {
      if (crowding[i] > crowding[bestIndex]) {
        bestIndex = i;
      }
    }

    return pool[bestIndex];
  }

  private mutateParticle(particle: MOParticle) {
    particle.position = particle.position.map((value, index) => {
      const spread = this.mutationScale * (1 - index / Math.max(1, particle.position.length - 1));
      return clamp(value + jitter(spread), this.config.bounds.min, this.config.bounds.max);
    });
    particle.velocity = particle.velocity.map((value) => value * 0.5 + jitter(1.2));
  }

  // user-supplied objective function (synchronous)
  private evaluateObjectives(pos: number[]) {
    const [
      solarCapacity,
      windCapacity,
      costAllocation,
      riskMitigation,
      maintenanceBudget,
    ] = pos;

    const normalized = {
      cost: Math.min(1, costAllocation / 100),
      sustainability: Math.min(1, solarCapacity / 500) + Math.min(1, windCapacity / 500),
      energyOutput: Math.max(solarCapacity, windCapacity) / 500,
      disasterResilience: Math.min(1, riskMitigation / 100),
      maintenanceFeasibility: Math.min(1, maintenanceBudget / 50),
    };

    // We want to minimize all objectives, so for things we maximize convert to negative
    return [
      normalized.cost,
      -normalized.sustainability,
      -normalized.energyOutput,
      -normalized.disasterResilience,
      -normalized.maintenanceFeasibility,
    ];
  }

  private updateArchive(candidatePos: number[], candidateObj: number[]) {
    // remove dominated archive members
    this.archive = this.archive.filter(a => !dominates(candidateObj, a.objectives));
    // if candidate is dominated, skip
    for (const a of this.archive) {
      if (dominates(a.objectives, candidateObj)) return;
    }
    this.archive.push({ position: [...candidatePos], objectives: [...candidateObj] });
    // limit archive size by crowding
    if (this.archive.length > 100) {
      const objs = this.archive.map(a => a.objectives);
      const crowd = computeCrowding(objs);
      const pairs = this.archive.map((a, i) => ({ a, c: crowd[i] }));
      // remove the smallest crowding (densest) until <=100
      pairs.sort((x, y) => (y.c === Infinity ? 1 : x.c === Infinity ? -1 : x.c - y.c));
      this.archive = pairs.slice(0, this.archiveLimit).map(p => p.a);
    }
  }

  public optimize(): { archive: { position: number[]; objectives: number[] }[] } {
    const { numIterations } = this.config;
    // initial evaluation
    for (const p of this.particles) {
      const obj = this.evaluateObjectives(p.position);
      p.pbestObj = [...obj];
      this.updateArchive(p.position, obj);
    }

    for (let iter = 0; iter < numIterations; iter++) {
      const w = Math.max(0.35, this.config.w * (1 - iter / numIterations) + 0.15); // decay
      for (const p of this.particles) {
        const r1 = Math.random();
        const r2 = Math.random();
        // select global guide from archive randomly (diversity)
        const guide = this.selectLeader() || { position: p.pbestPos };

        p.velocity = p.velocity.map((v, i) =>
          w * v + this.config.c1 * r1 * (p.pbestPos[i] - p.position[i]) + this.config.c2 * r2 * (guide.position[i] - p.position[i])
        );

        p.position = p.position.map((pos, i) => pos + p.velocity[i]);
        // clamp
        p.position = p.position.map(v => clamp(v, this.config.bounds.min, this.config.bounds.max));

        const obj = this.evaluateObjectives(p.position);

        // update pbest if dominated
        if (p.pbestObj.length === 0 || dominates(obj, p.pbestObj)) {
          p.pbestObj = [...obj];
          p.pbestPos = [...p.position];
          p.stagnation = 0;
        } else {
          p.stagnation += 1;
        }

        this.updateArchive(p.position, obj);

        if (p.stagnation >= this.stagnationThreshold && Math.random() < this.mutationRate) {
          this.mutateParticle(p);
          p.stagnation = 0;
        }
      }
    }

    return { archive: this.archive };
  }
}

export function createDefaultSwarmConfig(
  numParticles = 50,
  numIterations = 150,
  dimensions = 5
): SwarmConfig {
  return {
    numParticles,
    numIterations,
    w: 0.8,
    c1: 1.5,
    c2: 1.5,
    dimensions,
    bounds: { min: 0, max: 100 },
  };
}
