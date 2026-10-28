import { Router } from 'express';
import {
  createDispatch,
  deleteDispatch,
  getDispatchById,
  getDispatches,
  getDispatchesByLocation,
  updateDispatch,
} from '../controllers/dispatch/dispatchController';

const router = Router();

router
  .route('/')
  .get(getDispatches)
  .post(createDispatch);

router.get('/location/:locationId', getDispatchesByLocation);

router
  .route('/:id')
  .get(getDispatchById)
  .put(updateDispatch)
  .delete(deleteDispatch);

export default router;
