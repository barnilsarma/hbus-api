import { Types } from 'mongoose';
import { Department } from '../models/Department';
import { User, UserRole } from '../models/User';

const fullDepartmentAccessRoles: UserRole[] = ['A', 'B'];

export const hasFullDepartmentAccess = (role: UserRole) => {
  return fullDepartmentAccessRoles.includes(role);
};

export const getAllDepartmentIds = async (): Promise<Types.ObjectId[]> => {
  return Department.distinct('_id');
};

// Roles A and B have implicit view and edit access to every department.
// Persisting the IDs keeps the User and Department API responses consistent.
export const syncFullDepartmentAccessUsers = async () => {
  const departmentIds = await getAllDepartmentIds();

  await User.updateMany(
    { role: { $in: fullDepartmentAccessRoles } },
    {
      $set: {
        viewaccess: departmentIds,
        editaccess: departmentIds,
      },
    },
  );
};

export const getFullDepartmentAccessUserIds = async () => {
  return User.distinct('_id', { role: { $in: fullDepartmentAccessRoles } });
};
