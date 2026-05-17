import { runSwarm } from "./swarm";
import { transpose, matMult, matVecMult, solveLinearSystem } from "./ols";

export type ForecastPoint = {
  hour: number;
  forecast: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
};

function buildLagMatrix(series: number[], lags: number): { X: number[][]; y: number[] } {
  const N = series.length;
  const rows = N - lags;
  const X: number[][] = Array.from({ length: rows }, (_, i) => {
    const row: number[] = [1]; // intercept
    for (let l = 1; l <= lags; l++) row.push(series[i + lags - l]);
    return row;
  });
  const y: number[] = Array.from({ length: rows }, (_, i) => series[i + lags]);
  return { X, y };
}

function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export async function fitOLS(X: number[][], y: number[]) {
  // Normal equations: (X^T X) beta = X^T y
  const Xt = transpose(X);
  const XtX = matMult(Xt, X);
  const Xty = matVecMult(Xt, y);
  const beta = solveLinearSystem(XtX, Xty);
  return beta;
}

export function predictWithBeta(beta: number[], recentLags: number[], horizon: number): number[] {
  const lags = recentLags.length;
  const preds: number[] = [];
  const buffer = recentLags.slice(); // copy, most recent first (lag1)
  for (let h = 0; h < horizon; h++) {
    const x = [1, ...buffer.slice(0, lags)];
    const p = dot(beta, x);
    preds.push(p);
    buffer.unshift(p);
    buffer.length = lags; // keep size
  }
  return preds;
}

export function computeMetrics(preds: number[], actual: number[]) {
  const n = Math.min(preds.length, actual.length);
  let mae = 0;
  let mse = 0;
  let mape = 0;
  for (let i = 0; i < n; i++) {
    const e = actual[i] - preds[i];
    mae += Math.abs(e);
    mse += e * e;
    mape += Math.abs(e / (actual[i] || 1));
  }
  mae /= n;
  const rmse = Math.sqrt(mse / n);
  mape = (mape / n) * 100;
  return { mae, rmse, mape };
}

export async function inferAndForecast(
  series: number[],
  options?: { lags?: number; horizon?: number; bootstrap?: number; concurrency?: number }
) {
  const lags = options?.lags ?? 24;
  const horizon = options?.horizon ?? 168;
  const bootstrap = options?.bootstrap ?? 200;
  const concurrency = options?.concurrency ?? Math.min(8, Math.max(1, Math.floor((require('os').cpus ? require('os').cpus().length : 4) / 2)));

  if (series.length < lags + 10) {
    // pad with seasonal pattern if too short
    const padded = series.slice();
    while (padded.length < lags + 10) padded.unshift(padded[0] || 0);
    series = padded;
  }

  const { X, y } = buildLagMatrix(series, lags);

  // train/test split for evaluation (last 24 hours as test if available)
  const testHorizon = Math.min(24, Math.floor(series.length * 0.1));
  const trainRows = X.length - testHorizon;
  const Xtrain = X.slice(0, trainRows);
  const ytrain = y.slice(0, trainRows);
  const Xtest = X.slice(trainRows);
  const ytest = y.slice(trainRows);

  const beta = await fitOLS(Xtrain, ytrain);

  // in-sample (test) predictions
  const predsTest = Xtest.map(row => dot(beta, row));
  const metrics = computeMetrics(predsTest, ytest);

  // residuals from training
  const fittedTrain = Xtrain.map(row => dot(beta, row));
  const residuals: number[] = ytrain.map((v, i) => v - fittedTrain[i]);
  if (residuals.length === 0) residuals.push(0);

  // forecast using full series fit
  // refit on full data for final forecasts
  const betaFull = await fitOLS(X, y);
  const recentLags = series.slice(series.length - lags).reverse(); // most recent first
  const pointForecast = predictWithBeta(betaFull, recentLags, horizon);

  // bootstrap replicates - add resampled residuals to deterministic forecast
  const tasks = new Array(bootstrap).fill(0).map((_, i) => i);
  const replicates = await runSwarm<number, number[]>(
    tasks,
    async () => {
      const rep: number[] = [];
      for (let h = 0; h < horizon; h++) {
        const r = residuals[Math.floor(Math.random() * residuals.length)];
        rep.push(pointForecast[h] + r);
      }
      return rep;
    },
    concurrency,
  );

  // compute quantiles per horizon
  const quantiles = (p: number) => {
    return pointForecast.map((_, h) => {
      const vals = replicates.map(r => r[h]).sort((a, b) => a - b);
      const idx = Math.floor((vals.length - 1) * p);
      return vals[Math.max(0, Math.min(vals.length - 1, idx))];
    });
  };

  const lower = quantiles(0.05);
  const upper = quantiles(0.95);

  const forecasts: ForecastPoint[] = pointForecast.map((f, h) => ({
    hour: h,
    forecast: Math.max(0, f),
    lower_bound: Math.max(0, lower[h]),
    upper_bound: upper[h],
    confidence: 90,
  }));

  return {
    forecasts,
    model: { type: 'linear-lag', metrics, training_date: new Date().toISOString(), horizon_hours: horizon },
    residuals: residuals.slice(0, 200),
  };
}

export default { inferAndForecast };
