import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Transaction } from '../models/Transaction';
import { Category } from '../models/Category';
import { Response } from 'express';

const router = Router();

// Search transactions endpoint
router.post('/search', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      searchTerm,
      categoryId,
      type,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    } = req.body;

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Build filter object
    const filter: any = { userId };

    // Text search for searchTerm (searches name and description)
    if (searchTerm && searchTerm.trim()) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    // Filter by category
    if (categoryId) {
      filter.category = categoryId;
    }

    // Filter by type
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Filter by amount range
    if (minAmount !== undefined || maxAmount !== undefined) {
      filter.amount = {};
      if (minAmount !== undefined) {
        filter.amount.$gte = minAmount;
      }
      if (maxAmount !== undefined) {
        filter.amount.$lte = maxAmount;
      }
    }

    // Execute query with population and sorting
    const transactions = await Transaction.find(filter)
      .populate('category', 'name color type')
      .sort({ date: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all transactions
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transactions = await Transaction.find({ userId })
      .populate('category', 'name color type')
      .sort({ date: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create transaction
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description, amount, type, category, date } = req.body;

    if (!name || amount === undefined || !type || !category) {
      return res.status(400).json({
        error: 'Missing required fields: name, amount, type, category',
      });
    }

    const transaction = new Transaction({
      name,
      description,
      amount,
      type,
      category,
      date: date || new Date(),
      userId,
    });

    await transaction.save();
    await transaction.populate('category', 'name color type');

    return res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Create error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get categories
router.get('/categories', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const categories = await Category.find({ userId }).sort({ name: 1 }).lean();

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
