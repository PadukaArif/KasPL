import connectToDatabase from '@/lib/db/mongodb';
import { ActivityLog, IActivityLog } from '../models/activityLog.model';

export class ActivityLogRepository {
  static async createLog(action: string, details: string, actor = 'SYSTEM'): Promise<IActivityLog> {
    await connectToDatabase();
    const log = new ActivityLog({ action, details, actor });
    return log.save();
  }
}
