// ...existing code...
console.log('[review-store] module loaded');

type ReviewRecord = {
  reviews: number;
  healthy: number;
  unhealthy: number;
};

type Subscriber = () => void;

const store = new Map<string, ReviewRecord>();
const subs = new Set<Subscriber>();

function notify() {
  subs.forEach((s) => s());
}

export function addReview(reviewer: string, result: 'healthy' | 'unhealthy') {
  console.log('[review-store] addReview', reviewer, result);
  if (!reviewer) return;
  const r = store.get(reviewer) ?? { reviews: 0, healthy: 0, unhealthy: 0 };
  r.reviews += 1;
  if (result === 'healthy') r.healthy += 1;
  else r.unhealthy += 1;
  store.set(reviewer, r);
  notify();
}

export function getLeaderboard() {
  const arr = Array.from(store.entries()).map(([name, rec]) => ({ name, ...rec }));
  arr.sort((a, b) => b.reviews - a.reviews);
  return arr;
}

export function subscribe(cb: Subscriber) {
  subs.add(cb);
  return () => subs.delete(cb);
}

export function resetStore() {
  store.clear();
  notify();
}

export type { ReviewRecord };
