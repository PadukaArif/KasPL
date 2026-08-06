import { NextResponse, NextRequest } from 'next/server';
import { MemberService } from '@/features/member/services/member.service';
import { handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const members = await MemberService.getAllMembers(search, activeOnly);
    return NextResponse.json({ success: true, data: members });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal mengambil data anggota');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const member = await MemberService.createMember(body);
    return NextResponse.json({ success: true, message: 'Anggota kelas berhasil ditambahkan', data: member });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal menambahkan anggota');
  }
}
