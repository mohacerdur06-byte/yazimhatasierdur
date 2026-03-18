'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ProgressBar from './ProgressBar';
import { Heart } from 'lucide-react';

type Question = {
  id: string; // uuid
  question_text: string;
  option_a: string;
  option_b: string;
  correct_answer: 'A' | 'B';
  difficulty: number;
};

// Generates an immediate synth sound (zero external files required!)
const playFeedbackSound = (isCorrect: boolean) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (isCorrect) {
      // Happy ping sound (C5 -> C6)
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); 
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } else {
      // Sad buzz sound
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) {
    console.log('Audio not supported or blocked by browser', e);
  }
};

export default function Quiz() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | null>(null);
  const [loading, setLoading] = useState(true);
  const [lives, setLives] = useState(5);

  // settings
  const [pointsPerQuestion, setPointsPerQuestion] = useState(1);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch settings
      const { data: settingsData } = await supabase.from('settings').select('*').limit(1).single();
      const points = settingsData?.points_per_question || 1;
      const qCount = settingsData?.questions_per_game || 20;

      setPointsPerQuestion(points);

      // 2. Fetch questions limit to 500 to allow in-memory shuffling for randomness
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .limit(500);
      
      let fetchedQuestions: Question[] = [];

      if (error) {
        console.error('Error fetching questions:', error);
      } else if (data && data.length > 0) {
        fetchedQuestions = [...data];
      } else {
        // Fallback data if DB is completely empty
        fetchedQuestions = [
          { id: '1', question_text: 'Aşağıdaki kelimelerden hangisi doğru yazılmıştır?', option_a: 'Yalnız', option_b: 'Yanlız', correct_answer: 'A', difficulty: 1 },
          { id: '2', question_text: 'Aşağıdaki kelimelerden hangisi doğru yazılmıştır?', option_a: 'Herkez', option_b: 'Herkes', correct_answer: 'B', difficulty: 1 },
          { id: '3', question_text: 'Aşağıdaki kelimelerden hangisi doğru yazılmıştır?', option_a: 'Sürpriz', option_b: 'Süpriz', correct_answer: 'A', difficulty: 2 },
          { id: '4', question_text: 'Aşağıdaki kelimelerden hangisi doğru yazılmıştır?', option_a: 'Şöför', option_b: 'Şoför', correct_answer: 'B', difficulty: 2 }
        ];
      }

      // 3. Shuffle array to get random questions
      const shuffled = fetchedQuestions.sort(() => 0.5 - Math.random());
      
      // 4. Limit to questionsPerGame (e.g., 20)
      setQuestions(shuffled.slice(0, qCount));
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSelect = async (answer: 'A' | 'B') => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks
    
    setSelectedAnswer(answer);
    
    let currentScore = score;
    const currentQ = questions[currentIndex];
    const isCorrect = answer === currentQ.correct_answer;
    
    // Play sound snippet
    playFeedbackSound(isCorrect);
    
    if (isCorrect) {
      currentScore = score + pointsPerQuestion;
      setScore(currentScore);
    } else {
      setLives(prev => Math.max(0, prev - 1));
    }

    // Wait exactly 1 second for automatic progression
    setTimeout(async () => {
      const willSurvive = isCorrect || lives > 1;
      
      if (currentIndex < questions.length - 1 && willSurvive) {
        setSelectedAnswer(null);
        setCurrentIndex((i: number) => i + 1);
      } else {
        // Quiz finished, check auth, save score, and update gamification profile
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const insertData: { score: number; user_id?: string; username?: string } = { score: currentScore };
          
          if (session?.user) {
            insertData.user_id = session.user.id;
            insertData.username = session.user.user_metadata?.username;
            
            // Gamification Logging
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            const today = new Date().toISOString().split('T')[0];
            let newStreak = profile?.streak_days || 0;
            const lastPlayed = profile?.last_played_at;

            if (lastPlayed) {
              const lastDate = new Date(lastPlayed);
              const todaysDate = new Date(today);
              const diffTime = Math.abs(todaysDate.getTime() - lastDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
              
              if (diffDays === 1) {
                newStreak += 1;
              } else if (diffDays > 1) {
                newStreak = 1;
              }
            } else {
              newStreak = 1;
            }

            const newXp = (profile?.xp || 0) + (currentScore * 10);
            const achievements = new Set(profile?.achievements || []);
            
            achievements.add('İlk Adım 🐣'); // First game played
            if (currentScore === questions.length * pointsPerQuestion) {
              achievements.add('Kusursuz 👑'); // Perfect score
            }
            if (newStreak >= 3) {
              achievements.add('Ateşli 🔥'); // 3 day streak
            }

            // Upsert profile
            await supabase.from('user_profiles').upsert({
              user_id: session.user.id,
              username: session.user.user_metadata?.username,
              xp: newXp,
              streak_days: newStreak,
              last_played_at: today,
              achievements: Array.from(achievements)
            });
          }
          
          // Save the history score
          await supabase.from('scores').insert([insertData]);
        } catch (err) {
          console.error('Failed to save score or profile', err);
        }

        // Navigate to result
        const failedParam = !willSurvive ? '&failed=true' : '';
        router.push(`/result?score=${currentScore}&total=${questions.length * pointsPerQuestion}${failedParam}`);
      }
    }, 1000);
  };

  if (loading) {
    return <div className="flex flex-col min-h-screen justify-center items-center font-bold text-gray-500">Yükleniyor...</div>;
  }

  if (questions.length === 0) {
    return <div className="flex flex-col min-h-screen justify-center items-center text-gray-500">Soru bulunamadı.</div>;
  }

  const currentQ = questions[currentIndex];

  // Logic to determine button styling based on selection state & animation
  const getButtonClass = (optionParam: 'A' | 'B') => {
    const isBaseClass = "relative w-full p-6 pl-20 rounded-2xl border-[3px] text-left text-2xl font-black transition-all duration-200 ease-in-out";
    
    if (!selectedAnswer) {
      // Default state
      return `${isBaseClass} border-gray-200 hover:border-[#84d8ff] hover:bg-[#ddf4ff] hover:text-[#1cb0f6] text-[#3c3c3c] bg-white shadow-sm hover:-translate-y-1 active:translate-y-0`;
    }

    // If an answer has been selected, evaluate highlighting
    const isCorrectChoice = optionParam === currentQ.correct_answer;
    const isSelectedChoice = optionParam === selectedAnswer;

    if (isCorrectChoice) {
      // Correct answer gets green highlight and "pops" if it was picked
      return `${isBaseClass} border-[#58cc02] bg-[#d7ffb8] text-[#58a700] ring-4 ring-[#b2f26c] ring-opacity-50 ${isSelectedChoice ? 'animate-pop' : ''}`;
    }

    if (isSelectedChoice && !isCorrectChoice) {
      // If user selected the wrong answer, highlight it red and "shake"
      return `${isBaseClass} border-[#ff4b4b] bg-[#ffdfe0] text-[#ea2b2b] ring-4 ring-[#ffbfc1] ring-opacity-50 animate-shake`;
    }

    // Unselected wrong answers just fade out
    return `${isBaseClass} border-gray-200 bg-gray-50 text-gray-400 opacity-60 scale-95 origin-center`;
  };

  const getLetterClass = (optionParam: 'A' | 'B') => {
    const isBaseClass = "absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border-2 transition-all duration-200 ease-in-out";
    
    if (!selectedAnswer) {
      return `${isBaseClass} bg-gray-100 text-gray-500 border-gray-200`;
    }
    
    const isCorrectChoice = optionParam === currentQ.correct_answer;
    const isSelectedChoice = optionParam === selectedAnswer;

    if (isCorrectChoice) {
      return `${isBaseClass} bg-[#58cc02] text-white border-[#58cc02]`;
    }
    if (isSelectedChoice && !isCorrectChoice) {
      return `${isBaseClass} bg-[#ff4b4b] text-white border-[#ff4b4b]`;
    }

    return `${isBaseClass} bg-gray-100 text-gray-400 border-gray-200`;
  }

  // Animate the progress bar dynamically when an answer is selected
  // So it feels like you 'earned' the progress right away instead of waiting 1s
  const displayedProgress = selectedAnswer ? currentIndex + 1 : currentIndex;

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto w-full relative bg-white selection:bg-[#84d8ff] selection:text-white">
      <div className="p-6 pt-12 flex-1 flex flex-col">
        <div className="mb-10 animate-fade-in-down">
          <div className="flex justify-between items-center mb-4 text-[#afafaf] font-bold">
            <span className="text-xl uppercase tracking-wider">Soru {currentIndex + 1} / {questions.length}</span>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Heart 
                    key={i} 
                    size={28} 
                    fill={i < lives ? "#ff4b4b" : "none"} 
                    className={i < lives ? "text-[#ff4b4b]" : "text-gray-200"} 
                    strokeWidth={i < lives ? 0 : 3} 
                  />
                ))}
              </div>
              <span className="text-xl uppercase tracking-wider ml-2">Puan: <span className="text-[#ffc800]">{score}</span></span>
            </div>
          </div>
          <ProgressBar current={displayedProgress} total={questions.length} />
        </div>
        
        <div className="flex-1 flex flex-col justify-center animate-fade-in">
          <h2 className="text-4xl font-extrabold mb-12 mt-4 text-[#3c3c3c] text-center leading-snug tracking-tight">
            {currentQ.question_text || 'Aşağıdaki kelimelerden hangisi doğru yazılmıştır?'}
          </h2>
          
          <div className="space-y-6">
            <button
              onClick={() => handleSelect('A')}
              disabled={selectedAnswer !== null}
              className={getButtonClass('A')}
            >
              <span className={getLetterClass('A')}>A</span>
              {currentQ.option_a}
            </button>
            
            <button
              onClick={() => handleSelect('B')}
              disabled={selectedAnswer !== null}
              className={getButtonClass('B')}
            >
              <span className={getLetterClass('B')}>B</span>
              {currentQ.option_b}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
