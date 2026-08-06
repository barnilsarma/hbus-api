import express from 'express';
import { User, UserRole, rolePriority } from '../models/User';

const router = express.Router();

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

router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

router.post('/', async (req, res) => {
  const { userId, name, role } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ message: 'userId and name are required' });
  }

  if (role && !isValidRole(role)) {
    return res.status(400).json({ message: 'role must be one of A, B, C, D' });
  }

  const newUser = new User({ userId, name, role });
  await newUser.save();

  res.status(201).json(newUser);
});

router.put('/:id', async (req, res) => {
  const { userId, name, role, requestedById } = req.body;
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
  user.role = role ?? user.role;

  await user.save();
  res.json(user);
});

router.delete('/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(204).send();
});

export default router;
