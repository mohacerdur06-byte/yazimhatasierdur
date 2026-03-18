'use client';

import { useState } from 'react';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded password protection
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Hatalı şifre!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-sm border-2 border-gray-100 max-w-sm w-full space-y-6">
          <h1 className="text-3xl font-black text-center text-[#3c3c3c]">Yönetici Girişi</h1>
          <p className="text-center text-gray-500 font-medium">Devam etmek için şifrenizi girin.</p>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border-2 border-gray-200 p-4 rounded-2xl focus:border-[#1cb0f6] outline-none font-bold text-lg"
            placeholder="Şifre"
          />
          <button type="submit" className="w-full bg-[#1cb0f6] text-white font-bold p-4 rounded-2xl hover:bg-[#1899d6] transition-colors active:translate-y-1">
            Giriş Yap
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <AdminPanel />
    </div>
  );
}
