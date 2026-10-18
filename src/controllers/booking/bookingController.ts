import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { BookingModel } from '../../models/Booking';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'An unexpected error occurred';

const isValidId = (id: string): boolean => Types.ObjectId.isValid(id);

export const getBookings = async (_req: Request, res: Response) => {
  try {
    const bookings = await BookingModel.find().populate('location');
    res.json(bookings);
  } catch (error: unknown) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid booking ID' });
  }

  try {
    const booking = await BookingModel.findById(req.params.id).populate('location');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error: unknown) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getBookingsByLocation = async (req: Request, res: Response) => {
  const { locationId } = req.params;
  if (!isValidId(locationId)) {
    return res.status(400).json({ message: 'Invalid location ID' });
  }

  try {
    const bookings = await BookingModel.find({ location: locationId }).populate('location');
    res.json(bookings);
  } catch (error: unknown) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { location, locationId, ...bookingFields } = req.body;
    const targetLocation = locationId ?? location;

    if (typeof targetLocation !== 'string' || !isValidId(targetLocation)) {
      return res.status(400).json({ message: 'A valid location or locationId is required' });
    }

    const booking = new BookingModel({
      ...bookingFields,
      location: new Types.ObjectId(targetLocation),
    });
    await booking.save();
    await booking.populate('location');
    res.status(201).json(booking);
  } catch (error: unknown) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid booking ID' });
  }

  try {
    const booking = await BookingModel.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const {
      date,
      status,
      KvaDesign,
      qty,
      cutsomer,
      address,
      contact,
      advancePayment,
      remarks,
      location,
      locationId,
    } = req.body;

    if (date !== undefined) booking.date = date;
    if (status !== undefined) booking.status = status;
    if (KvaDesign !== undefined) booking.KvaDesign = KvaDesign;
    if (qty !== undefined) booking.qty = qty;
    if (cutsomer !== undefined) booking.cutsomer = cutsomer;
    if (address !== undefined) booking.address = address;
    if (contact !== undefined) booking.contact = contact;
    if (advancePayment !== undefined) booking.advancePayment = advancePayment;
    if (remarks !== undefined) booking.remarks = remarks;

    if (location !== undefined || locationId !== undefined) {
      const targetLocation = locationId ?? location;
      if (typeof targetLocation !== 'string' || !isValidId(targetLocation)) {
        return res.status(400).json({ message: 'A valid location or locationId is required' });
      }
      booking.location = new Types.ObjectId(targetLocation);
    }

    await booking.save();
    await booking.populate('location');
    res.json(booking);
  } catch (error: unknown) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid booking ID' });
  }

  try {
    const booking = await BookingModel.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(204).send();
  } catch (error: unknown) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
