import connectToDatabase from '@/lib/db/mongodb';
import { ClassMember, IClassMember } from '../models/member.model';
import { ServiceError } from '@/utils/errors';

export class MemberService {
  static async getActiveMembers(): Promise<IClassMember[]> {
    await connectToDatabase();
    return ClassMember.find({ isActive: true }).sort({ attendanceNumber: 1 }).lean();
  }

  static async getAllMembers(search?: string, activeOnly = false): Promise<IClassMember[]> {
    await connectToDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (activeOnly) query.isActive = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { publicId: { $regex: search, $options: 'i' } },
      ];
    }
    return ClassMember.find(query).sort({ attendanceNumber: 1 }).lean();
  }

  static async getMemberById(id: string): Promise<IClassMember | null> {
    await connectToDatabase();
    return ClassMember.findById(id).lean();
  }

  static async createMember(data: { name: string; attendanceNumber: number; isActive?: boolean }): Promise<IClassMember> {
    await connectToDatabase();

    const existingNo = await ClassMember.findOne({ attendanceNumber: data.attendanceNumber }).lean();
    if (existingNo) {
      throw new ServiceError(`Nomor absen ${data.attendanceNumber} sudah digunakan.`, 'DUPLICATE_ATTENDANCE');
    }

    const padNo = String(data.attendanceNumber).padStart(2, '0');
    const publicId = `MBR-${padNo}`;

    const member = await ClassMember.create({
      publicId,
      name: data.name,
      attendanceNumber: data.attendanceNumber,
      isActive: data.isActive ?? true,
    });

    return member;
  }

  static async updateMember(id: string, data: { name?: string; attendanceNumber?: number; isActive?: boolean }): Promise<IClassMember> {
    await connectToDatabase();

    const member = await ClassMember.findById(id);
    if (!member) {
      throw new ServiceError('Anggota kelas tidak ditemukan.', 'NOT_FOUND');
    }

    if (data.attendanceNumber !== undefined && data.attendanceNumber !== member.attendanceNumber) {
      const existingNo = await ClassMember.findOne({ attendanceNumber: data.attendanceNumber }).lean();
      if (existingNo) {
        throw new ServiceError(`Nomor absen ${data.attendanceNumber} sudah digunakan.`, 'DUPLICATE_ATTENDANCE');
      }
      member.attendanceNumber = data.attendanceNumber;
      const padNo = String(data.attendanceNumber).padStart(2, '0');
      member.publicId = `MBR-${padNo}`;
    }

    if (data.name !== undefined) member.name = data.name;
    if (data.isActive !== undefined) member.isActive = data.isActive;

    await member.save();
    return member;
  }
}
