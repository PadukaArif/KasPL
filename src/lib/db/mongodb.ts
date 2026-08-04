import mongoose from 'mongoose';
import '@/features/member/models/member.model';
import '@/features/item/models/item.model';
import '@/features/session/models/session.model';
import '@/features/inventory/models/inventory.model';
import '@/features/expense/models/expense.model';
import '@/features/transaction/models/transaction.model';
import '@/features/transaction/models/transactionDetail.model';
import '@/features/transaction/models/activityLog.model';
import '@/features/transaction/models/counter.model';




/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri as string, opts).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
