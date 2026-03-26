"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Transaction_1 = require("../models/Transaction");
const Category_1 = require("../models/Category");
const router = (0, express_1.Router)();
// Search transactions endpoint
router.post('/search', auth_1.authenticate, async (req, res) => {
    try {
        const { searchTerm, categoryId, type, startDate, endDate, minAmount, maxAmount, } = req.body;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Build filter object
        const filter = { userId };
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
        const transactions = await Transaction_1.Transaction.find(filter)
            .populate('category', 'name color type')
            .sort({ date: -1 })
            .limit(100)
            .lean();
        return res.json({
            success: true,
            count: transactions.length,
            data: transactions,
        });
    }
    catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Get all transactions
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const transactions = await Transaction_1.Transaction.find({ userId })
            .populate('category', 'name color type')
            .sort({ date: -1 })
            .limit(100)
            .lean();
        return res.json({
            success: true,
            count: transactions.length,
            data: transactions,
        });
    }
    catch (error) {
        console.error('Fetch error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Create transaction
router.post('/', auth_1.authenticate, async (req, res) => {
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
        const transaction = new Transaction_1.Transaction({
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
    }
    catch (error) {
        console.error('Create error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Get categories
router.get('/categories', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const categories = await Category_1.Category.find({ userId }).sort({ name: 1 }).lean();
        return res.json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        console.error('Categories fetch error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=transactions.js.map