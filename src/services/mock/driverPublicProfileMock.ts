// What a customer sees in the "customer selects" matching mode's driver carousel —
// mirrors the customer app's NearbyDriver shape (DRIVER_APP_HANDOFF.md §7:
// id, name, code, rating, ratingCount, isPremium, distanceM, etaMinutes) but scoped
// to just the fields this driver-facing preview needs.
export interface DriverPublicProfile {
  rating: number;
  ratingCount: number;
  code: string;
  isPremium: boolean;
  distanceKm: number;
  etaMinutes: number;
}

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

export async function getMyDriverPublicProfile(): Promise<DriverPublicProfile> {
  return delay({
    rating: 4.8,
    ratingCount: 132,
    code: 'ZB-4821',
    isPremium: true,
    distanceKm: 1.2,
    etaMinutes: 6,
  });
}
