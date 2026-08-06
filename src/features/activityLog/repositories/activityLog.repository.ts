import connectToDatabase from '@/lib/db/mongodb';
import { ActivityLog, IActivityLog } from '../models/activityLog.model';

export class ActivityLogRepository {
  static async createLog(action: string, details: string, actor = 'SYSTEM'): Promise<IActivityLog> {
    await connectToDatabase();
    const log = new ActivityLog({ action, details, actor });
    return log.save();
  }

  static async findAll(options: { search?: string; page: number; limit: number }): Promise<{ logs: IActivityLog[]; total: number }> {
    await connectToDatabase();
    const skip = (options.page - 1) * options.limit;
    const filter: Record<string, unknown> = {};
    if (options.search) {
      filter.$or = [
        { action: { $regex: options.search, $options: 'i' } },
        { actor: { $regex: options.search, $options: 'i' } },
        { details: { $regex: options.search, $options: 'i' } },
      ];
    }
    const [logs, total] = await Promise.all([
      ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(options.limit).lean(),
      ActivityLog.countDocuments(filter),
    ]);
    return { logs, total };
  }
}

