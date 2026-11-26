import { Request, Response } from 'express';
import { createGenericController } from './genericStockController';
import { LiveStock } from '../../models/LiveStock';
import { OrderEntry } from '../../models/OrderEntry';
import { Invoice } from '../../models/Invoice';
import { InvoicePO } from '../../models/InvoicePO';
import { RejectionStock } from '../../models/RejectionStock';
import { RejectionEntry } from '../../models/RejectionEntry';
import { DailyProdReportStock } from '../../models/DailyProdReportStock';
import { DailyProd } from '../../models/DailyProd';
import { PerJobData } from '../../models/PerJobData';
import { StockAdjustmentEntry } from '../../models/StockAdjustmentEntry';
import { ProductionFlor } from '../../models/ProductionFlor';
import { RepairingData } from '../../models/RepairingData';
import { RepairingDataReturnStock } from '../../models/RepairingDataReturnStock';
import { RepairingDataRepairingStock } from '../../models/RepairingDataRepairingStock';
import { syncAllDerivedModels } from './stockCalculations';
import { Types } from 'mongoose';

const live = createGenericController(LiveStock, 'LiveStock');
const order = createGenericController(OrderEntry, 'OrderEntry');
const invoice = createGenericController(Invoice, 'Invoice');
const invoicePO = createGenericController(InvoicePO, 'InvoicePO');
const rejectionStock = createGenericController(RejectionStock, 'RejectionStock');
const rejectionEntry = createGenericController(RejectionEntry, 'RejectionEntry');
const dailyReport = createGenericController(DailyProdReportStock, 'DailyProdReportStock');
const dailyProd = createGenericController(DailyProd, 'DailyProd');
const perJob = createGenericController(PerJobData, 'PerJobData');
const stockAdjustment = createGenericController(StockAdjustmentEntry, 'StockAdjustmentEntry');
const production = createGenericController(ProductionFlor, 'ProductionFlor');
const repairing = createGenericController(RepairingData, 'RepairingData');
const returnStock = createGenericController(RepairingDataReturnStock, 'RepairingDataReturnStock');
const repairingStock = createGenericController(RepairingDataRepairingStock, 'RepairingDataRepairingStock');

export const getLiveStocks = async (req: Request, res: Response) => { await syncAllDerivedModels(); return live.getAll(req, res); };
export const getLiveStockById = async (req: Request, res: Response) => { await syncAllDerivedModels(); return live.getById(req, res); };
export const createLiveStock = live.create;
export const updateLiveStock = live.update;
export const deleteLiveStock = live.remove;

export const getOrderEntries = order.getAll;
export const getOrderEntryById = order.getById;
export const createOrderEntry = order.create;
export const updateOrderEntry = order.update;
export const deleteOrderEntry = order.remove;
export const addOrderEntryQty = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid ID' });
    if (req.body.new_qty === undefined) return res.status(400).json({ message: 'new_qty is required' });
    const record = await OrderEntry.findByIdAndUpdate(
      id,
      { $inc: { qty: Number(req.body.new_qty) } },
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ message: 'OrderEntry not found' });
    res.json(record);
  } catch (error: unknown) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update quantity' });
  }
};

export const getInvoices = async (req: Request, res: Response) => { await syncAllDerivedModels(); return invoice.getAll(req, res); };
export const getInvoiceById = async (req: Request, res: Response) => { await syncAllDerivedModels(); return invoice.getById(req, res); };
export const createInvoice = async (req: Request, res: Response) => {
  const highest = await Invoice.findOne().sort({ sl: -1 }).select('sl');
  req.body.sl = numberFrom(highest?.sl) + 1;
  await invoice.create(req, res);
  await syncAllDerivedModels();
};
export const updateInvoice = async (req: Request, res: Response) => { await invoice.update(req, res); await syncAllDerivedModels(); };
export const deleteInvoice = async (req: Request, res: Response) => { await invoice.remove(req, res); await syncAllDerivedModels(); };

const numberFrom = (value: unknown) => typeof value === 'number' ? value : 0;
export const getInvoicePOs = async (req: Request, res: Response) => { await syncAllDerivedModels(); return invoicePO.getAll(req, res); };
export const getInvoicePOById = async (req: Request, res: Response) => { await syncAllDerivedModels(); return invoicePO.getById(req, res); };
export const createInvoicePO = async (req: Request, res: Response) => { await invoicePO.create(req, res); await syncAllDerivedModels(); };
export const updateInvoicePO = async (req: Request, res: Response) => { await invoicePO.update(req, res); await syncAllDerivedModels(); };
export const deleteInvoicePO = async (req: Request, res: Response) => { await invoicePO.remove(req, res); await syncAllDerivedModels(); };

