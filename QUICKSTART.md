# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Setup MongoDB
Using MongoDB Atlas (cloud):
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Create `server/.env` with:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mobile-budget
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Start Development Servers
```bash
npm run dev
```

This starts both backend (port 5000) and frontend (port 3000).

### 4. Test It Out
1. Open http://localhost:3000
2. Click "Sign up"
3. Create account with test email/password
4. Navigate to Transactions tab
5. Try searching with filters

## Quick Commands

```bash
# Install all
npm install && cd server && npm install && cd ../client && npm install && cd ..

# Start both servers
npm run dev

# Start only backend
cd server && npm run dev

# Start only frontend
cd client && npm run dev

# Build for production
npm run build

# See all available scripts
cat package.json | grep scripts
```

## Default Test Categories
When you register, these are automatically created:
- **Income**: Salary, Freelance
- **Expense**: Food, Transportation, Utilities, Entertainment

## Feature Walkthrough

### Search Transactions
1. Go to Dashboard → Transactions tab
2. Enter a search term (e.g., "salary")
3. Select a category from dropdown
4. Choose type (Income/Expense/All)
5. Set date range (optional)
6. Set amount range (optional)
7. Click "Search"
8. View results with date, amount, category, type

### Create Transactions
After authentication, use API directly:
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salary",
    "amount": 5000,
    "type": "income",
    "category": "CATEGORY_ID",
    "description": "Monthly salary",
    "date": "2024-03-26"
  }'
```

Get category IDs:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/transactions/categories
```

## Troubleshooting

### Port 3000/5000 already in use
```bash
# Kill the process using port 5000
lsof -ti:5000 | xargs kill -9

# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### MongoDB connection error
- Check MONGODB_URI in server/.env
- Ensure MongoDB is running (local) or check Atlas whitelist (cloud)
- Verify username/password

### CORS errors
- Ensure CORS_ORIGIN in server/.env matches frontend URL
- Frontend must send requests to correct backend URL

### Search returns no results
- Ensure you've created transactions through API
- Check that category ID in transaction matches a real category
- Verify user is logged in (token in localStorage)

## API Endpoints

All endpoints require Bearer token in Authorization header:

**Auth:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

**Transactions:**
- `POST /api/transactions/search` - Search with filters
- `GET /api/transactions` - Get all
- `POST /api/transactions` - Create
- `GET /api/transactions/categories` - Get categories

## Next Steps

1. ✅ Setup complete - both servers running
2. ✅ Create test account
3. ✅ Verify search component loads
4. ✅ Test filters work
5. ⏭️ Create test transactions via API
6. ⏭️ Test search with data
7. ⏭️ Deploy to Heroku

## Visual Features

- **Dark Theme**: Slate-900 background with indigo accents
- **Gradients**: Indigo to violet for primary elements
- **Color Coding**: 
  - 🟢 Emerald for income
  - 🔴 Rose for expenses
  - 🟣 Violet for net balance
- **Responsive**: Works on mobile (320px+) and desktop

## File Locations

Key files to know:
- Frontend search: `client/components/TransactionSearch.tsx`
- Backend search API: `server/src/routes/transactions.ts`
- Dashboard: `client/components/MobileBudgetView.tsx`
- API client: `client/lib/api.ts`
- Database models: `server/src/models/`

## Getting Help

1. Check README.md for full documentation
2. Review IMPLEMENTATION.md for technical details
3. Look at component comments in code
4. Check git history: `git log --oneline`

Enjoy! 🎉
