'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        if (!username) throw new Error('Kullanıcı adı gerekli.');
        if (password.length < 6) throw new Error('Şifre en az 6 karakter olmalıdır.');
        
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username }
          }
        });
        if (signUpError) throw signUpError;
        alert('Kayıt yapıldı! Giriş yapabilirsiniz.');
        setIsLogin(true);
        return;
      }
      
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-gray-100 max-w-sm w-full space-y-6 animate-fade-in-down">
        <h1 className="text-3xl font-black text-center text-[#3c3c3c]">{isLogin ? 'Hoş Geldin' : 'Kayıt Ol'}</h1>
        
        {error && <div className="p-4 bg-[#ffdfe0] text-[#ea2b2b] rounded-xl font-bold border-2 border-[#ffbfc1] text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-500 font-bold mb-2 uppercase text-sm">Kullanıcı Adı</label>
              <input 
                type="text" 
                value={username} onChange={e => setUsername(e.target.value)}
                className="w-full border-2 border-gray-200 p-4 rounded-2xl focus:border-[#1cb0f6] outline-none font-bold"
                placeholder="Örn: kelime_avcisi"
              />
            </div>
          )}
          <div>
            <label className="block text-gray-500 font-bold mb-2 uppercase text-sm">E-posta</label>
            <input 
              type="email" 
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 p-4 rounded-2xl focus:border-[#1cb0f6] outline-none font-bold"
              placeholder="E-posta adresi"
              required
            />
          </div>
          <div>
            <label className="block text-gray-500 font-bold mb-2 uppercase text-sm">Şifre</label>
            <input 
              type="password" 
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border-2 border-gray-200 p-4 rounded-2xl focus:border-[#1cb0f6] outline-none font-bold"
              placeholder="En az 6 karakter"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-[#58cc02] text-white font-bold text-lg py-4 rounded-2xl hover:bg-[#58a700] transition-colors flex items-center justify-center disabled:opacity-50 active:translate-y-1"
          >
            {loading ? 'Bekleniyor...' : (isLogin ? 'Giriş Yap' : 'Hesap Oluştur')}
          </button>
        </form>

        <div className="text-center pt-2">
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(null); }} 
            className="text-[#1cb0f6] font-extrabold hover:underline"
          >
            {isLogin ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
          </button>
        </div>
      </div>
    </div>
  );
}
