'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ResultContent() {
  const searchParams = useSearchParams();
  const score = searchParams.get('score') || 0;
  const total = searchParams.get('total') || 0;
  const failed = searchParams.get('failed') === 'true';

  return (
    <div className="text-center space-y-8 max-w-md w-full animate-fade-in-down">
      <h1 className={`text-5xl font-black mb-4 ${failed ? 'text-[#ea2b2b]' : 'text-[#3c3c3c]'}`}>
        {failed ? 'Canın Bitti!' : 'Tebrikler!'}
      </h1>
      
      {failed && <p className="text-gray-500 font-bold mb-4">Oyunu bitirebilmek için daha dikkatli olmalısın.</p>}
      
      <div className={`${failed ? 'bg-[#ffdfe0] border-[#ffbfc1]' : 'bg-[#ffc800] border-[#cc8b00]'} p-8 rounded-3xl flex flex-col items-center justify-center border-b-4 shadow-sm`}>
        <span className={`${failed ? 'text-[#ea2b2b]' : 'text-white'} font-bold text-xl mb-2`}>Toplam Puanın</span>
        <span className={`text-7xl font-black ${failed ? 'text-[#ea2b2b]' : 'text-white'}`}>{score} / {total}</span>
      </div>

      <Link 
        href="/"
        className="inline-block w-full py-5 text-white text-xl font-bold rounded-2xl bg-[#1cb0f6] hover:bg-[#1899d6] transition-colors border-b-4 border-[#1899d6] active:border-b-0 active:translate-y-1 mt-4"
      >
        Ana Menüye Dön
      </Link>
    </div>
  );
}

export default function ResultPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white">
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <ResultContent />
      </Suspense>
    </main>
  );
}
