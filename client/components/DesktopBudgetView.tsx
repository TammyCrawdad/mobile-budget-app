import React from 'react';
import TransactionSearch from './TransactionSearch';

interface DesktopBudgetViewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DesktopBudgetView({
  activeTab,
  onTabChange,
}: DesktopBudgetViewProps) {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-violet-900/50 border-b border-indigo-500/20 px-8 py-6 sticky top-0 z-10">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
          Budget Hub
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage your finances</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-700 px-8 bg-slate-900/50 sticky top-24 z-10">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`px-6 py-4 font-medium text-sm transition-all border-b-2 ${
            activeTab === 'dashboard'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onTabChange('transactions')}
          className={`px-6 py-4 font-medium text-sm transition-all border-b-2 ${
            activeTab === 'transactions'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => onTabChange('categories')}
          className={`px-6 py-4 font-medium text-sm transition-all border-b-2 ${
            activeTab === 'categories'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Categories
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="p-8">
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border border-emerald-500/20 rounded-lg p-8">
                <p className="text-emerald-400/70 text-sm font-medium">
                  Total Income
                </p>
                <p className="text-4xl font-bold text-emerald-400 mt-4">
                  $0.00
                </p>
              </div>
              <div className="bg-gradient-to-br from-rose-900/30 to-rose-900/10 border border-rose-500/20 rounded-lg p-8">
                <p className="text-rose-400/70 text-sm font-medium">
                  Total Expenses
                </p>
                <p className="text-4xl font-bold text-rose-400 mt-4">$0.00</p>
              </div>
              <div className="bg-gradient-to-br from-violet-900/30 to-violet-900/10 border border-violet-500/20 rounded-lg p-8">
                <p className="text-violet-400/70 text-sm font-medium">
                  Net Balance
                </p>
                <p className="text-4xl font-bold text-violet-400 mt-4">$0.00</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-lg border border-indigo-500/20 p-8">
              <p className="text-slate-300 text-lg">
                Start by adding transactions to see your financial overview and detailed insights.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="w-full h-full px-8 py-6">
            <TransactionSearch />
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="p-8">
            <div className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-lg border border-indigo-500/20 p-8">
              <h2 className="text-3xl font-bold text-slate-100 mb-6">
                Categories
              </h2>
              <p className="text-slate-400 text-lg mb-8">
                Manage your income and expense categories here. Categories help
                you organize and track your transactions more effectively.
              </p>
              <div className="mt-6">
                <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all">
                  Add Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
