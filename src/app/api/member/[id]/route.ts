import { NextResponse, NextRequest } from 'next/server';
import { MemberService } from '@/features/member/services/member.service';
import { handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const member = await MemberService.getMemberById(id);
    if (!member) {
      return NextResponse.json({ success: false, code: 'NOT_FOUND', message: 'Member tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: member });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal mengambil data anggota');
  }
}

export async function POST_OR_PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const member = await MemberService.updateMember(id, body);
    return NextResponse.json({ success: true, data: member });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memperbarui anggota');
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return POST_OR_PATCH(req, { params });
}
