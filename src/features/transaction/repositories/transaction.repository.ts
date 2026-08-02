import { ClientSession } from 'mongoose';
import { Transaction, ITransaction } from '../models/transaction.model';
import { TransactionDetail, ITransactionDetail } from '../models/transactionDetail.model';

export class TransactionRepository {
  static async createTransaction(
    headerData: Partial<ITransaction>,
    detailsData: Array<Partial<ITransactionDetail>>,
    session: ClientSession
  ) {
    // Insert header
    const [header] = await Transaction.create([headerData], { session });

    // Link details to header
    const detailsToInsert = detailsData.map((d) => ({
      ...d,
      transactionId: header._id,
    }));

    // Insert details
    const details = await TransactionDetail.insertMany(detailsToInsert, { session });

    return { header, details };
  }
}
