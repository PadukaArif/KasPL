import { ClientSession } from 'mongoose';
import { ActivityLog, IActivityLog } from '../models/activityLog.model';

export class ActivityLogRepository {
  static async log(data: Partial<IActivityLog>, session: ClientSession) {
    const [log] = await ActivityLog.create([data], { session });
    return log;
  }
}
