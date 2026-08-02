// Shaped like what a real `GET /drivers/jobs/incoming` (broadcast push) and
// `PATCH /drivers/jobs/:id/respond` will eventually look like — see
// DRIVER_APP_HANDOFF.md §7 on the customer app's already-live /drivers/nearby
// and request-status endpoints, which this should end up satisfying.
export interface IncomingJobRequest {
  id: string;
  customerName: string;
  pickupAddress: string;
  distanceKm: number;
  etaMinutes: number;
  estimatedPay: number;
  bagsEstimate: number;
}

function delay<T>(value: T, ms = 900): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

const MOCK_CUSTOMER_NAMES = ['Ama Boateng', 'Kwame Owusu', 'Efua Mensah', 'Yaw Asante'];
const MOCK_ADDRESSES = [
  '12 Oyibi Link, East Legon',
  'Spintex Rd, near Palace Mall',
  'Adenta Housing Down, Block C',
  'Dzorwulu Highway, opp. Shell',
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export async function getIncomingJobRequest(): Promise<IncomingJobRequest> {
  return delay({
    id: `req-${Math.floor(Math.random() * 9000 + 1000)}`,
    customerName: pick(MOCK_CUSTOMER_NAMES),
    pickupAddress: pick(MOCK_ADDRESSES),
    distanceKm: Number((Math.random() * 3 + 0.5).toFixed(1)),
    etaMinutes: Math.floor(Math.random() * 8 + 3),
    estimatedPay: Number((Math.random() * 15 + 15).toFixed(2)),
    bagsEstimate: Math.floor(Math.random() * 3 + 1),
  });
}

export async function respondToJobRequest(
  id: string,
  response: 'accept' | 'decline'
): Promise<{ status: 'accepted' | 'declined' }> {
  return delay({ status: response === 'accept' ? 'accepted' : 'declined' }, 400);
}

// --- Jobs list (Active / Upcoming / History) ---------------------------------

export type JobStatus = 'en_route' | 'arrived' | 'scheduled' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  customerName: string;
  pickupAddress: string;
  status: JobStatus;
  distanceKm: number;
  etaMinutes: number;
  estimatedPay: number;
  bags: number | null;
  /** The 4-digit handshake code the customer shows the driver (customer app's DriverArrivesScreen). */
  collectionCode: string;
  scheduledFor?: string; // ISO — only for 'scheduled'
  completedAt?: string; // ISO — only for 'completed' | 'cancelled'
  amountEarned?: number; // only for 'completed'
}

// Fixed seed data (not randomized) so History/Upcoming read consistently across
// runs, matching the customer app's MOCK_<PLURAL_NOUN> convention
// (DRIVER_APP_HANDOFF.md §7) — mutated in place by updateJobStatus below to act
// as a tiny in-memory mock DB for the session.
const MOCK_JOBS: Job[] = [
  {
    id: 'job-1',
    customerName: 'Ama Boateng',
    pickupAddress: '12 Oyibi Link, East Legon',
    status: 'en_route',
    distanceKm: 1.4,
    etaMinutes: 6,
    estimatedPay: 22.0,
    bags: null,
    collectionCode: '8249',
  },
  {
    id: 'job-2',
    customerName: 'Kwame Owusu',
    pickupAddress: 'Spintex Rd, near Palace Mall',
    status: 'en_route',
    distanceKm: 2.8,
    etaMinutes: 11,
    estimatedPay: 18.5,
    bags: null,
    collectionCode: '3067',
  },
  {
    id: 'job-3',
    customerName: 'Efua Mensah',
    pickupAddress: 'Adenta Housing Down, Block C',
    status: 'scheduled',
    distanceKm: 3.2,
    etaMinutes: 14,
    estimatedPay: 20.0,
    bags: null,
    collectionCode: '5512',
    scheduledFor: '2026-08-04T09:00:00.000Z',
  },
  {
    id: 'job-4',
    customerName: 'Yaw Asante',
    pickupAddress: 'Dzorwulu Highway, opp. Shell',
    status: 'scheduled',
    distanceKm: 1.9,
    etaMinutes: 8,
    estimatedPay: 25.0,
    bags: null,
    collectionCode: '9284',
    scheduledFor: '2026-08-06T14:30:00.000Z',
  },
  {
    id: 'job-5',
    customerName: 'Nana Adjei',
    pickupAddress: 'Labone Ave, near GIS',
    status: 'completed',
    distanceKm: 2.1,
    etaMinutes: 9,
    estimatedPay: 19.0,
    amountEarned: 19.0,
    bags: 2,
    collectionCode: '1145',
    completedAt: '2026-07-30T10:15:00.000Z',
  },
  {
    id: 'job-6',
    customerName: 'Abena Darko',
    pickupAddress: 'Tesano Rd, near CMB',
    status: 'completed',
    distanceKm: 1.6,
    etaMinutes: 7,
    estimatedPay: 16.5,
    amountEarned: 16.5,
    bags: 1,
    collectionCode: '7702',
    completedAt: '2026-07-29T16:40:00.000Z',
  },
  {
    id: 'job-7',
    customerName: 'Kojo Mensah',
    pickupAddress: 'Achimota Retail Centre',
    status: 'cancelled',
    distanceKm: 3.0,
    etaMinutes: 12,
    estimatedPay: 21.0,
    bags: null,
    collectionCode: '4420',
    completedAt: '2026-07-28T08:05:00.000Z',
  },
];

