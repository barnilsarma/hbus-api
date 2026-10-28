import { Router } from 'express';
import {
  createPrimary,
  deletePrimary,
  getPrimaries,
  getPrimariesByLocation,
  getPrimaryById,
  updatePrimary,
} from '../controllers/primary/primaryController';

const router = Router();

router
  .route('/')
  .get(getPrimaries)
  .post(createPrimary);

router.get('/location/:locationId', getPrimariesByLocation);

router
  .route('/:id')
  .get(getPrimaryById)
  .put(updatePrimary)
  .delete(deletePrimary);

export default router;
