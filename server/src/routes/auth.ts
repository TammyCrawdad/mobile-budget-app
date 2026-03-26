import { Router, Response } from 'express';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { createToken, authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', async (req, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Missing required fields: email, password, name',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create user
    const user = new User({ email, password, name });
    await user.save();

    // Create default categories for the user
    const defaultCategories = [
      { name: 'Salary', type: 'income', color: '#10b981' },
      { name: 'Freelance', type: 'income', color: '#06b6d4' },
      { name: 'Food', type: 'expense', color: '#f97316' },
      { name: 'Transportation', type: 'expense', color: '#8b5cf6' },
      { name: 'Utilities', type: 'expense', color: '#ec4899' },
      { name: 'Entertainment', type: 'expense', color: '#f59e0b' },
    ];

    for (const cat of defaultCategories) {
      await Category.create({
        ...cat,
        userId: user._id,
      });
    }

    const token = createToken(user._id.toString());

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: email, password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken(user._id.toString());

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
