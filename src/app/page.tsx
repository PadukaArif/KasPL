import { redirect } from 'next/navigation';
import { SessionService } from '@/features/session/services/session.service';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const activeSession = await SessionService.getActiveSession();
  
  if (activeSession) {
    redirect('/dashboard');
  } else {
    redirect('/session/start');
  }
}
