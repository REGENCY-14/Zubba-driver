export interface TodayEarningsSummary {
  totalGHS: number;
  completedJobs: number;
  bagsCollected: number;
}

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

export async function getTodayEarningsSummary(): Promise<TodayEarningsSummary> {
  return delay({ totalGHS: 86.5, completedJobs: 4, bagsCollected: 9 });
}
