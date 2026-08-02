import { POSComponent } from '@/features/pos/components/POSComponent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'POS Cart Engine - KasPL',
};

export default function POSPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-[1400px]">
      <POSComponent />
    </div>
  );
}
