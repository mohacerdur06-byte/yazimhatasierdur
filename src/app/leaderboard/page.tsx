'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy } from 'lucide-react';

type ScoreRow = {
  id: string;
  score: number;
  username: string | null;
  created_at: string;
};

export default function LeaderboardPage() {
  const [topScores, setTopScores] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      // Fetch top 50 scores, only those that have a non-null username
      const { data } = await supabase
        .from('scores')
        .select('id, score, username, created_at')
        .not('username', 'is', null) // Only show logged in users
        .order('score', { ascending: false })
        .order('created_at', { ascending: true }) // tie-breaker
        .limit(20);

      if (data) setTopScores(data);
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="text-center p-12 font-bold text-gray-400 text-xl">Yükleniyor...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 animate-fade-in-down">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#fff4e5] text-[#ffc800] mb-6 shadow-sm border-2 border-[#ffe0b2]">
          <Trophy size={48} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-black text-[#3c3c3c]">Liderlik Tablosu</h1>
        <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-sm">En İyi 20 Skor</p>
      </div>

      <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden shadow-sm">
        {topScores.length > 0 ? (
          <div>
            {topScores.map((row, index) => (
              <div 
                key={row.id} 
                className={`flex items-center justify-between p-5 border-b-2 border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-[#fffcf5]' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-xl border-2
                    ${index === 0 ? 'bg-[#ffc800] text-white border-[#cc8b00] shadow-sm transform scale-110' : 
                      index === 1 ? 'bg-[#e5e5e5] text-[#7a7a7a] border-[#b8b8b8]' : 
                      index === 2 ? 'bg-[#cd7f32] text-white border-[#8b5a2b]' : 'bg-white text-gray-400 border-gray-200'}`}
                  >
                    {index + 1}
                  </div>
                  <span className={`font-black tracking-tight ${index === 0 ? 'text-[#ffc800] text-2xl' : 'text-[#3c3c3c] text-xl'}`}>
                    {row.username || 'Gizli Oyuncu'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-[#58cc02]">{row.score}</span>
                  <span className="text-gray-400 font-bold text-sm uppercase">Puan</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-gray-50 flex flex-col items-center">
            <Trophy size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-400 font-bold text-lg">Henüz sıralamaya giren kimse yok.</p>
            <p className="text-gray-400 text-sm mt-2">İlk giren sen ol!</p>
          </div>
        )}
      </div>
    </div>
  );
}
