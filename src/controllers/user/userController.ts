import express from 'express';
import { User, UserRole, rolePriority } from '../../models/User';
import Location from '../../models/Location';

const isValidRole = (role: unknown): role is UserRole => {
  return role === 'A' || role === 'B' || role === 'C' || role === 'D';
};

const isValidAccess = (access: unknown): access is 'view' | 'edit' => {
  return access === 'view' || access === 'edit';
};

const canChangeRole = (requesterRole: UserRole, currentRole: UserRole, newRole: UserRole) => {
  if (newRole === currentRole) {
    return true;
  }

  const requesterLevel = rolePriority[requesterRole];
  const currentLevel = rolePriority[currentRole];
  const newLevel = rolePriority[newRole];

  return requesterLevel > currentLevel && requesterLevel >= newLevel;
};

export const getUsers = async (_req: express.Request, res: express.Response) => {
  try {
    const users = await User.find().populate('location', 'name address');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req: express.Request, res: express.Response) => {
  try {
    const user = await User.findById(req.params.id).populate('location', 'name address');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req: express.Request, res: express.Response) => {
  try {
    const { name, email, role, location } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    if (!email) {
      return res.status(400).json({ message: 'email is required' });
    }

    if (role && !isValidRole(role)) {
      return res.status(400).json({ message: 'role must be one of A, B, C, D' });
    }

    if (location) {
      const locationExists = await Location.findById(location);
      if (!locationExists) {
        return res.status(404).json({ message: 'Location not found' });
      }
    }

    const newUser = new User({ name, email, role, location });
    await newUser.save();

    if (location) {
      await Location.findByIdAndUpdate(location, {
        $addToSet: { users: newUser._id }
      });
    }

    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUser = async (req: express.Request, res: express.Response) => {
  try {
    const { name, email, role, location } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role && !isValidRole(role)) {
      return res.status(400).json({ message: 'role must be one of A, B, C, D' });
    }

    // Safely cast location to a string regardless of whether it is an ObjectId or populated document
    const currentLocationId = user.location ? String(user.location) : null;

    if (location !== undefined && location !== currentLocationId) {
      // Pull user from old location array
      if (currentLocationId) {
        await Location.findByIdAndUpdate(currentLocationId, {
          $pull: { users: user._id }
        });
      }

      // Add user to new location array
      if (location) {
        const locationExists = await Location.findById(location);
        if (!locationExists) {
          return res.status(404).json({ message: 'Target location not found' });
        }
        await Location.findByIdAndUpdate(location, {
          $addToSet: { users: user._id }
        });
      }

      user.location = location || undefined;
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.role = role ?? user.role;

    await user.save();
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const addDepartmentAccess = async (req: express.Request, res: express.Response) => {
  try {
    const { department, access } = req.body;

    if (typeof department !== 'string' || !department.trim()) {
      return res.status(400).json({ message: 'department must be a non-empty string' });
    }

    if (!isValidAccess(access)) {
      return res.status(400).json({ message: "access must be either 'view' or 'edit'" });
    }

    const accessField = access === 'view' ? 'viewaccess' : 'editaccess';
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { [accessField]: department.trim() } },
      { new: true, runValidators: true }
    ).populate('location', 'name address');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req: express.Request, res: express.Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.location) {
      await Location.findByIdAndUpdate(user.location, {
        $pull: { users: user._id }
      });
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const revokeDepartmentAccess = async (req: express.Request, res: express.Response) => {
  try {
    const { department, access } = req.body;

    if (typeof department !== 'string' || !department.trim()) {
      return res.status(400).json({ message: 'department must be a non-empty string' });
    }

    if (!isValidAccess(access)) {
      return res.status(400).json({ message: "access must be either 'view' or 'edit'" });
    }

    const departmentName = department.trim();

    const updateQuery = access === 'view'
      ? { $pull: { viewaccess: departmentName, editaccess: departmentName } }
      : { $pull: { editaccess: departmentName } };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true, runValidators: true }
    ).populate('location', 'name address');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};