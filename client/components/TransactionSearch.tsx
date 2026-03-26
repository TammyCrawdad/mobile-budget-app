import React, { useState, useEffect } from 'react';
import { transactionAPI, SearchParams } from '../lib/api';
import { format } from 'date-fns';

interface Category {
  _id: string;
  name: string;
  type: string;
  color: string;
}

interface Transaction {
  _id: string;
  name: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  date: string;
}

interface TransactionSearchProps {
  onSearch?: (results: Transaction[]) => void;
}

export default function TransactionSearch({ onSearch }: TransactionSearchProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await transactionAPI.getCategories();
        setCategories(response.data.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params: SearchParams = {
        searchTerm: searchTerm || undefined,
        categoryId: selectedCategory || undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      };

      const response = await transactionAPI.search(params);
      setTransactions(response.data.data);
      if (onSearch) {
        onSearch(response.data.data);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to search transactions'
      );
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedType('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setTransactions([]);
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Search Form - Primary Focus */}
      <div className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-lg border border-indigo-500/20 p-6 mb-6 sticky top-0 z-20">
        <h2 className="text-2xl font-bold text-slate-100 mb-6">
          Search Transactions
        </h2>

        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search by name or description
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter transaction name or description..."
              className="w-full px-4 py-2 bg-gray-800 border border-indigo-500/30 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-indigo-500/30 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-indigo-500/30 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-indigo-500/30 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-indigo-500/30 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Min Amount
              </label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2 bg-gray-800 border border-indigo-500/30 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Max Amount
              </label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="999999"
                className="w-full px-4 py-2 bg-gray-800 border border-indigo-500/30 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-100 font-medium rounded-lg hover:bg-slate-600 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {transactions.length > 0 && (
          <h3 className="text-lg font-semibold text-slate-100">
            Results ({transactions.length})
          </h3>
        )}

        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="bg-gradient-to-r from-gray-800 to-gray-900 border border-slate-700/50 rounded-lg p-4 hover:border-indigo-500/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: transaction.category.color }}
                  />
                  <h4 className="text-slate-100 font-medium">
                    {transaction.name}
                  </h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      transaction.type === 'income'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                </div>
                {transaction.description && (
                  <p className="text-slate-400 text-sm mt-1">
                    {transaction.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span>{transaction.category.name}</span>
                  <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    transaction.type === 'income'
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {!loading && transactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">
              {searchTerm ||
              selectedCategory ||
              selectedType !== 'all' ||
              startDate ||
              endDate ||
              minAmount ||
              maxAmount
                ? 'No transactions found matching your filters'
                : 'Use the filters above to search for transactions'}
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full" />
            </div>
            <p className="text-slate-400 mt-2">Searching...</p>
          </div>
        )}
      </div>
    </div>
  );
}
