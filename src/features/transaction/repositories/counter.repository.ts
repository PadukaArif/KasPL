import { ClientSession } from 'mongoose';
import { Counter } from '../models/counter.model';

export class CounterRepository {
  /**
   * Atomically increments the sequence for a given name and date.
   * Ensures uniqueness and prevents race conditions.
   */
  static async getNextSequence(name: string, date: string, session: ClientSession): Promise<number> {
    const doc = await Counter.findOneAndUpdate(
      { name, date },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true, session }
    );
    return doc.sequence;
  }
}
