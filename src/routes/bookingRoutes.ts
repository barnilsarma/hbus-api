import { Router } from 'express';
import {
  createBooking,
  deleteBooking,
  getBookingById,
  getBookings,
  getBookingsByLocation,
  updateBooking,
} from '../controllers/booking/bookingController';

const router = Router();

router
  .route('/')
  .get(getBookings)
  .post(createBooking);

router.get('/location/:locationId', getBookingsByLocation);

router
  .route('/:id')
  .get(getBookingById)
  .put(updateBooking)
  .delete(deleteBooking);

export default router;
