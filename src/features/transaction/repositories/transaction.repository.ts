import { ClientSession } from 'mongoose';
import { Transaction, ITransaction } from '../models/transaction.model';
import { TransactionDetail, ITransactionDetail } from '../models/transactionDetail.model';
import connectToDatabase from '@/lib/db/mongodb';

export interface TransactionQueryFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class TransactionRepository {
  static async createTransaction(
    headerData: Partial<ITransaction>,
    detailsData: Array<Partial<ITransactionDetail>>,
    session: ClientSession
  ) {
    const [header] = await Transaction.create([headerData], { session });

    const detailsToInsert = detailsData.map((d) => ({
      ...d,
      transactionId: header._id,
    }));

    const details = await TransactionDetail.insertMany(detailsToInsert, { session });

    return { header, details };
  }

  static async findPaginated(filters: TransactionQueryFilters) {
    await connectToDatabase();

    const { search, startDate, endDate, status, page = 1, limit = 10 } = filters;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { publicId: { $regex: search, $options: 'i' } },
        { cashierName: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.businessDate = {};
      if (startDate) query.businessDate.$gte = startDate;
      if (endDate) query.businessDate.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Transaction.countDocuments(query),
    ]);

    return { items, total };
  }

  static async getDetailsByTransactionId(transactionId: string) {
    await connectToDatabase();
    return TransactionDetail.find({ transactionId }).lean();
  }
}
