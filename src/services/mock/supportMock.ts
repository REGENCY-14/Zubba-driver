export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export type IssueCategory = 'payment' | 'vehicle' | 'customer_behavior' | 'app_bug' | 'other';

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

const MOCK_FAQS: Faq[] = [
  {
    id: 'faq-1',
    question: 'How do I get paid?',
    answer:
      'Completed pickups add to your wallet balance. Withdraw anytime from Earnings > Withdraw to MTN MoMo, Telecel Cash, Airtel Money, or your bank account.',
  },
  {
    id: 'faq-2',
    question: 'What happens if I miss a job request?',
    answer:
      "Broadcast requests expire after their countdown if you don't respond — the request is offered to another nearby driver.",
  },
  {
    id: 'faq-3',
    question: 'How is my rating calculated?',
    answer:
      'Your rating is the average of customer feedback across service, professionalism, and care for recyclables, shown in Settings > Ratings & performance.',
  },
  {
    id: 'faq-4',
    question: 'Can I re-submit KYC documents?',
    answer: 'Yes — go to Settings > Vehicle & documents to update your Ghana Card, license, or vehicle photo.',
  },
];

export async function getFaqs(): Promise<Faq[]> {
  return delay(MOCK_FAQS);
}

export async function submitIssueReport(
  category: IssueCategory,
  description: string
): Promise<{ ticketRef: string }> {
  return delay({ ticketRef: `TCK-${Math.floor(Math.random() * 90000 + 10000)}` }, 700);
}
