'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, History, User, Flame, Star, Award } from 'lucide-react';

type ScoreRow = {
  id: string;
  score: number;
  created_at: string;
};

type Profile = {
  xp: number;
  streak_days: number;
  achievements: string[];
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<ScoreRow[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      
      setUser(session.user);

      // Fetch History
      const { data: scores } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (scores) setHistory(scores);

      // Fetch Gamification Profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (profile) setUserProfile(profile);

      setLoading(false);
    }
    loadProfile();
  }, []);

  if (loading) return <div className="text-center p-12 font-bold text-gray-400 text-xl">Yükleniyor...</div>;
  if (!user) return <div className="text-center p-12 font-bold text-[#ea2b2b] text-xl">Lütfen giriş yapın.</div>;

  const highestScore = history.length > 0 ? Math.max(...history.map(h => h.score)) : 0;
  const totalGames = history.length;
  
  const xp = userProfile?.xp || 0;
  const streak = userProfile?.streak_days || 0;
  const achievements = userProfile?.achievements || [];
  
  // Calculate level based on XP formula: root(xp/100) + 1
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const currentLevelStartXp = Math.pow(level - 1, 2) * 100;
  const progressPercent = Math.max(0, Math.min(100, ((xp - currentLevelStartXp) / (nextLevelXp - currentLevelStartXp)) * 100));

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in-down space-y-8">
      
      {/* Top Section: User Info & Level */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-[#ddf4ff] flex items-center justify-center text-[#1cb0f6] border-4 border-[#84d8ff]">
            <User size={64} strokeWidth={2.5} />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#ffc800] text-white font-black px-3 py-1 rounded-xl border-4 border-white shadow-sm flex items-center gap-1">
            <Star size={16} fill="currentColor" /> Lvl {level}
          </div>
        </div>
        <div className="flex-1 text-center md:text-left w-full space-y-4">
          <div>
            <h1 className="text-4xl font-black text-[#3c3c3c]">{user.user_metadata?.username || 'İsimsiz Oyuncu'}</h1>
            <p className="text-gray-400 font-bold mt-1">{user.email}</p>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-4 relative overflow-hidden">
            <div className="bg-[#ffc800] h-4 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
            {xp} / {nextLevelXp} XP
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Streak */}
        <div className="bg-[#fff0f0] border-2 border-[#ffc2c2] p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
          <Flame size={40} className={`mb-2 ${streak > 0 ? 'text-[#ff4b4b]' : 'text-[#ffbfc1]'}`} strokeWidth={2.5} />
          <span className="text-gray-500 font-black text-xs uppercase tracking-wider">Seri</span>
          <span className={`text-5xl font-black mt-2 ${streak > 0 ? 'text-[#ff4b4b]' : 'text-gray-300'}`}>{streak} <span className="text-2xl">Gün</span></span>
        </div>
        
        {/* Highest Score */}
        <div className="bg-[#fff4e5] border-2 border-[#ffe0b2] p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
          <Trophy size={40} className="text-[#ff9800] mb-2" strokeWidth={2.5} />
          <span className="text-gray-500 font-black text-xs uppercase tracking-wider">En Yüksek Puan</span>
          <span className="text-5xl font-black text-[#ff9800] mt-2">{highestScore}</span>
        </div>

        {/* Total Games */}
        <div className="bg-[#ddf4ff] border-2 border-[#bce8ff] p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
          <History size={40} className="text-[#1cb0f6] mb-2" strokeWidth={2.5} />
          <span className="text-gray-500 font-black text-xs uppercase tracking-wider">Oynanan Oyun</span>
          <span className="text-5xl font-black text-[#1cb0f6] mt-2">{totalGames}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Achievements Section */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-2xl font-black text-[#3c3c3c] mb-6 flex items-center gap-3">
            <Award className="text-[#ffc800]" /> Başarımlar ({achievements.length})
          </h2>
          
          <div className="flex flex-wrap gap-3 flex-1 items-start">
            {achievements.length > 0 ? achievements.map((badge, i) => (
              <span key={i} className="bg-[#fff4e5] text-[#cc7a00] border-2 border-[#ffe0b2] font-black px-4 py-2 rounded-2xl text-lg animate-pop">
                {badge}
              </span>
            )) : (
              <span className="text-gray-400 font-bold border-2 border-dashed border-gray-200 px-4 py-2 rounded-2xl w-full text-center">Henüz başarım kilidi açılmadı.</span>
            )}
          </div>
        </div>

        {/* Match History */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black text-[#3c3c3c] mb-6 flex items-center gap-3">
            <History className="text-gray-400" /> Son Oyunlar
          </h2>
          
          {history.length > 0 ? (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {history.map(row => (
                <div key={row.id} className="flex justify-between items-center p-4 border-2 border-gray-100 rounded-2xl hover:border-[#1cb0f6] transition-colors bg-gray-50">
                  <span className="text-gray-500 font-bold text-sm tracking-tight">{new Date(row.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-xl font-black text-[#58cc02]">{row.score} Puan</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
              Henüz oyun oynamadın.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
