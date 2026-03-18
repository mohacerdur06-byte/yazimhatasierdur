import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-background">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#3c3c3c] tracking-tight">
          Yazım Hatası
        </h1>
        <p className="text-lg text-gray-500">
          Doğru yazımı öğrenerek Türkçeni geliştir! Eğlenceli ve hızlı bir pratik.
        </p>
        
        <Link 
          href="/quiz"
          className="inline-block w-full py-4 text-white text-lg font-bold rounded-2xl bg-[#58cc02] hover:bg-[#58a700] transition-colors border-b-4 border-[#58a700] active:border-b-0 active:translate-y-1"
        >
          Başla
        </Link>
      </div>
    </main>
  );
}
