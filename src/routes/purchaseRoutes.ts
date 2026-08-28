import express from 'express';
import {
  createPurchase,
  deletePurchase,
  getPurchaseById,
  getPurchases,
  updatePurchase,
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

export default router;