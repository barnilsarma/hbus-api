import express from 'express';
import {
  createPurchase,
  deletePurchase,
  getPurchaseById,
  getPurchases,
  updatePurchase,
  removeItemFromPurchase
} from '../controllers/purchase/purchaseController';

const router = express.Router();

// Base Path: /api/purchases

router
  .route('/')
  .get(getPurchases)
  .post(createPurchase);

router
  .route('/:id')
  .get(getPurchaseById)
  .put(updatePurchase)
  .delete(deletePurchase);


// routes/purchaseRoutes.ts
router.delete('/:id/items/:itemId', removeItemFromPurchase);
export default router;