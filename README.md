# Mobile Budget Application - Transaction Search Feature

A full-stack mobile budget management application with an advanced transaction search system. Built with Next.js/React (frontend) and Node.js/Express (backend).

## Features

### Frontend Components
- **TransactionSearch Component**: Advanced search with multiple filters
  - Text search (name/description)
  - Category filtering (dropdown with all categories)
  - Type filtering (Income/Expense/All)
  - Date range selection
  - Amount range filtering
  - Results display with transaction details
  - Clear filters functionality
  - Loading and error state handling
  - Mobile-responsive design

- **MobileBudgetView Component**: Main dashboard interface
  - Tabbed navigation (Dashboard/Transactions/Categories)
  - Dashboard overview with summary cards
  - Transactions tab featuring search component
  - Categories management interface
  - ViB design system styling

### Backend API Endpoints

#### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

#### Transactions
- `POST /api/transactions/search` - Search and filter transactions
  - Query parameters: searchTerm, categoryId, type, startDate, endDate, minAmount, maxAmount
  - Returns: Sorted results (newest first), limited to 100 transactions
  - Support for partial text matching
  
- `GET /api/transactions` - Get all transactions (requires auth)
- `POST /api/transactions` - Create new transaction (requires auth)
- `GET /api/transactions/categories` - Get all categories (requires auth)

## Project Structure

```
mobile-budget-app/
├── server/                    # Express backend
│   ├── src/
│   │   ├── server.ts         # Main server file
│   │   ├── db/
│   │   │   └── connection.ts # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.ts       # User model
│   │   │   ├── Category.ts   # Category model
│   │   │   └── Transaction.ts # Transaction model
│   │   ├── routes/
│   │   │   ├── auth.ts       # Auth routes
│   │   │   └── transactions.ts # Transaction routes
│   │   └── middleware/
│   │       └── auth.ts       # JWT authentication middleware
│   ├── package.json
│   └── tsconfig.json
│
├── client/                    # Next.js frontend
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── dashboard.tsx
│   ├── components/
│   │   ├── TransactionSearch.tsx  # Search component
│   │   └── MobileBudgetView.tsx   # Main view
│   ├── lib/
│   │   └── api.ts           # API client
│   ├── styles/
│   │   └── globals.css
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── package.json             # Root package
└── .gitignore
```

## Design System

The application uses the ViB design system with:
- **Primary Colors**: Indigo-600 to Violet-600 gradients
- **Text Colors**: Slate-100/200 on dark backgrounds
- **Backgrounds**: Gray-900 with slate accents
- **Accent Colors**: 
  - Emerald-500 for income/success
  - Rose-500 for expenses/danger
- **Borders**: Indigo-500/20 with hover states

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB 5+
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mobile-budget
JWT_SECRET=your-secret-key-here
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

4. Build TypeScript:
```bash
npm run build
```

5. Start server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. `.env.local` already configured for local development

4. Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### Full Stack Development

From root directory:
```bash
npm install
npm run dev
```

This starts both servers concurrently.

## Usage

### Creating an Account
1. Navigate to `/register`
2. Fill in email, password, and name
3. Submit to create account (default categories created automatically)

### Logging In
1. Navigate to `/login`
2. Enter credentials
3. JWT token saved to localStorage

### Transaction Search
1. Go to Dashboard → Transactions tab
2. Use search filters:
   - **Search Term**: Type to search transaction names/descriptions
   - **Category**: Select from dropdown
   - **Type**: Choose Income, Expense, or All
   - **Date Range**: Pick start and end dates
   - **Amount Range**: Set min and max amounts
3. Click "Search" to execute
4. Results display with all transaction details
5. Click "Clear Filters" to reset

### Dashboard
- View income/expense totals (future enhancement)
- See net balance (future enhancement)

### Categories
- View existing categories
- Future: Add/edit/delete categories

## API Examples

### Search Transactions
```bash
curl -X POST http://localhost:5000/api/transactions/search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "searchTerm": "salary",
    "type": "income",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "minAmount": 100
  }'
```

### Get All Categories
```bash
curl -X GET http://localhost:5000/api/transactions/categories \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Salary",
    "amount": 5000,
    "type": "income",
    "category": "CATEGORY_ID",
    "date": "2024-03-26"
  }'
```

## Default Categories

When a user registers, these categories are created:
- **Income**: Salary, Freelance
- **Expense**: Food, Transportation, Utilities, Entertainment

## Testing

### Test Scenarios Completed
✅ Search with various filter combinations
✅ API returns correct results with filters applied
✅ Mobile layout responsive on small screens
✅ Desktop layout responsive on large screens
✅ Loading states display correctly
✅ Error handling and messages display
✅ Results sorted by date (newest first)
✅ Results limited to 100 transactions
✅ Partial text matching works
✅ Clear filters resets all fields
✅ JWT authentication working
✅ CORS enabled for frontend

## Deployment

### Heroku Deployment

1. Create Heroku app:
```bash
heroku create your-app-name
```

2. Add MongoDB Atlas addon:
```bash
heroku addons:create mongolab:sandbox
```

3. Set environment variables:
```bash
heroku config:set JWT_SECRET=your-secret-key
heroku config:set CORS_ORIGIN=https://your-app-name.herokuapp.com
```

4. Build and deploy:
```bash
git push heroku main
```

5. Verify API:
```bash
curl https://your-app-name.herokuapp.com/health
```

## Technologies

### Backend
- Express.js - Web framework
- MongoDB/Mongoose - Database
- JWT - Authentication
- bcryptjs - Password hashing
- TypeScript - Type safety
- CORS - Cross-origin requests

### Frontend
- Next.js - React framework
- React 18 - UI library
- TypeScript - Type safety
- Tailwind CSS - Styling
- Axios - HTTP client
- date-fns - Date formatting

## Future Enhancements

- [ ] Dashboard analytics with charts
- [ ] Expense budgeting and alerts
- [ ] Recurring transaction support
- [ ] Export to CSV/PDF
- [ ] Multi-user household budgets
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Advanced analytics and forecasting

## Development Notes

### Authentication Flow
1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token included in Authorization header for all requests
5. Backend verifies token using middleware

### Database Indexes
- `Transaction`: userId + date, userId + category
- Text search on name and description

### Error Handling
- Try-catch blocks on all routes
- Consistent error response format
- Meaningful error messages
- Proper HTTP status codes

### Mobile Responsiveness
- Tailwind CSS grid system
- Flexible layouts with gap utilities
- Touch-friendly button sizes
- Responsive font sizes
- Full viewport height container

## License

MIT

## Author

Mobile Budget Application Team
