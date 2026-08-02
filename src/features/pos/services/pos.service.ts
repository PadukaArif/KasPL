import { POSRepository } from '../repositories/pos.repository';
import { SessionService } from '@/features/session/services/session.service';
import { ServiceError } from '@/utils/errors';

export class POSService {
  /**
   * Get all sellable inventory items for the currently active session.
   */
  static async getSellableItems() {
    const activeSession = await SessionService.getActiveSession();

    if (!activeSession) {
      // Returning empty list or throwing? Let's return empty list and let UI handle it,
      // or throw an error. The API layer will catch it.
      throw new ServiceError('No active session found.', 'NO_ACTIVE_SESSION');
    }

    return POSRepository.getSellableItems(activeSession.id);
  }
}
