/**
 * Lightweight swarm runner / concurrency pool.
 * Runs tasks in parallel with a configurable concurrency limit.
 */
export async function runSwarm<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency = Math.max(1, Math.min(8, require('os').cpus ? require('os').cpus().length : 4)),
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let idx = 0;

  const runners = new Array(Math.min(concurrency, items.length)).fill(0).map(async () => {
    while (true) {
      const i = idx++;
      if (i >= items.length) break;
      try {
        results[i] = await worker(items[i], i);
      } catch (err) {
        // propagate error to caller by rethrowing asynchronously
        throw err;
      }
    }
  });

  await Promise.all(runners);
  return results;
}

export default { runSwarm };
