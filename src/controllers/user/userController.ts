import express from 'express';
import { Types } from 'mongoose';
import { Department } from '../../models/Department';
import { User, UserRole } from '../../models/User';
import {
  getAllDepartmentIds,
  hasFullDepartmentAccess,
  syncFullDepartmentAccessUsers,
} from '../../services/departmentAccessService';

const isValidRole = (role: unknown): role is UserRole => {
  return role === 'A' || role === 'B' || role === 'C' || role === 'D';
};

const departmentPopulate = [
  { path: 'viewaccess', select: 'name' },
  { path: 'editaccess', select: 'name' },
];

const isValidDepartmentIdArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((id) => typeof id === 'string' && Types.ObjectId.isValid(id));
};

const validateDepartmentIds = async (departmentIds: string[]) => {
  const distinctIds = [...new Set(departmentIds)];
  const matchedDepartmentCount = await Department.countDocuments({ _id: { $in: distinctIds } });
  return matchedDepartmentCount === distinctIds.length;
};

export const getUsers = async (_req: express.Request, res: express.Response) => {
  await syncFullDepartmentAccessUsers();
  const users = await User.find().populate(departmentPopulate);
  res.json(users);
};

export const getUserById = async (req: express.Request, res: express.Response) => {
  await syncFullDepartmentAccessUsers();
  const user = await User.findById(req.params.id).populate(departmentPopulate);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
};

export const createUser = async (req: express.Request, res: express.Response) => {
  const { name, email, role, viewaccess, editaccess } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }

  if (!email) {
    return res.status(400).json({ message: 'email is required' });
  }

  if (role && !isValidRole(role)) {
    return res.status(400).json({ message: 'role must be one of A, B, C, D' });
  }

  const userRole: UserRole = role ?? 'D';
  const hasFullAccess = hasFullDepartmentAccess(userRole);

  if (!hasFullAccess && viewaccess !== undefined && !isValidDepartmentIdArray(viewaccess)) {
    return res.status(400).json({ message: 'viewaccess must be an array of valid department IDs' });
  }

  if (!hasFullAccess && editaccess !== undefined && !isValidDepartmentIdArray(editaccess)) {
    return res.status(400).json({ message: 'editaccess must be an array of valid department IDs' });
  }

  const allDepartmentIds = hasFullAccess ? await getAllDepartmentIds() : undefined;
  const viewAccessDepartmentIds = allDepartmentIds ?? viewaccess ?? [];
  const editAccessDepartmentIds = allDepartmentIds ?? editaccess ?? [];

  if (!hasFullAccess && (!(await validateDepartmentIds(viewAccessDepartmentIds)) || !(await validateDepartmentIds(editAccessDepartmentIds)))) {
    return res.status(400).json({ message: 'viewaccess and editaccess may only contain existing department IDs' });
  }

  const newUser = new User({
    name,
    email,
    role: userRole,
    viewaccess: viewAccessDepartmentIds,
    editaccess: editAccessDepartmentIds,
  });
  await newUser.save();
  await newUser.populate(departmentPopulate);

  res.status(201).json(newUser);
};

export const updateUser = async (req: express.Request, res: express.Response) => {
  const { name, email, role, viewaccess, editaccess } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (role && !isValidRole(role)) {
    return res.status(400).json({ message: 'role must be one of A, B, C, D' });
  }

  const previousRole = user.role;
  const userRole: UserRole = role ?? user.role;
  const hasFullAccess = hasFullDepartmentAccess(userRole);

  if (!hasFullAccess && viewaccess !== undefined && !isValidDepartmentIdArray(viewaccess)) {
    return res.status(400).json({ message: 'viewaccess must be an array of valid department IDs' });
  }

  if (!hasFullAccess && editaccess !== undefined && !isValidDepartmentIdArray(editaccess)) {
    return res.status(400).json({ message: 'editaccess must be an array of valid department IDs' });
  }

  if (!hasFullAccess && viewaccess !== undefined && !(await validateDepartmentIds(viewaccess))) {
    return res.status(400).json({ message: 'viewaccess may only contain existing department IDs' });
  }

  if (!hasFullAccess && editaccess !== undefined && !(await validateDepartmentIds(editaccess))) {
    return res.status(400).json({ message: 'editaccess may only contain existing department IDs' });
  }

  user.name = name ?? user.name;
  user.email = email ?? user.email;
  user.role = userRole;

  if (hasFullAccess) {
    const allDepartmentIds = await getAllDepartmentIds();
    user.set('viewaccess', allDepartmentIds);
    user.set('editaccess', allDepartmentIds);
  } else {
    // Mongoose casts these validated IDs to Department ObjectIds according to the schema.
    if (viewaccess !== undefined) user.set('viewaccess', viewaccess);
    else if (hasFullDepartmentAccess(previousRole)) user.set('viewaccess', []);

    if (editaccess !== undefined) user.set('editaccess', editaccess);
    else if (hasFullDepartmentAccess(previousRole)) user.set('editaccess', []);
  }

  await user.save();
  await user.populate(departmentPopulate);
  res.json(user);
};

export const deleteUser = async (req: express.Request, res: express.Response) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(204).send();
};
