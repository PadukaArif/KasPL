import { NextResponse } from 'next/server';
import { MemberService } from '@/features/member/services/member.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const members = await MemberService.getActiveMembers();
    return NextResponse.json({ success: true, data: members });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
