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
import { Dispatch } from '../../models/Dispatch';

const number = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const sum = async (model: any, match: Record<string, unknown>, field: string) => {
  const rows = await model.find(match).select(field);
  return rows.reduce((total: number, row: any) => total + number(row[field]), 0);
};

export const syncInvoiceDerived = async () => {
  const invoices = await Invoice.find();
  for (const invoice of invoices) {
    const poRows = await InvoicePO.find({ POnumber: invoice.purchaseno });
    invoice.POqty = poRows.reduce((t, r) => t + number(r.qty), 0);
    invoice.POrate = poRows.reduce((t, r) => t + number(r.rate), 0);
    invoice.received = await sum(Invoice, { purchaseno: invoice.purchaseno }, 'qty');
    invoice.remaining = invoice.POqty;
    invoice.totalamount = number(invoice.qty) * number(invoice.invoicerate);
    await invoice.save();
  }
};

export const syncInvoicePODerived = async () => {
  const rows = await InvoicePO.find();
  for (const row of rows) {
    row.total = number(row.qty) * number(row.rate);
    row.received = await sum(Invoice, { purchaseno: row.POnumber }, 'qty');
    const poQty = await sum(InvoicePO, { POnumber: row.POnumber }, 'qty');
    row.remaining = number(row.received) - poQty;
    row.totalamountPO = poQty * number(row.rate);
    await row.save();
  }
};

export const syncRejectionStock = async () => {
  for (const stock of await RejectionStock.find()) {
    stock.core = await sum(RejectionEntry, { kva: stock.kva }, 'coreRejectionKG');
    stock.lvConductor = await sum(RejectionEntry, { kva: stock.kva }, 'lvConductorRejectionKG');
    stock.hvConductor = await sum(RejectionEntry, { kva: stock.kva }, 'hvConductorRejectionKG');
    stock.oil = await sum(RejectionEntry, { kva: stock.kva }, 'oilRejectionLtr');
    await stock.save();
  }
};

export const syncDailyProdReportStock = async () => {
  for (const stock of await DailyProdReportStock.find()) {
    stock.tankPaintDone = await sum(DailyProd, { kva: stock.kva }, 'paint');
    stock.coreAssembly = await sum(DailyProd, { kva: stock.kva }, 'coreAssemblyDone');
    stock.lvCoil = await sum(DailyProd, { kva: stock.kva }, 'lvCoilWinding');
    stock.hvCoil = await sum(DailyProd, { kva: stock.kva }, 'hvCoilWinding');
    stock.coilAssembly = await sum(DailyProd, { kva: stock.kva }, 'coilAssembly');
    stock.boxup = await sum(DailyProd, { kva: stock.kva }, 'boxupDone');
    stock.testingDone = await sum(DailyProd, { kva: stock.kva }, 'testingDone');
    stock.tankOnlyFabrication = await sum(DailyProd, { kva: stock.kva }, 'tank');
    await stock.save();
  }
};

export const syncProductionFloor = async () => {
  await syncDailyProdReportStock();
  for (const floor of await ProductionFlor.find()) {
    const report = await DailyProdReportStock.findOne({ kva: floor.kva });
    const r = report ?? ({} as any);
    floor.tank = number(r.tankPaintDone) - number(r.boxup);
    floor.coreAssemblyStock = number(r.coreAssembly) - number(r.coilAssembly);
    floor.lvCoilStock = number(r.lvCoil) - number(r.coilAssembly);
    floor.hvCoilStock = number(r.hvCoil) - number(r.coilAssembly);
    floor.coilAssembly = number(r.coilAssembly) - number(r.boxup);
    floor.boxup = number(r.boxup) - number(r.testingDone);
    floor.rtd = number(r.testingDone);
    floor.tankOnlyFabrication = number(r.tankOnlyFabrication) - number(r.tankPaintDone);
    await floor.save();
  }
};

