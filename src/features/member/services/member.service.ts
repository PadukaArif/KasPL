import { MemberRepository } from '../repositories/member.repository';

export class MemberService {
  static async getActiveMembers() {
    const members = await MemberRepository.findAllActive();
    return members.map((m) => ({
      id: m._id.toString(),
      publicId: m.publicId,
      name: m.name,
      attendanceNumber: m.attendanceNumber,
    }));
  }
}
