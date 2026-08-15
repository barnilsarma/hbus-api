import express from 'express';
import {
  addDepartmentAccess,
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from '../controllers/user/userController';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id', addDepartmentAccess);
router.delete('/:id', deleteUser);

export default router;
