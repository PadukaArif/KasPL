import { SessionRepository } from '../repositories/session.repository';
import { startSessionSchema, StartSessionInput } from '../validators/session.validator';

export class SessionService {
  static async getActiveSession() {
    const session = await SessionRepository.findActiveSession();
    if (!session) return null;
    
    // Lean output
    return {
      id: session._id.toString(),
      publicId: session.publicId,
      periodMonth: session.periodMonth,
      periodWeek: session.periodWeek,
      startDate: session.startDate,
      status: session.status,
      guardians: (session.guardians as unknown as Array<{ publicId: string; name: string }>).map((g) => ({
        publicId: g.publicId,
        name: g.name,
      })),
    };
  }

  static async startSession(data: StartSessionInput) {
    // 1. Validation
    const parsedData = startSessionSchema.parse(data);

    // 2. Check if there's already an active session globally
    const existingGlobalActive = await SessionRepository.findActiveSession();
    if (existingGlobalActive) {
      throw new Error('Masih ada sesi penjualan yang aktif. Tutup sesi sebelumnya terlebih dahulu.');
    }

    // 3. Generate public ID
    const count = await SessionRepository.count();
    const publicId = `KSP-SESSION-${String(count + 1).padStart(4, '0')}`;

    // 4. Create session
    const session = await SessionRepository.createSession({
      publicId,
      periodMonth: parsedData.periodMonth,
      periodWeek: parsedData.periodWeek,
      startDate: new Date(),
      guardians: parsedData.guardians as unknown as import('mongoose').Types.ObjectId[],
    });

    return session;
  }

  static async closeSession(publicId: string) {
    const session = await SessionRepository.closeSession(publicId);
    if (!session) {
      throw new Error('Sesi tidak ditemukan atau sudah ditutup');
    }
    return session;
  }
}
