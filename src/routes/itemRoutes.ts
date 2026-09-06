import { Router } from 'express';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getItemByMCode,
  getItemsByLocation
} from '../controllers/item/itemControllers';

const router = Router();

// @route   GET /api/items
// @desc    Get all items
router.get('/', getItems);

// @route   GET /api/items/:id
// @desc    Get single item by ID
router.get('/:id', getItemById);
router.get('/mcode/:mcode', getItemByMCode);
router.get('/location/:locationId', getItemsByLocation);
// @route   POST /api/items
// @desc    Create a new item
router.post('/', createItem);

// @route   PUT /api/items/:id
// @desc    Update an existing item by ID
router.put('/:id', updateItem);

// @route   DELETE /api/items/:id
// @desc    Delete an item by ID
router.delete('/:id', deleteItem);

export default router;