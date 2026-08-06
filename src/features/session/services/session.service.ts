import mongoose from 'mongoose';
import { SessionRepository } from '../repositories/session.repository';
import { ClassMember } from '@/features/member/models/member.model';
import { startSessionSchema, StartSessionInput } from '../validators/session.validator';
import { ActivityLogService } from '@/features/activityLog/services/activityLog.service';

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
      guardians: (session.guardians as unknown as Array<{ _id?: mongoose.Types.ObjectId; publicId?: string; name?: string }>).map((g) => ({
        id: g._id ? g._id.toString() : '',
        publicId: g.publicId || '',
        name: g.name || 'Penjaga Sesi',
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

    // 4. Resolve guardian ObjectIds in a single batch query
    const validObjectIds = parsedData.guardians
      .filter((gId) => mongoose.Types.ObjectId.isValid(gId))
      .map((gId) => new mongoose.Types.ObjectId(gId));

    const members = await ClassMember.find({
      $or: [
        { _id: { $in: validObjectIds } },
        { publicId: { $in: parsedData.guardians } },
      ],
    }).select('_id publicId').lean();

    const memberMap = new Map<string, mongoose.Types.ObjectId>();
    members.forEach((m) => {
      memberMap.set(m._id.toString(), m._id as mongoose.Types.ObjectId);
      memberMap.set(m.publicId, m._id as mongoose.Types.ObjectId);
    });

    const resolvedGuardians = parsedData.guardians.map((gId) => {
      const resolvedId = memberMap.get(gId);
      if (!resolvedId) {
        throw new Error(`Anggota penjaga dengan ID ${gId} tidak ditemukan.`);
      }
      return resolvedId;
    });

    // 5. Create session
    const session = await SessionRepository.createSession({
      publicId,
      periodMonth: parsedData.periodMonth,
      periodWeek: parsedData.periodWeek,
      startDate: new Date(),
      guardians: resolvedGuardians,
    });

    await ActivityLogService.log('START_SESSION', {
      sessionId: session._id.toString(),
      publicId: session.publicId,
      periodMonth: session.periodMonth,
      periodWeek: session.periodWeek,
    });

    return session;
  }

  static async closeSession(publicId: string) {
    const session = await SessionRepository.closeSession(publicId);
    if (!session) {
      throw new Error('Sesi tidak ditemukan atau sudah ditutup');
    }

    await ActivityLogService.log('CLOSE_SESSION', {
      sessionId: session._id.toString(),
      publicId: session.publicId,
    });

    return session;
  }
}

