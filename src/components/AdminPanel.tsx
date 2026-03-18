'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trash2, Edit2, Plus, Save, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Question = {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  correct_answer: 'A' | 'B';
  difficulty: number;
};

type Settings = {
  id: string;
  questions_per_game: number;
  points_per_question: number;
};

export default function AdminPanel() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Question>>({});
  
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: qData } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
    if (qData) setQuestions(qData);

    const { data: sData } = await supabase.from('settings').select('*').limit(1).single();
    if (sData) setSettings(sData);
    setLoading(false);
  }

  const handleSaveSettings = async () => {
    if (!settings) return;
    const { error } = await supabase.from('settings').update({
      questions_per_game: settings.questions_per_game,
      points_per_question: settings.points_per_question
    }).eq('id', settings.id);
    
    if (error) {
      alert('Ayarlar kaydedilirken hata oluştu. Supabase RLS yetkilerini kontrol edin.');
    } else {
      alert('Ayarlar başarıyla kaydedildi!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu soruyu silmek istediğinize emin misiniz?')) return;
    
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) {
      alert('Hata! Veritabanı yetkilerinizi (RLS) kontrol edin.');
    } else {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setFormData(q);
    setIsAdding(false);
  };

  const handleSaveQuestion = async () => {
    if (!formData.question_text || !formData.option_a || !formData.option_b || !formData.correct_answer) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    if (editingId) {
      // Update
      const { data, error } = await supabase.from('questions').update(formData).eq('id', editingId).select().single();
      if (!error && data) {
        setQuestions(questions.map(q => q.id === editingId ? data : q));
        setEditingId(null);
      } else {
        alert('Kaydetme hatası (RLS).');
      }
    } else {
      // Insert
      const { data, error } = await supabase.from('questions').insert([formData]).select().single();
      if (!error && data) {
        setQuestions([data, ...questions]);
        setIsAdding(false);
      } else {
        alert('Ekleme hatası (RLS).');
      }
    }
    setFormData({});
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 font-bold text-xl">Yükleniyor...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-4xl font-black text-[#3c3c3c]">Yönetici Paneli</h1>
        <Link href="/" className="text-[#1cb0f6] hover:bg-[#ddf4ff] font-bold py-2 px-4 rounded-xl transition-colors flex items-center gap-2">
          <ArrowLeft size={20} /> Oyuna Dön
        </Link>
      </div>

      {/* Settings Section */}
      <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border-2 border-gray-100">
        <h2 className="text-2xl font-extrabold mb-6 text-[#3c3c3c]">Oyun Ayarları</h2>
        {settings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-500 font-black mb-3 uppercase text-sm tracking-wider">Oyun Başına Soru Sayısı</label>
              <input 
                type="number"
                value={settings.questions_per_game}
                onChange={e => setSettings({...settings, questions_per_game: Number(e.target.value)})}
                className="w-full border-2 border-gray-200 p-4 rounded-2xl focus:border-[#1cb0f6] outline-none font-bold text-xl text-[#3c3c3c]"
              />
            </div>
            <div>
              <label className="block text-gray-500 font-black mb-3 uppercase text-sm tracking-wider">Soru Başına Puan</label>
              <input 
                type="number"
                value={settings.points_per_question}
                onChange={e => setSettings({...settings, points_per_question: Number(e.target.value)})}
                className="w-full border-2 border-gray-200 p-4 rounded-2xl focus:border-[#1cb0f6] outline-none font-bold text-xl text-[#3c3c3c]"
              />
            </div>
          </div>
        )}
        <button 
          onClick={handleSaveSettings}
          className="mt-8 bg-[#58cc02] text-white font-bold py-4 px-8 rounded-2xl hover:bg-[#58a700] transition-colors flex items-center gap-2 active:translate-y-1"
        >
          <Save size={24} strokeWidth={2.5} /> Ayarları Kaydet
        </button>
      </section>

      {/* Questions Section */}
      <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border-2 border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-extrabold text-[#3c3c3c]">Sorular <span className="text-gray-400">({questions.length})</span></h2>
          <button 
            onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ correct_answer: 'A', difficulty: 1, question_text: 'Aşağıdaki kelimelerden hangisi doğru yazılmıştır?' }); }}
            className="bg-[#1cb0f6] text-white font-bold py-3 px-6 rounded-2xl hover:bg-[#1899d6] transition-colors flex items-center gap-2 active:translate-y-1 w-full sm:w-auto justify-center"
          >
            <Plus size={24} strokeWidth={2.5} /> Yeni Soru
          </button>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="bg-[#f7f7f7] p-6 md:p-8 rounded-3xl border-2 border-gray-200 mb-8 space-y-6 animate-fade-in-down">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-extrabold text-2xl text-[#3c3c3c]">{editingId ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600 bg-white p-2 border-2 border-gray-200 rounded-xl hover:border-gray-300">
                <X size={24} strokeWidth={3} />
              </button>
            </div>
            
            <div>
              <label className="block text-gray-500 font-black mb-3 uppercase text-sm tracking-wider">Soru Metni</label>
              <input 
                type="text"
                value={formData.question_text || ''}
                onChange={e => setFormData({...formData, question_text: e.target.value})}
                placeholder="Örn: Aşağıdaki kelimelerden hangisi doğru yazılmıştır?"
                className="w-full border-2 border-gray-200 p-4 rounded-2xl outline-none focus:border-[#1cb0f6] font-bold text-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-500 font-black mb-3 uppercase text-sm tracking-wider">A Şıkkı</label>
                <input 
                  type="text"
                  value={formData.option_a || ''}
                  onChange={e => setFormData({...formData, option_a: e.target.value})}
                  className={`w-full border-2 border-gray-200 p-4 rounded-2xl outline-none font-bold text-lg transition-colors focus:border-[#1cb0f6] ${formData.correct_answer === 'A' ? 'border-[#58cc02] bg-[#d7ffb8] text-[#58a700]' : ''}`}
                />
              </div>
              <div>
                <label className="block text-gray-500 font-black mb-3 uppercase text-sm tracking-wider">B Şıkkı</label>
                <input 
                  type="text"
                  value={formData.option_b || ''}
                  onChange={e => setFormData({...formData, option_b: e.target.value})}
                  className={`w-full border-2 border-gray-200 p-4 rounded-2xl outline-none font-bold text-lg transition-colors focus:border-[#1cb0f6] ${formData.correct_answer === 'B' ? 'border-[#58cc02] bg-[#d7ffb8] text-[#58a700]' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 font-black mb-3 uppercase text-sm tracking-wider">Doğru Cevabı Seç</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setFormData({...formData, correct_answer: 'A'})}
                  className={`flex-1 p-4 rounded-2xl border-2 font-black text-xl transition-all ${formData.correct_answer === 'A' ? 'border-[#58cc02] bg-[#d7ffb8] text-[#58a700]' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}
                >
                  Gösterilen: A Şıkkı
                </button>
                <button
                  onClick={() => setFormData({...formData, correct_answer: 'B'})}
                  className={`flex-1 p-4 rounded-2xl border-2 font-black text-xl transition-all ${formData.correct_answer === 'B' ? 'border-[#58cc02] bg-[#d7ffb8] text-[#58a700]' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}
                >
                  Gösterilen: B Şıkkı
                </button>
              </div>
            </div>

            <button 
              onClick={handleSaveQuestion}
              className="mt-4 w-full md:w-auto bg-[#58cc02] text-white font-bold py-4 px-10 rounded-2xl hover:bg-[#58a700] transition-colors flex items-center justify-center gap-2 text-lg active:translate-y-1"
            >
              <Save size={24} strokeWidth={2.5} /> {editingId ? 'Değişiklikleri Kaydet' : 'Soruyu Ekle'}
            </button>
          </div>
        )}

        {/* Question List */}
        <div className="space-y-4">
          {questions.map(q => (
            <div key={q.id} className="border-2 border-gray-200 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between hover:border-[#1cb0f6] transition-colors gap-4">
              <div className="flex-1 pr-4">
                <p className="font-extrabold text-xl text-[#3c3c3c] mb-3">{q.question_text}</p>
                <div className="flex flex-wrap gap-4 text-base font-bold">
                  <div className={`px-3 py-1 rounded-lg border-2 ${q.correct_answer === 'A' ? 'bg-[#d7ffb8] border-[#b2f26c] text-[#58a700]' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    A: {q.option_a}
                  </div>
                  <div className={`px-3 py-1 rounded-lg border-2 ${q.correct_answer === 'B' ? 'bg-[#d7ffb8] border-[#b2f26c] text-[#58a700]' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    B: {q.option_b}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button onClick={() => handleEdit(q)} className="p-3 text-gray-400 hover:text-[#1cb0f6] bg-white border-2 border-gray-200 rounded-2xl hover:border-[#84d8ff] hover:bg-[#ddf4ff] transition-all active:translate-y-1">
                  <Edit2 size={24} strokeWidth={2.5} />
                </button>
                <button onClick={() => handleDelete(q.id)} className="p-3 text-gray-400 hover:text-[#ea2b2b] bg-white border-2 border-gray-200 rounded-2xl hover:border-[#ffbfc1] hover:bg-[#ffdfe0] transition-all active:translate-y-1">
                  <Trash2 size={24} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="text-center p-8 text-gray-400 font-bold border-2 border-dashed border-gray-300 rounded-3xl">
              Henüz soru eklenmemiş.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
