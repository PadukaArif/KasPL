import connectToDatabase from '@/lib/db/mongodb';
import { ClassMember, IClassMember } from '../models/member.model';

export class MemberRepository {
  static async findAllActive(): Promise<IClassMember[]> {
    await connectToDatabase();
    return ClassMember.find({ isActive: true }).sort({ attendanceNumber: 1 }).lean();
  }

  static async findByPublicId(publicId: string): Promise<IClassMember | null> {
    await connectToDatabase();
    return ClassMember.findOne({ publicId }).lean();
  }

  static async count(): Promise<number> {
    await connectToDatabase();
    return ClassMember.countDocuments();
  }
}
