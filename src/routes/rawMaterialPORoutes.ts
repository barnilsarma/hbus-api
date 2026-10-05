import { Router } from 'express';
import {
  createRawMaterialPO,
  deleteRawMaterialPO,
  getRawMaterialPOById,
  getRawMaterialPOs,
  removeRawMaterialFromPO,
  updateRawMaterialPO,
} from '../controllers/rawmaterialpo/rawMaterialPOController';

const router = Router();

router
  .route('/')
  .get(getRawMaterialPOs)
  .post(createRawMaterialPO);

router.delete('/:id/raw-materials/:rawMaterialId', removeRawMaterialFromPO);

router
  .route('/:id')
  .get(getRawMaterialPOById)
  .put(updateRawMaterialPO)
  .delete(deleteRawMaterialPO);

export default router;
