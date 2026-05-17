// Basic linear algebra helpers and OLS solver (no external deps)

export function transpose(A: number[][]): number[][] {
  if (A.length === 0) return [];
  const rows = A.length;
  const cols = A[0].length;
  const T: number[][] = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) T[j][i] = A[i][j];
  }
  return T;
}

export function matMult(A: number[][], B: number[][]): number[][] {
  const aR = A.length;
  const aC = A[0].length;
  const bR = B.length;
  const bC = B[0].length;
  if (aC !== bR) throw new Error('Matrix dimension mismatch');
  const C: number[][] = Array.from({ length: aR }, () => new Array(bC).fill(0));
  for (let i = 0; i < aR; i++) {
    for (let k = 0; k < aC; k++) {
      const aik = A[i][k];
      for (let j = 0; j < bC; j++) C[i][j] += aik * B[k][j];
    }
  }
  return C;
}

export function matVecMult(A: number[][], v: number[]): number[] {
  const r = A.length;
  const c = A[0].length;
  if (v.length !== c) throw new Error('Matrix-vector dim mismatch');
  const out = new Array(r).fill(0);
  for (let i = 0; i < r; i++) {
    let s = 0;
    for (let j = 0; j < c; j++) s += A[i][j] * v[j];
    out[i] = s;
  }
  return out;
}

// Solve linear system Ax = b using Gaussian elimination with partial pivoting
export function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  if (A.some(row => row.length !== n)) throw new Error('Matrix must be square');
  if (b.length !== n) throw new Error('Right-hand side vector has wrong length');

  // deep copy
  const M: number[][] = A.map(r => r.slice());
  const x = b.slice();

  for (let k = 0; k < n; k++) {
    // partial pivot
    let maxRow = k;
    let maxVal = Math.abs(M[k][k]);
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(M[i][k]) > maxVal) {
        maxVal = Math.abs(M[i][k]);
        maxRow = i;
      }
    }
    if (maxRow !== k) {
      const tmp = M[k];
      M[k] = M[maxRow];
      M[maxRow] = tmp;
      const tx = x[k];
      x[k] = x[maxRow];
      x[maxRow] = tx;
    }

    const pivot = M[k][k];
    if (Math.abs(pivot) < 1e-12) throw new Error('Matrix is singular or nearly singular');

    // eliminate
    for (let i = k + 1; i < n; i++) {
      const factor = M[i][k] / pivot;
      for (let j = k; j < n; j++) M[i][j] -= factor * M[k][j];
      x[i] -= factor * x[k];
    }
  }

  // back substitution
  const sol = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = x[i];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * sol[j];
    sol[i] = s / M[i][i];
  }
  return sol;
}

export default { transpose, matMult, matVecMult, solveLinearSystem };
