import express from 'express';
import {
  createPurchase,
  deletePurchase,
  getPurchaseById,
  getPurchases,
  updatePurchase,
} from '../controllers/purchase/purchaseController';

const router = express.Router();

router.get('/', getPurchases);
router.get('/:id', getPurchaseById);
router.post('/', createPurchase);
router.put('/:id', updatePurchase);
router.delete('/:id', deletePurchase);

export default router;
