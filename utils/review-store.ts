import AsyncStorage from '@react-native-async-storage/async-storage';

type ReviewRecord = {
  reviews: number;
  correct: number;
};

type Subscriber = () => void;

const store = new Map<string, ReviewRecord>();
const subs = new Set<Subscriber>();
const STORAGE_KEY = 'bteam:review-store:v1';

async function loadStore() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const arr = JSON.parse(raw) as Array<[string, ReviewRecord]>;
    arr.forEach(([name, rec]) => store.set(name, rec));
    notify();
  } catch (e) {
    console.warn('[review-store] failed to load store', e);
  }
}

async function saveStore() {
  try {
    const arr = Array.from(store.entries());
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.warn('[review-store] failed to save store', e);
  }
}

function notify() {
  subs.forEach((s) => s());
}

export function recordSession(reviewer: string, correctCount: number, reviewedCount: number) {
  if (correctCount == 0 || reviewedCount == 0) return;
  if (!reviewer) return;
  const r = store.get(reviewer) ?? { reviews: 0, correct: 0 };

  const prevBestCorrect = r.correct ?? 0;
  const prevBestReviewed = r.reviews ?? 0;
  const better =
    correctCount > prevBestCorrect || (correctCount === prevBestCorrect && reviewedCount < prevBestReviewed);
  if (better) {
    r.correct = correctCount;
    r.reviews = reviewedCount;
  }

  store.set(reviewer, r);
  notify();
  void saveStore();
}

export function getLeaderboard() {
  const arr = Array.from(store.entries()).map(([name, rec]) => ({ name, ...rec }));
  // Sort by best session: bestCorrect desc, then bestReviewed asc (fewer reviews preferred)
  arr.sort((a, b) => {
    const aBest = a.correct ?? 0;
    const bBest = b.correct ?? 0;
    if (bBest !== aBest) return bBest - aBest;
    const aReviewed = a.reviews ?? Number.MAX_SAFE_INTEGER;
    const bReviewed = b.reviews ?? Number.MAX_SAFE_INTEGER;
    return aReviewed - bReviewed;
  });
  return arr;
}

export function subscribe(cb: Subscriber) {
  subs.add(cb);
  return () => subs.delete(cb);
}

export function resetStore() {
  store.clear();
  notify();
  void AsyncStorage.removeItem(STORAGE_KEY).catch((e: unknown) => console.warn('[review-store] removeItem failed', e));
}

// load persisted store on module init
void loadStore();

export type { ReviewRecord };

