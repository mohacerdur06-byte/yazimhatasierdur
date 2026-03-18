'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (pathname === '/quiz') return null; // Don't show navbar inside the quiz for distraction-free playing

  return (
    <nav className="p-4 border-b-2 border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/" className="font-black text-2xl text-[#1cb0f6] shrink-0 active:scale-95 transition-transform">
          Yazım Hatası
        </Link>
        
        <div className="flex items-center gap-4 md:gap-6 font-bold text-gray-400 text-sm md:text-base">
          <Link href="/leaderboard" className="hover:text-[#ffc800] transition-colors whitespace-nowrap hidden sm:block">Tablo</Link>
          
          {user ? (
            <>
              <Link href="/profile" className="text-[#3c3c3c] hover:text-[#1cb0f6] transition-colors truncate max-w-[100px] sm:max-w-[200px]">
                {user.user_metadata?.username || 'Hesap'}
              </Link>
              <button onClick={handleLogout} className="hover:text-[#ea2b2b] uppercase text-xs tracking-wider border-2 border-gray-200 rounded-lg px-2 py-1 active:bg-gray-100">Çıkış</button>
            </>
          ) : (
            <>
              <Link href="/leaderboard" className="hover:text-[#ffc800] transition-colors sm:hidden block">Tablo</Link>
              <Link href="/auth" className="bg-[#58cc02] text-white px-4 py-2 md:px-6 md:py-3 rounded-xl hover:bg-[#58a700] border-b-4 border-[#58a700] active:border-b-0 active:translate-y-1 transition-all whitespace-nowrap shadow-sm">
                Giriş Yap
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
