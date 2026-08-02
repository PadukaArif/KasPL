import { ActivityLogRepository } from '../repositories/activityLog.repository';

export class ActivityLogService {
  static async log(action: string, details: unknown, actor = 'SYSTEM') {
    const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);
    return ActivityLogRepository.createLog(action, detailsStr, actor);
  }
}
