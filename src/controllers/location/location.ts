import { Request, Response } from 'express';
import Location, { ILocation } from '../../models/Location';
import { User } from '../../models/User';

// 1. Create a new Location
export const createLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, address, users } = req.body;

    const newLocation = new Location({
      name,
      address,
      users: users || []
    });

    const savedLocation = await newLocation.save();
    res.status(201).json({ success: true, data: savedLocation });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 2. Get all Locations (with optional user population)
export const getLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const locations = await Location.find().populate('users', 'name email role');
    res.status(200).json({ success: true, count: locations.length, data: locations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Get single Location by ID
export const getLocationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const location = await Location.findById(req.params.id).populate('users', 'name email role');

    if (!location) {
      res.status(404).json({ success: false, error: 'Location not found' });
      return;
    }

    res.status(200).json({ success: true, data: location });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Update Location details
export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedLocation) {
      res.status(404).json({ success: false, error: 'Location not found' });
      return;
    }

    res.status(200).json({ success: true, data: updatedLocation });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 5. Delete Location
export const deleteLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);

    if (!location) {
      res.status(404).json({ success: false, error: 'Location not found' });
      return;
    }

    // Cleanup: Remove reference from associated users
    await User.updateMany(
      { location: req.params.id },
      { $unset: { location: "" } }
    );

    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 6. Add User to Location (with 2-way sync and validation via URL params)
export const addUserToLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId, userId } = req.params;

    // Verify the user exists first
    const userExists = await User.findById(userId);
    if (!userExists) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Add userId to Location.users array without duplicates ($addToSet)
    const updatedLocation = await Location.findByIdAndUpdate(
      locationId,
      { $addToSet: { users: userId } },
      { new: true }
    ).populate('users', 'name email role');

    if (!updatedLocation) {
      res.status(404).json({ success: false, error: 'Location not found' });
      return;
    }

    // Sync: Update user's location field to reference this location
    await User.findByIdAndUpdate(userId, { location: locationId });

    res.status(200).json({ success: true, data: updatedLocation });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 7. Remove User from Location by URL Params (with 2-way sync)
export const removeUserFromLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId, userId } = req.params;

    // Pull (remove) the userId from Location.users array
    const updatedLocation = await Location.findByIdAndUpdate(
      locationId,
      { $pull: { users: userId } },
      { new: true }
    ).populate('users', 'name email role');

    if (!updatedLocation) {
      res.status(404).json({ success: false, error: 'Location not found' });
      return;
    }

    // Sync: Unset/remove location reference from the User document
    await User.findByIdAndUpdate(userId, { $unset: { location: "" } });

    res.status(200).json({ success: true, data: updatedLocation });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};