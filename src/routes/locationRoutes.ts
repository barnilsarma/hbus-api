import { Router } from 'express';
import {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  addUserToLocation,
  removeUserFromLocation,
} from '../controllers/location/location';

const router = Router();

// Base path: /api/locations

// Collection routes
router
  .route('/')
  .get(getLocations)
  .post(createLocation);

// Single item routes
router
  .route('/:id')
  .get(getLocationById)
  .put(updateLocation)
  .delete(deleteLocation);

// User assignment routes
router
  .route('/:locationId/users/:userId')
  .post(addUserToLocation)
  .delete(removeUserFromLocation);

export default router;