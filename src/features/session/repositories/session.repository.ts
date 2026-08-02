import connectToDatabase from '@/lib/db/mongodb';
import { SellingSession, ISellingSession } from '../models/session.model';

export class SessionRepository {
  static async findActiveSession(): Promise<ISellingSession | null> {
    await connectToDatabase();
    return SellingSession.findOne({ status: 'ACTIVE' }).populate('guardians');
  }

  static async findActiveSessionByPeriod(month: number, week: number): Promise<ISellingSession | null> {
    await connectToDatabase();
    return SellingSession.findOne({ periodMonth: month, periodWeek: week, status: 'ACTIVE' });
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
    );
  }

  static async count(): Promise<number> {
    await connectToDatabase();
    return SellingSession.countDocuments();
  }
}