export const getRejectionStocks = async (req: Request, res: Response) => { await syncAllDerivedModels(); return rejectionStock.getAll(req, res); };
export const getRejectionStockById = async (req: Request, res: Response) => { await syncAllDerivedModels(); return rejectionStock.getById(req, res); };
export const createRejectionStock = rejectionStock.create;
export const updateRejectionStock = rejectionStock.update;
export const deleteRejectionStock = rejectionStock.remove;

export const getRejectionEntries = rejectionEntry.getAll;
export const getRejectionEntryById = rejectionEntry.getById;
export const createRejectionEntry = async (req: Request, res: Response) => { await rejectionEntry.create(req, res); await syncAllDerivedModels(); };
export const updateRejectionEntry = async (req: Request, res: Response) => { await rejectionEntry.update(req, res); await syncAllDerivedModels(); };
export const deleteRejectionEntry = async (req: Request, res: Response) => { await rejectionEntry.remove(req, res); await syncAllDerivedModels(); };

export const getDailyProdReportStocks = async (req: Request, res: Response) => { await syncAllDerivedModels(); return dailyReport.getAll(req, res); };
export const getDailyProdReportStockById = async (req: Request, res: Response) => { await syncAllDerivedModels(); return dailyReport.getById(req, res); };
export const createDailyProdReportStock = dailyReport.create;
export const updateDailyProdReportStock = dailyReport.update;
export const deleteDailyProdReportStock = dailyReport.remove;
export const getDailyProds = dailyProd.getAll;
export const getDailyProdById = dailyProd.getById;
export const createDailyProd = async (req: Request, res: Response) => { await dailyProd.create(req, res); await syncAllDerivedModels(); };
export const updateDailyProd = async (req: Request, res: Response) => { await dailyProd.update(req, res); await syncAllDerivedModels(); };
export const deleteDailyProd = async (req: Request, res: Response) => { await dailyProd.remove(req, res); await syncAllDerivedModels(); };

export const getPerJobData = perJob.getAll;
export const getPerJobDataById = perJob.getById;
export const createPerJobData = async (req: Request, res: Response) => { await perJob.create(req, res); await syncAllDerivedModels(); };
export const updatePerJobData = async (req: Request, res: Response) => { await perJob.update(req, res); await syncAllDerivedModels(); };
export const deletePerJobData = async (req: Request, res: Response) => { await perJob.remove(req, res); await syncAllDerivedModels(); };
export const getStockAdjustmentEntries = stockAdjustment.getAll;
export const getStockAdjustmentEntryById = stockAdjustment.getById;
export const createStockAdjustmentEntry = async (req: Request, res: Response) => { await stockAdjustment.create(req, res); await syncAllDerivedModels(); };
export const updateStockAdjustmentEntry = async (req: Request, res: Response) => { await stockAdjustment.update(req, res); await syncAllDerivedModels(); };
export const deleteStockAdjustmentEntry = async (req: Request, res: Response) => { await stockAdjustment.remove(req, res); await syncAllDerivedModels(); };

export const getProductionFlor = async (req: Request, res: Response) => { await syncAllDerivedModels(); return production.getAll(req, res); };
export const getProductionFlorById = async (req: Request, res: Response) => { await syncAllDerivedModels(); return production.getById(req, res); };
export const createProductionFlor = production.create;
export const updateProductionFlor = production.update;
export const deleteProductionFlor = production.remove;

export const getRepairingData = repairing.getAll;
export const getRepairingDataById = repairing.getById;
export const createRepairingData = async (req: Request, res: Response) => { await repairing.create(req, res); await syncAllDerivedModels(); };
export const updateRepairingData = async (req: Request, res: Response) => { await repairing.update(req, res); await syncAllDerivedModels(); };
export const deleteRepairingData = async (req: Request, res: Response) => { await repairing.remove(req, res); await syncAllDerivedModels(); };
export const getRepairingDataReturnStocks = returnStock.getAll;
export const getRepairingDataReturnStockById = returnStock.getById;
export const createRepairingDataReturnStock = async (req: Request, res: Response) => { await returnStock.create(req, res); await syncAllDerivedModels(); };
export const updateRepairingDataReturnStock = async (req: Request, res: Response) => { await returnStock.update(req, res); await syncAllDerivedModels(); };
export const deleteRepairingDataReturnStock = async (req: Request, res: Response) => { await returnStock.remove(req, res); await syncAllDerivedModels(); };
export const getRepairingDataRepairingStocks = repairingStock.getAll;
export const getRepairingDataRepairingStockById = repairingStock.getById;
export const createRepairingDataRepairingStock = async (req: Request, res: Response) => { await repairingStock.create(req, res); await syncAllDerivedModels(); };
export const updateRepairingDataRepairingStock = async (req: Request, res: Response) => { await repairingStock.update(req, res); await syncAllDerivedModels(); };
export const deleteRepairingDataRepairingStock = async (req: Request, res: Response) => { await repairingStock.remove(req, res); await syncAllDerivedModels(); };
