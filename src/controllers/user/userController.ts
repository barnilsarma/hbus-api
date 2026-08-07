import express from 'express';
import { User, UserRole, rolePriority } from '../../models/User';

const isValidRole = (role: unknown): role is UserRole => {
  return role === 'A' || role === 'B' || role === 'C' || role === 'D';
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
  const users = await User.find();
  res.json(users);
};

export const getUserById = async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
};

export const createUser = async (req: express.Request, res: express.Response) => {
  const { userId, name, email, role } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }

  if (!email) {
    return res.status(400).json({ message: 'email is required' });
  }

  if (role && !isValidRole(role)) {
    return res.status(400).json({ message: 'role must be one of A, B, C, D' });
  }

  const newUser = new User({ userId, name, email, role });
  await newUser.save();

  res.status(201).json(newUser);
};

export const updateUser = async (req: express.Request, res: express.Response) => {
  const { userId, name, email, role, requestedById } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (role && !isValidRole(role)) {
    return res.status(400).json({ message: 'role must be one of A, B, C, D' });
  }

  if (role && role !== user.role) {
    if (!requestedById) {
      return res.status(400).json({ message: 'requestedById is required to change role' });
    }

    const requester = await User.findById(requestedById);

    if (!requester) {
      return res.status(404).json({ message: 'Requester not found' });
    }

    if (!canChangeRole(requester.role, user.role, role)) {
      return res.status(403).json({
        message: 'Only a higher-level user may change this user role',
      });
    }
  }

  user.userId = userId ?? user.userId;
  user.name = name ?? user.name;
  user.email = email ?? user.email;
  user.role = role ?? user.role;

  await user.save();
  res.json(user);
};

export const deleteUser = async (req: express.Request, res: express.Response) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(204).send();
};
