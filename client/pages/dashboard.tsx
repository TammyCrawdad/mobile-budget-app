import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MobileBudgetView from '../components/MobileBudgetView';
import { authAPI } from '../lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('transactions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        await authAPI.getMe();
        setLoading(false);
      } catch (error) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    verifyAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MobileBudgetView
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
