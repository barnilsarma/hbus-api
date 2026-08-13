import express from 'express';
import { Types } from 'mongoose';
import { Department } from '../../models/Department';
import { User } from '../../models/User';
import {
  getFullDepartmentAccessUserIds,
  syncFullDepartmentAccessUsers,
} from '../../services/departmentAccessService';

type AccessField = 'viewaccess' | 'editaccess';

const userAccessPopulate = [
  { path: 'viewaccess', select: 'name email role' },
  { path: 'editaccess', select: 'name email role' },
];

const isValidUserIdArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((id) => typeof id === 'string' && Types.ObjectId.isValid(id));
};

const validateUserIds = async (userIds: string[]) => {
  const distinctIds = [...new Set(userIds)];
  const matchedUserCount = await User.countDocuments({ _id: { $in: distinctIds } });
  return matchedUserCount === distinctIds.length;
};

const syncUsersToDepartment = async (
  departmentId: Types.ObjectId,
  field: AccessField,
  userIds: string[],
) => {
  const fullAccessUserIds = await getFullDepartmentAccessUserIds();
  const effectiveUserIds = [
    ...new Set([...userIds, ...fullAccessUserIds.map((id) => id.toString())]),
  ];

  await User.updateMany({ [field]: departmentId }, { $pull: { [field]: departmentId } });

  if (effectiveUserIds.length > 0) {
    await User.updateMany(
      { _id: { $in: effectiveUserIds } },
      { $addToSet: { [field]: departmentId } },
    );
  }
};

const getDepartmentWithAccess = (departmentId: string) => {
  return Department.findById(departmentId).populate(userAccessPopulate);
};

export const getDepartments = async (_req: express.Request, res: express.Response) => {
  await syncFullDepartmentAccessUsers();
  const departments = await Department.find().populate(userAccessPopulate);
  res.json(departments);
};

export const getDepartmentById = async (req: express.Request, res: express.Response) => {
  await syncFullDepartmentAccessUsers();
  const departmentId = Array.isArray(req.params.id)
    ? req.params.id[0] ?? ''
    : req.params.id ?? '';

  if (!departmentId) {
    return res.status(400).json({ message: 'Department ID is required' });
  }

  const department = await getDepartmentWithAccess(departmentId);

  if (!department) {
    return res.status(404).json({ message: 'Department not found' });
  }

  res.json(department);
};

export const createDepartment = async (req: express.Request, res: express.Response) => {
  const { name, viewaccess, editaccess } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'name is required' });
  }

  if (viewaccess !== undefined && !isValidUserIdArray(viewaccess)) {
    return res.status(400).json({ message: 'viewaccess must be an array of valid user IDs' });
  }

  if (editaccess !== undefined && !isValidUserIdArray(editaccess)) {
    return res.status(400).json({ message: 'editaccess must be an array of valid user IDs' });
  }

  const viewAccessUserIds = viewaccess ?? [];
  const editAccessUserIds = editaccess ?? [];

  if (!(await validateUserIds(viewAccessUserIds)) || !(await validateUserIds(editAccessUserIds))) {
    return res.status(400).json({ message: 'viewaccess and editaccess may only contain existing user IDs' });
  }

  const department = await Department.create({ name });
  await syncUsersToDepartment(department._id, 'viewaccess', viewAccessUserIds);
  await syncUsersToDepartment(department._id, 'editaccess', editAccessUserIds);

  const populatedDepartment = await getDepartmentWithAccess(department.id);
  res.status(201).json(populatedDepartment);
};

export const updateDepartment = async (req: express.Request, res: express.Response) => {
  const { name, viewaccess, editaccess } = req.body;
  const department = await Department.findById(req.params.id);

  if (!department) {
    return res.status(404).json({ message: 'Department not found' });
  }

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ message: 'name must be a non-empty string' });
  }

  if (viewaccess !== undefined && !isValidUserIdArray(viewaccess)) {
    return res.status(400).json({ message: 'viewaccess must be an array of valid user IDs' });
  }

  if (editaccess !== undefined && !isValidUserIdArray(editaccess)) {
    return res.status(400).json({ message: 'editaccess must be an array of valid user IDs' });
  }

  if (viewaccess !== undefined && !(await validateUserIds(viewaccess))) {
    return res.status(400).json({ message: 'viewaccess may only contain existing user IDs' });
  }

  if (editaccess !== undefined && !(await validateUserIds(editaccess))) {
    return res.status(400).json({ message: 'editaccess may only contain existing user IDs' });
  }

  if (name !== undefined) department.name = name;
  await department.save();

  if (viewaccess !== undefined) {
    await syncUsersToDepartment(department._id, 'viewaccess', viewaccess);
  }

  if (editaccess !== undefined) {
    await syncUsersToDepartment(department._id, 'editaccess', editaccess);
  }

  const populatedDepartment = await getDepartmentWithAccess(department.id);
  res.json(populatedDepartment);
};

export const deleteDepartment = async (req: express.Request, res: express.Response) => {
  const department = await Department.findByIdAndDelete(req.params.id);

  if (!department) {
    return res.status(404).json({ message: 'Department not found' });
  }

  await Promise.all([
    User.updateMany({ viewaccess: department._id }, { $pull: { viewaccess: department._id } }),
    User.updateMany({ editaccess: department._id }, { $pull: { editaccess: department._id } }),
  ]);

  res.status(204).send();
};