export const syncLiveStock = async () => {
  await syncInvoicePODerived();
  await syncInvoiceDerived();
  await syncRejectionStock();
  await syncDailyProdReportStock();
  await syncProductionFloor();

  const liveRows = await LiveStock.find();
  for (const live of liveRows) {
    const matchedOrders = await OrderEntry.find({
      $or: [{ code: live.codeCore }, { code: live.codeLV }, { code: live.codeHV }],
    });
    live.looseCoreOrderedKG = matchedOrders
      .filter(r => r.code === live.codeCore)
      .reduce((t, r) => t + number(r.qty), 0);
    live.lvConductorOrderedKG = matchedOrders
      .filter(r => r.code === live.codeLV)
      .reduce((t, r) => t + number(r.qty), 0);
    live.hvConductorOrderedKG = matchedOrders
      .filter(r => r.code === live.codeHV)
      .reduce((t, r) => t + number(r.qty), 0);

    const invoices = await Invoice.find();
    const coreInvoiced = invoices.filter(r => r.mcode === live.codeCore).reduce((t, r) => t + number(r.qty), 0);
    const lvInvoiced = invoices.filter(r => r.mcode === live.codeLV).reduce((t, r) => t + number(r.qty), 0);
    const hvInvoiced = invoices.filter(r => r.mcode === live.codeHV).reduce((t, r) => t + number(r.qty), 0);
    live.looseCoreOrderedKG -= coreInvoiced;
    live.lvConductorOrderedKG -= lvInvoiced;
    live.hvConductorOrderedKG -= hvInvoiced;

    const rejection = await RejectionStock.findOne({ kva: live.kva });
    const report = await DailyProdReportStock.findOne({ kva: live.kva });
    const job = await PerJobData.findOne({ kva: live.kva });
    const adjustments = await StockAdjustmentEntry.find({ kva: live.kva });
    live.looseCoreStockKG = coreInvoiced
      - number(rejection?.core)
      - number(report?.coreAssembly) * number(job?.corePerJobKG)
      + adjustments.reduce((t, r) => t + number(r.core), 0);
    live.lvConductorStockKG = lvInvoiced
      - number(rejection?.lvConductor)
      - number(report?.lvCoil) * number(job?.lvConductorPerJobKG)
      + adjustments.reduce((t, r) => t + number(r.ltConductor), 0);
    live.hvConductorStockKG = hvInvoiced
      - number(rejection?.hvConductor)
      - number(report?.hvCoil) * number(job?.hvConductorPerJobKG)
      + adjustments.reduce((t, r) => t + number(r.htConductor), 0);

    const production = await ProductionFlor.findOne({ kva: live.kva });
    const dispatches = await Dispatch.find({ type: live.kva });
    const newDispatched = dispatches.reduce((t, r) => t + number(r.new), 0);
    const new2Dispatched = dispatches.reduce((t, r) => t + number(r.qty2), 0);
    live.readyToDispatch = number(production?.rtd) - newDispatched - new2Dispatched;

    const repairingTotal = await sum(RepairingData, { kva: live.kva }, 'totalRepairing');
    const repDispatched = dispatches.reduce((t, r) => t + number(r.REP), 0);
    const rep2Dispatched = dispatches.reduce((t, r) => t + number(r.REP2), 0);
    live.rtdRepairing = repairingTotal - repDispatched - rep2Dispatched;

    const returned = await sum(RepairingDataReturnStock, { kva: live.kva }, 'stock');
    const repairing = await sum(RepairingDataRepairingStock, { kva: live.kva }, 'stock');
    live.defective = returned - repairing;
    live.dispatch = newDispatched + repDispatched;
    await live.save();
  }
};

export const syncAllDerivedModels = async () => {
  await syncInvoicePODerived();
  await syncInvoiceDerived();
  await syncRejectionStock();
  await syncDailyProdReportStock();
  await syncProductionFloor();
  await syncLiveStock();
};