export async function getActiveJobs(): Promise<Job[]> {
  return delay(
    MOCK_JOBS.filter(j => j.status === 'en_route' || j.status === 'arrived'),
    500
  );
}

export async function getUpcomingJobs(): Promise<Job[]> {
  return delay(
    MOCK_JOBS.filter(j => j.status === 'scheduled'),
    500
  );
}

export async function getJobHistory(): Promise<Job[]> {
  return delay(
    MOCK_JOBS.filter(j => j.status === 'completed' || j.status === 'cancelled'),
    500
  );
}

export async function getJobById(id: string): Promise<Job | undefined> {
  return delay(
    MOCK_JOBS.find(j => j.id === id),
    300
  );
}

export async function updateJobStatus(id: string, status: JobStatus): Promise<{ status: JobStatus }> {
  const job = MOCK_JOBS.find(j => j.id === id);
  if (job) job.status = status;
  return delay({ status }, 400);
}

// --- Collection-code handshake + material logging -----------------------------

export async function verifyCollectionCode(jobId: string, code: string): Promise<{ valid: boolean }> {
  const job = MOCK_JOBS.find(j => j.id === jobId);
  return delay({ valid: !!job && job.collectionCode === code }, 500);
}

export interface PickupLogResult {
  bags: number;
  weightKg: number;
  amountEarned: number;
}

// In a real backend this bag/weight submission is what actually calculates the
// customer's Eco-Points/mass_recycled (DRIVER_APP_HANDOFF.md §7) — here it just
// marks the job completed and echoes back the job's estimated pay as earnings.
export async function submitPickupLog(jobId: string, bags: number, weightKg: number): Promise<PickupLogResult> {
  const job = MOCK_JOBS.find(j => j.id === jobId);
  const amountEarned = job?.estimatedPay ?? bags * 8;
  if (job) {
    job.status = 'completed';
    job.bags = bags;
    job.amountEarned = amountEarned;
    job.completedAt = new Date().toISOString();
  }
  return delay({ bags, weightKg, amountEarned }, 700);
}

// --- Earnings breakdown --------------------------------------------------------

export type EarningsPeriod = 'today' | 'week' | 'month';

function isWithinPeriod(dateIso: string, period: EarningsPeriod): boolean {
  const date = new Date(dateIso);
  const now = new Date();
  if (period === 'today') return date.toDateString() === now.toDateString();
  const diffDays = (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000);
  return period === 'week' ? diffDays >= 0 && diffDays <= 7 : diffDays >= 0 && diffDays <= 30;
}

// Reuses the same MOCK_JOBS completed entries as the Jobs > History tab rather
// than a second, divergent mock dataset — one source of truth for "what this
// driver has completed."
export async function getEarningsBreakdown(period: EarningsPeriod): Promise<Job[]> {
  return delay(
    MOCK_JOBS.filter(j => j.status === 'completed' && j.completedAt && isWithinPeriod(j.completedAt, period)),
    500
  );
}
