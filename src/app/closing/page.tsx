import { SessionService } from '@/features/session/services/session.service';
import { ClosingService } from '@/features/closing/services/closing.service';
import ClosingSummaryView from '@/features/closing/components/ClosingSummaryView';
import { SellingSession } from '@/features/session/models/session.model';
import connectToDatabase from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export default async function ClosingPage() {
  await connectToDatabase();
  
  let targetPublicId = '';
  
  // Find the active session
  const activeSession = await SessionService.getActiveSession();
  
  if (activeSession) {
    targetPublicId = activeSession.publicId;
  } else {
    // If no active session, find the most recently closed session
    const lastClosed = await SellingSession.findOne({ status: 'CLOSED' })
      .sort({ endDate: -1 })
      .lean();
      
    if (!lastClosed) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-gray-100 p-6">
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Belum Ada Sesi Penjualan</h2>
          <p className="mt-2 text-gray-500 max-w-md">
            Tidak ada sesi penjualan yang aktif saat ini, dan belum ada riwayat sesi penjualan sebelumnya.
          </p>
        </div>
      );
    }
    
    targetPublicId = lastClosed.publicId;
  }

  // Fetch the full summary for the session
  const summaryData = await ClosingService.getSummary(targetPublicId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ClosingSummaryView sessionData={summaryData} />
    </div>
  );
}
