import connectToDatabase from '@/lib/db/mongodb';
import { SellingSession, ISellingSession } from '../models/session.model';

export class SessionRepository {
  static async findActiveSession(): Promise<ISellingSession | null> {
    await connectToDatabase();
    return SellingSession.findOne({ status: 'ACTIVE' }).populate('guardians').lean();
  }

  static async findActiveSessionByPeriod(month: number, week: number): Promise<ISellingSession | null> {
    await connectToDatabase();
    return SellingSession.findOne({ periodMonth: month, periodWeek: week, status: 'ACTIVE' }).lean();
  }

  static async createSession(data: Partial<ISellingSession>): Promise<ISellingSession> {
    await connectToDatabase();
    const session = new SellingSession(data);
    return session.save();
  }

  static async closeSession(sessionId: string): Promise<ISellingSession | null> {
    await connectToDatabase();
    return SellingSession.findOneAndUpdate(
      { publicId: sessionId, status: 'ACTIVE' },
      { status: 'CLOSED', endDate: new Date() },
      { new: true }
    ).lean();
  }

  static async count(): Promise<number> {
    await connectToDatabase();
    return SellingSession.countDocuments();
  }
}
