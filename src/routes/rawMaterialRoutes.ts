import { Router } from 'express';
import {
  createRawMaterial,
  deleteRawMaterial,
  getRawMaterialById,
  getRawMaterialByMCode,
  getRawMaterials,
  getRawMaterialsByLocation,
  updateRawMaterial,
} from '../controllers/rawmaterial/rawmaterialController';

const router = Router();

router
  .route('/')
  .get(getRawMaterials)
  .post(createRawMaterial);

router.get('/mcode/:mcode', getRawMaterialByMCode);
router.get('/location/:locationId', getRawMaterialsByLocation);

router
  .route('/:id')
  .get(getRawMaterialById)
  .put(updateRawMaterial)
  .delete(deleteRawMaterial);

export default router;
