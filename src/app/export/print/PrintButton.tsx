'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white shadow hover:bg-blue-700"
    >
      Print / Save as PDF
    </button>
  );
}
