import { ExpenseRepository } from '../repositories/expense.repository';
import { createExpenseSchema, updateExpenseSchema, CreateExpenseInput, UpdateExpenseInput } from '../validators/expense.validator';
import { ActivityLogService } from '@/features/activityLog/services/activityLog.service';
import { SessionService } from '@/features/session/services/session.service';
import mongoose from 'mongoose';

export class ExpenseServiceError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, ExpenseServiceError.prototype);
  }
}

export class ExpenseService {
  static async getExpenses(options: { search?: string; category?: string; startDate?: string; endDate?: string; page: number; limit: number }) {
    const skip = (options.page - 1) * options.limit;
    const { expenses, total } = await ExpenseRepository.findAll({
      search: options.search,
      category: options.category,
      startDate: options.startDate,
      endDate: options.endDate,
      skip,
      limit: options.limit,
    });

    return {
      expenses: expenses.map((exp) => ({
        id: exp._id.toString(),
        publicId: exp.publicId,
        title: exp.title,
        category: exp.category,
        amount: exp.amount,
        notes: exp.notes,
        expenseDate: exp.expenseDate,
        createdAt: exp.createdAt,
      })),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  static async getExpenseById(id: string) {
    const expense = await ExpenseRepository.findById(id);
    if (!expense) {
      throw new ExpenseServiceError('Pengeluaran tidak ditemukan', 'EXPENSE_NOT_FOUND');
    }
    return {
      id: expense._id.toString(),
      publicId: expense.publicId,
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      notes: expense.notes,
      expenseDate: expense.expenseDate,
    };
  }

  static async getExpense(id: string) {
    return this.getExpenseById(id);
  }

  static async getExpensesBySession(sessionId: string) {
    const expenses = await ExpenseRepository.findBySession(sessionId);
    return expenses.map((exp) => ({
      id: exp._id.toString(),
      publicId: exp.publicId,
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      notes: exp.notes,
      expenseDate: exp.expenseDate,
      createdAt: exp.createdAt,
    }));
  }

  static async getExpenseSummary() {
    // 1. Get current active session
    const activeSession = await SessionService.getActiveSession();
    
    // 2. Calculate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as start of week
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // 3. Get summaries concurrently
    const [todaySummary, weekSummary, sessionSummary] = await Promise.all([
      ExpenseRepository.summary({ startDate: today, endDate: endOfToday }),
      ExpenseRepository.summary({ startDate: startOfWeek, endDate: endOfWeek }),
      activeSession ? ExpenseRepository.summary({ sessionId: activeSession.id }) : Promise.resolve({ totalExpense: 0, expenseCount: 0, groupedByCategory: [] }),
    ]);

    return {
      today: todaySummary.totalExpense,
      thisWeek: weekSummary.totalExpense,
      activeSession: sessionSummary.totalExpense,
      count: sessionSummary.expenseCount,
    };
  }

  static async createExpense(data: CreateExpenseInput) {
    // 1. Zod Validation
    const parsed = createExpenseSchema.parse(data);

    // 2. Ensure there's an active session
    const activeSession = await SessionService.getActiveSession();
    if (!activeSession) {
      throw new ExpenseServiceError('Tidak ada sesi penjualan yang aktif. Pengeluaran hanya bisa ditambahkan saat sesi aktif.', 'NO_ACTIVE_SESSION');
    }

    // 3. Generate public ID
    const count = await ExpenseRepository.count();
    const publicId = `KSP-EXP-${String(count + 1).padStart(6, '0')}`;

    // 4. Save
    const expense = await ExpenseRepository.create({
      ...parsed,
      publicId,
      sessionId: activeSession.id as unknown as mongoose.Types.ObjectId,
      expenseDate: parsed.expenseDate ? new Date(parsed.expenseDate) : new Date(),
    });

    // 5. Activity Log
    await ActivityLogService.log('CREATE_EXPENSE', {
      expenseId: expense._id.toString(),
      publicId: expense.publicId,
      title: expense.title,
      amount: expense.amount,
      sessionId: activeSession.id,
    });

    return expense;
  }

  static async updateExpense(id: string, data: UpdateExpenseInput) {
    // 1. Zod Validation
    const parsed = updateExpenseSchema.parse(data);

    // 2. Fetch current expense
    const current = await ExpenseRepository.findById(id);
    if (!current) {
      throw new ExpenseServiceError('Pengeluaran tidak ditemukan', 'EXPENSE_NOT_FOUND');
    }

    // 3. Ensure the associated session is still active
    const activeSession = await SessionService.getActiveSession();
    if (!activeSession || activeSession.id !== current.sessionId.toString()) {
      throw new ExpenseServiceError('Sesi penjualan sudah ditutup. Pengeluaran tidak dapat diubah.', 'SESSION_CLOSED');
    }

    // 4. Update
    const updateData: import('../models/expense.model').IExpense | Record<string, unknown> = { ...parsed };
    if (parsed.expenseDate) {
      updateData.expenseDate = new Date(parsed.expenseDate);
    }

    const updated = await ExpenseRepository.update(id, updateData);

    // 5. Activity Log
    if (updated) {
      await ActivityLogService.log('UPDATE_EXPENSE', {
        expenseId: updated._id.toString(),
        publicId: updated.publicId,
        changes: parsed,
      });
    }

    return updated;
  }

  static async deleteExpense(id: string) {
    // 1. Fetch current expense
    const current = await ExpenseRepository.findById(id);
    if (!current) {
      throw new ExpenseServiceError('Pengeluaran tidak ditemukan', 'EXPENSE_NOT_FOUND');
    }

    // 2. Ensure the associated session is still active
    const activeSession = await SessionService.getActiveSession();
    if (!activeSession || activeSession.id !== current.sessionId.toString()) {
      throw new ExpenseServiceError('Sesi penjualan sudah ditutup. Pengeluaran tidak dapat dihapus.', 'SESSION_CLOSED');
    }

    // 3. Soft Delete
    const deleted = await ExpenseRepository.softDelete(id);

    // 4. Activity Log
    if (deleted) {
      await ActivityLogService.log('DELETE_EXPENSE', {
        expenseId: deleted._id.toString(),
        publicId: deleted.publicId,
        title: deleted.title,
      });
    }

    return deleted;
  }
}
