import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db/mongodb';
import { SellingSession } from '@/features/session/models/session.model';
import { Transaction } from '@/features/transaction/models/transaction.model';
import { Expense } from '@/features/expense/models/expense.model';
import { DailyInventory } from '@/features/inventory/models/inventory.model';
import { ClosingService } from './closing.service';
import { ServiceError } from '@/utils/errors';
import ExcelJS from 'exceljs';

export class ExportService {
  static async getExportData(sessionId: string) {
    await connectToDatabase();

    const session = await SellingSession.findById(sessionId).populate('guardians');
    if (!session) {
      throw new ServiceError('Sesi tidak ditemukan', 'SESSION_NOT_FOUND');
    }

    const [transactions, expenses, inventories] = await Promise.all([
      Transaction.find({ sessionId: new mongoose.Types.ObjectId(sessionId) }).sort({ createdAt: 1 }),
      Expense.find({ sessionId: new mongoose.Types.ObjectId(sessionId), deletedAt: null }).sort({ expenseDate: 1 }),
      DailyInventory.find({ sessionId: new mongoose.Types.ObjectId(sessionId) }).sort({ itemNameSnapshot: 1 }),
    ]);

    let summary = session.summary;
    if (!summary) {
      // If not closed, calculate dynamically
      summary = await ClosingService.calculateSummary(sessionId);
    }

    return {
      session,
      transactions,
      expenses,
      inventories,
      summary,
    };
  }

  static async generateExcel(sessionId: string): Promise<Buffer> {
    const data = await this.getExportData(sessionId);
    const { session, transactions, expenses, inventories, summary } = data;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'KasPL System';
    workbook.created = new Date();

    // ==========================================
    // SHEET 1: Summary
    // ==========================================
    const summarySheet = workbook.addWorksheet('Summary', { properties: { tabColor: { argb: 'FFC0000' } } });
    summarySheet.columns = [
      { header: 'Parameter', key: 'parameter', width: 25 },
      { header: 'Value', key: 'value', width: 40 },
    ];

    summarySheet.addRows([
      { parameter: 'Session ID', value: session.publicId },
      { parameter: 'Status', value: session.status },
      { parameter: 'Start Date', value: session.startDate.toLocaleString() },
      { parameter: 'End/Close Date', value: session.closedAt ? session.closedAt.toLocaleString() : '-' },
      { parameter: 'Total Revenue', value: summary.revenue },
      { parameter: 'Total Cost', value: summary.cost },
      { parameter: 'Gross Profit', value: summary.grossProfit },
      { parameter: 'Total Expenses', value: summary.expense },
      { parameter: 'Net Profit', value: summary.netProfit },
      { parameter: 'School Share (40%)', value: summary.schoolShare },
      { parameter: 'Class Share (60%)', value: summary.classShare },
      { parameter: 'Items Sold', value: summary.itemsSold },
      { parameter: 'Total Transactions', value: summary.transactionsCount },
    ]);

    // Format currency rows (assuming IDR formatting isn't strictly numeric type, but we can set numFmt)
    [5, 6, 7, 8, 9, 10, 11].forEach(rowNum => {
      summarySheet.getCell(`B${rowNum + 1}`).numFmt = '"Rp"#,##0;[Red]\-"Rp"#,##0';
    });

    // Make headers bold
    summarySheet.getRow(1).font = { bold: true };

    // ==========================================
    // SHEET 2: Transactions
    // ==========================================
    const txSheet = workbook.addWorksheet('Transactions');
    txSheet.columns = [
      { header: 'Transaction ID', key: 'publicId', width: 25 },
      { header: 'Date', key: 'createdAt', width: 20 },
      { header: 'Cashier', key: 'cashierName', width: 20 },
      { header: 'Total Items', key: 'totalItems', width: 12 },
      { header: 'Quantity', key: 'totalQuantity', width: 12 },
      { header: 'Revenue', key: 'grossRevenue', width: 18 },
      { header: 'Cost', key: 'grossCost', width: 18 },
      { header: 'Gross Profit', key: 'grossProfit', width: 18 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    transactions.forEach(tx => {
      txSheet.addRow({
        publicId: tx.publicId,
        createdAt: tx.createdAt.toLocaleString(),
        cashierName: tx.cashierName,
        totalItems: tx.totalItems,
        totalQuantity: tx.totalQuantity,
        grossRevenue: tx.grossRevenue,
        grossCost: tx.grossCost,
        grossProfit: tx.grossProfit,
        status: tx.status,
      });
    });

    ['F', 'G', 'H'].forEach(col => {
      txSheet.getColumn(col).numFmt = '"Rp"#,##0;[Red]\-"Rp"#,##0';
    });
    txSheet.getRow(1).font = { bold: true };

    // ==========================================
    // SHEET 3: Expenses
    // ==========================================
    const expSheet = workbook.addWorksheet('Expenses');
    expSheet.columns = [
      { header: 'Expense ID', key: 'publicId', width: 20 },
      { header: 'Date', key: 'expenseDate', width: 20 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Amount', key: 'amount', width: 18 },
      { header: 'Notes', key: 'notes', width: 40 },
    ];

    expenses.forEach(exp => {
      expSheet.addRow({
        publicId: exp.publicId,
        expenseDate: exp.expenseDate.toLocaleString(),
        title: exp.title,
        category: exp.category,
        amount: exp.amount,
        notes: exp.notes || '',
      });
    });

    expSheet.getColumn('E').numFmt = '"Rp"#,##0;[Red]\-"Rp"#,##0';
    expSheet.getRow(1).font = { bold: true };

    // ==========================================
    // SHEET 4: Inventory
    // ==========================================
    const invSheet = workbook.addWorksheet('Inventory');
    invSheet.columns = [
      { header: 'Item Name', key: 'itemNameSnapshot', width: 30 },
      { header: 'Category', key: 'categorySnapshot', width: 20 },
      { header: 'Opening Stock', key: 'openingStock', width: 15 },
      { header: 'Sold', key: 'soldQuantity', width: 15 },
      { header: 'Remaining Stock', key: 'remainingStock', width: 15 },
      { header: 'Cost Price', key: 'costPriceSnapshot', width: 18 },
      { header: 'Selling Price', key: 'sellingPriceSnapshot', width: 18 },
    ];

    inventories.forEach(inv => {
      invSheet.addRow({
        itemNameSnapshot: inv.itemNameSnapshot,
        categorySnapshot: inv.categorySnapshot,
        openingStock: inv.openingStock,
        soldQuantity: inv.soldQuantity,
        remainingStock: inv.remainingStock,
        costPriceSnapshot: inv.costPriceSnapshot,
        sellingPriceSnapshot: inv.sellingPriceSnapshot,
      });
    });

    ['F', 'G'].forEach(col => {
      invSheet.getColumn(col).numFmt = '"Rp"#,##0;[Red]\-"Rp"#,##0';
    });
    invSheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
