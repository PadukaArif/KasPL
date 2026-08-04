import { z } from 'zod';

export interface GuardianData {
  publicId: string;
  name: string;
}

export interface ShareData {
  schoolShare: number;
  classShare: number;
}

export interface ClosingSummary {
  revenue: number;
  cost: number;
  grossProfit: number;
  expense: number;
  netProfit: number;
  itemsSold: number;
  transactionsCount: number;
  remainingStock: number;
  schoolShare: number;
  classShare: number;
  share: ShareData;
}

export interface ClosingSessionData {
  sessionId: string;
  sessionPublicId: string;
  periodMonth: number;
  periodWeek: number;
  startDate?: string | Date;
  endDate?: string | Date | null;
  status: 'ACTIVE' | 'CLOSED';
  guardians: GuardianData[];
  summary: ClosingSummary;
}

export const closeSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export type CloseSessionInput = z.infer<typeof closeSessionSchema>;

