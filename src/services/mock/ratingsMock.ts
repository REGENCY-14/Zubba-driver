export interface RatingsSummary {
  averageRating: number;
  totalRatings: number;
  acceptanceRate: number; // 0-100
  completionRate: number; // 0-100
  onTimeRate: number; // 0-100
}

export interface JobFeedback {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  date: string; // ISO
}

function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

export async function getRatingsSummary(): Promise<RatingsSummary> {
  return delay({
    averageRating: 4.8,
    totalRatings: 132,
    acceptanceRate: 96,
    completionRate: 99,
    onTimeRate: 92,
  });
}

const MOCK_FEEDBACK: JobFeedback[] = [
  {
    id: 'fb-1',
    customerName: 'Nana Adjei',
    rating: 5,
    comment: 'Right on time and very friendly!',
    date: '2026-07-30T10:15:00.000Z',
  },
  {
    id: 'fb-2',
    customerName: 'Abena Darko',
    rating: 5,
    comment: 'Handled the bags carefully.',
    date: '2026-07-29T16:40:00.000Z',
  },
  {
    id: 'fb-3',
    customerName: 'Kojo Mensah',
    rating: 3,
    comment: 'Arrived a bit later than the ETA.',
    date: '2026-07-28T08:05:00.000Z',
  },
  {
    id: 'fb-4',
    customerName: 'Ama Boateng',
    rating: 5,
    comment: null,
    date: '2026-07-25T09:30:00.000Z',
  },
];

export async function getJobFeedback(): Promise<JobFeedback[]> {
  return delay(MOCK_FEEDBACK);
}
