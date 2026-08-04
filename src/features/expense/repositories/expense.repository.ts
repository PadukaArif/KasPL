import connectToDatabase from '@/lib/db/mongodb';
import { Expense, IExpense } from '../models/expense.model';
import mongoose from 'mongoose';

export class ExpenseRepository {
  static async findAll(options: {
    search?: string;
    category?: string;
    sessionId?: string;
    startDate?: string;
    endDate?: string;
    skip: number;
    limit: number;
  }): Promise<{ expenses: IExpense[]; total: number }> {
    await connectToDatabase();
    const filter: {
      deletedAt: null | Date;
      category?: IExpense['category'];
      sessionId?: import('mongoose').Types.ObjectId;
      expenseDate?: {
        $gte?: Date;
        $lte?: Date;
      };
      $or?: Array<{ title?: { $regex: string; $options: string }; publicId?: { $regex: string; $options: string } }>;
    } = { deletedAt: null };
    
    if (options.category && options.category !== 'ALL') {
      filter.category = options.category as IExpense['category'];
    }
    
    if (options.sessionId) {
      filter.sessionId = new mongoose.Types.ObjectId(options.sessionId);
    }
    
    if (options.search) {
      filter.$or = [
        { title: { $regex: options.search, $options: 'i' } },
        { publicId: { $regex: options.search, $options: 'i' } },
      ];
    }
    
    if (options.startDate || options.endDate) {
      filter.expenseDate = {};
      if (options.startDate) {
        const d = new Date(options.startDate);
        d.setHours(0, 0, 0, 0);
        filter.expenseDate.$gte = d;
      }
      if (options.endDate) {
        const d = new Date(options.endDate);
        d.setHours(23, 59, 59, 999);
        filter.expenseDate.$lte = d;
      }
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .sort({ expenseDate: -1, createdAt: -1 })
        .skip(options.skip)
        .limit(options.limit)
        .lean(),
      Expense.countDocuments(filter),
    ]);

    return { expenses: expenses as unknown as IExpense[], total };
  }

  static async findById(id: string): Promise<IExpense | null> {
    await connectToDatabase();
    return Expense.findOne({ _id: id, deletedAt: null }).lean() as Promise<IExpense | null>;
  }

  static async findByPublicId(publicId: string): Promise<IExpense | null> {
    await connectToDatabase();
    return Expense.findOne({ publicId, deletedAt: null }).lean() as Promise<IExpense | null>;
  }

  static async findBySession(sessionId: string): Promise<IExpense[]> {
    await connectToDatabase();
    return Expense.find({ sessionId, deletedAt: null }).sort({ expenseDate: -1 }).lean() as unknown as Promise<IExpense[]>;
  }

  static async create(data: Partial<IExpense>): Promise<IExpense> {
    await connectToDatabase();
    const expense = new Expense(data);
    return expense.save();
  }

  static async update(id: string, data: Partial<IExpense>): Promise<IExpense | null> {
    await connectToDatabase();
    return Expense.findOneAndUpdate({ _id: id, deletedAt: null }, data, { new: true });
  }

  static async softDelete(id: string): Promise<IExpense | null> {
    await connectToDatabase();
    return Expense.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
  }

  static async count(): Promise<number> {
    await connectToDatabase();
    return Expense.countDocuments();
  }

  static async summary(options: {
    sessionId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalExpense: number;
    expenseCount: number;
    groupedByCategory: { category: string; total: number; count: number }[];
  }> {
    await connectToDatabase();
    const filter: {
      deletedAt: null | Date;
      sessionId?: mongoose.Types.ObjectId;
      expenseDate?: {
        $gte?: Date;
        $lte?: Date;
      };
    } = { deletedAt: null };
    
    if (options.sessionId) {
      filter.sessionId = new mongoose.Types.ObjectId(options.sessionId);
    }
    
    if (options.startDate || options.endDate) {
      filter.expenseDate = {};
      if (options.startDate) filter.expenseDate.$gte = options.startDate;
      if (options.endDate) filter.expenseDate.$lte = options.endDate;
    }

    const result = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        }
      },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: '$total' },
          expenseCount: { $sum: '$count' },
          groupedByCategory: {
            $push: {
              category: '$_id',
              total: '$total',
              count: '$count'
            }
          }
        }
      }
    ]);

    if (result.length === 0) {
      return {
        totalExpense: 0,
        expenseCount: 0,
        groupedByCategory: []
      };
    }

    return {
      totalExpense: result[0].totalExpense,
      expenseCount: result[0].expenseCount,
      groupedByCategory: result[0].groupedByCategory
    };
  }
}
