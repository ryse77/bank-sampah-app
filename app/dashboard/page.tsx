'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      console.log('Checking auth...');
      console.log('User from store:', user);
      
      setTimeout(() => {
        if (!user) {
          console.log('No user found, redirecting to login');
          window.location.href = '/login';
        } else {
          console.log('User authenticated:', user.nama_lengkap);
          setIsLoading(false);
        }
      }, 100);
    };

    checkAuth();
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Bank Sampah</h1>
              <p className="text-gray-600 mt-1">Selamat datang, {user.nama_lengkap}!</p>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Halo, {user.nama_lengkap}! 👋</h2>
              <p className="text-green-100 mb-1">{user.email}</p>
              <div className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium mt-2">
                Role: {user.role.toUpperCase()}
              </div>
            </div>
            {user.role === 'pengguna' && (
              <div className="text-right">
                <p className="text-green-100 text-sm mb-1">Saldo Anda</p>
                <p className="text-4xl font-bold">
                  Rp {user.saldo?.toLocaleString('id-ID') || 0}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Setoran</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-green-600 mt-1">+0 bulan ini</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Menunggu Validasi</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-yellow-600 mt-1">Perlu review</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Saldo Tersedia</p>
            <p className="text-3xl font-bold text-gray-900">
              Rp {user.saldo?.toLocaleString('id-ID') || 0}
            </p>
            <p className="text-sm text-green-600 mt-1">Siap dicairkan</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Menu Cepat</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => window.location.href = '/dashboard/setor-sampah'}
              className="p-6 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-500 transition-all text-center"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🗑️</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Setor Sampah</p>
            </button>

            <button
              onClick={() => window.location.href = '/dashboard/riwayat-sampah'}
              className="p-6 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-center"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Riwayat</p>
            </button>

            <button
              onClick={() => window.location.href = '/dashboard/saldo'}
              className="p-6 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-center"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Saldo</p>
            </button>

            <button
              onClick={() => window.location.href = '/dashboard/edukasi'}
              className="p-6 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-center"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📚</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Edukasi</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}