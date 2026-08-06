
import { ActivityLogRepository } from '../repositories/activityLog.repository';

export class ActivityLogService {
  static async log(action: string, details: unknown, actor = 'SYSTEM') {
    try {
      const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);
      return await ActivityLogRepository.createLog(action, detailsStr, actor);
    } catch (err) {
      console.warn('ActivityLog log warning (ignored):', err);
      return null;
    }
  }

  static async getLogs(options: { search?: string; page: number; limit: number }) {
    const { logs, total } = await ActivityLogRepository.findAll(options);
    return {
      logs: logs.map((log) => ({
        id: log._id.toString(),
        action: log.action,
        actor: log.actor,
        details: log.details,
        createdAt: log.createdAt,
      })),
      total,
      page: options.page,
      limit: options.limit,
    };
  }
}

