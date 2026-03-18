'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ResultContent() {
  const searchParams = useSearchParams();
  const score = searchParams.get('score') || 0;
  const total = searchParams.get('total') || 0;

  return (
    <div className="text-center space-y-8 max-w-md w-full">
      <h1 className="text-4xl font-extrabold text-[#3c3c3c]">
        Tebrikler!
      </h1>
      
      <div className="bg-[#ffc800] p-8 rounded-2xl flex flex-col items-center justify-center border-b-4 border-[#cc8b00]">
        <span className="text-white font-bold text-xl mb-2">Toplam Puanın</span>
        <span className="text-6xl font-black text-white">{score} / {total}</span>
      </div>

      <Link 
        href="/"
        className="inline-block w-full py-4 text-white text-lg font-bold rounded-2xl bg-[#58cc02] hover:bg-[#58a700] transition-colors border-b-4 border-[#58a700] active:border-b-0 active:translate-y-1"
      >
        Tekrar Oyna
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
