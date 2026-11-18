import { Router } from 'express';
import * as stock from '../controllers/stock/stockControllers';

const router = Router();

const crud = (path: string, handlers: { getAll: any; getById: any; create: any; update: any; remove: any }) => {
  router.route(path).get(handlers.getAll).post(handlers.create);
  router.route(`${path}/:id`).get(handlers.getById).put(handlers.update).delete(handlers.remove);
};

crud('/livestocks', { getAll: stock.getLiveStocks, getById: stock.getLiveStockById, create: stock.createLiveStock, update: stock.updateLiveStock, remove: stock.deleteLiveStock });
crud('/order-entries', { getAll: stock.getOrderEntries, getById: stock.getOrderEntryById, create: stock.createOrderEntry, update: stock.updateOrderEntry, remove: stock.deleteOrderEntry });
router.patch('/order-entries/:id/qty', stock.addOrderEntryQty);
crud('/invoices', { getAll: stock.getInvoices, getById: stock.getInvoiceById, create: stock.createInvoice, update: stock.updateInvoice, remove: stock.deleteInvoice });
crud('/invoice-pos', { getAll: stock.getInvoicePOs, getById: stock.getInvoicePOById, create: stock.createInvoicePO, update: stock.updateInvoicePO, remove: stock.deleteInvoicePO });
crud('/rejection-stocks', { getAll: stock.getRejectionStocks, getById: stock.getRejectionStockById, create: stock.createRejectionStock, update: stock.updateRejectionStock, remove: stock.deleteRejectionStock });
crud('/rejection-entries', { getAll: stock.getRejectionEntries, getById: stock.getRejectionEntryById, create: stock.createRejectionEntry, update: stock.updateRejectionEntry, remove: stock.deleteRejectionEntry });
crud('/daily-prod-report-stocks', { getAll: stock.getDailyProdReportStocks, getById: stock.getDailyProdReportStockById, create: stock.createDailyProdReportStock, update: stock.updateDailyProdReportStock, remove: stock.deleteDailyProdReportStock });
crud('/daily-prods', { getAll: stock.getDailyProds, getById: stock.getDailyProdById, create: stock.createDailyProd, update: stock.updateDailyProd, remove: stock.deleteDailyProd });
crud('/per-job-data', { getAll: stock.getPerJobData, getById: stock.getPerJobDataById, create: stock.createPerJobData, update: stock.updatePerJobData, remove: stock.deletePerJobData });
crud('/stock-adjustment-entries', { getAll: stock.getStockAdjustmentEntries, getById: stock.getStockAdjustmentEntryById, create: stock.createStockAdjustmentEntry, update: stock.updateStockAdjustmentEntry, remove: stock.deleteStockAdjustmentEntry });
crud('/production-flor', { getAll: stock.getProductionFlor, getById: stock.getProductionFlorById, create: stock.createProductionFlor, update: stock.updateProductionFlor, remove: stock.deleteProductionFlor });
crud('/repairing-data', { getAll: stock.getRepairingData, getById: stock.getRepairingDataById, create: stock.createRepairingData, update: stock.updateRepairingData, remove: stock.deleteRepairingData });
crud('/repairing-data-return-stocks', { getAll: stock.getRepairingDataReturnStocks, getById: stock.getRepairingDataReturnStockById, create: stock.createRepairingDataReturnStock, update: stock.updateRepairingDataReturnStock, remove: stock.deleteRepairingDataReturnStock });
crud('/repairing-data-repairing-stocks', { getAll: stock.getRepairingDataRepairingStocks, getById: stock.getRepairingDataRepairingStockById, create: stock.createRepairingDataRepairingStock, update: stock.updateRepairingDataRepairingStock, remove: stock.deleteRepairingDataRepairingStock });

export default router;
