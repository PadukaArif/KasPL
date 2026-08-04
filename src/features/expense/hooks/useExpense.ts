import { useState, useCallback } from 'react';

export interface Expense {
  id: string;
  publicId: string;
  title: string;
  category: 'OPERATIONAL' | 'RAW_MATERIAL' | 'EQUIPMENT' | 'OTHER';
  amount: number;
  notes?: string;
  expenseDate: string;
  createdAt: string;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async (params: { search?: string; category?: string; startDate?: string; endDate?: string; page: number; limit: number }) => {
    setLoading(true);
    setError(null);
    try {
      const urlParams = new URLSearchParams();
      if (params.search) urlParams.append('search', params.search);
      if (params.category && params.category !== 'ALL') urlParams.append('category', params.category);
      if (params.startDate) urlParams.append('startDate', params.startDate);
      if (params.endDate) urlParams.append('endDate', params.endDate);
      urlParams.append('page', String(params.page));
      urlParams.append('limit', String(params.limit));

      const res = await fetch(`/api/expense?${urlParams.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setExpenses(data.data.expenses);
        setTotal(data.data.total);
      } else {
        setError(data.message || 'Gagal memuat data pengeluaran');
      }
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  }, []);

  return { expenses, total, loading, error, fetchExpenses };
}

export function useExpenseSummary() {
  const [summary, setSummary] = useState({
    today: 0,
    thisWeek: 0,
    activeSession: 0,
    count: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/expense/summary');
      const data = await res.json();
      if (data.success) {
        setSummary(data.data);
      } else {
        setError(data.message || 'Gagal memuat ringkasan');
      }
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  }, []);

  return { summary, loading, error, fetchSummary };
}
