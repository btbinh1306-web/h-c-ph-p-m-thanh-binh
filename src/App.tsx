import React, { useState, useEffect } from 'react';
import { HeaderNav, ActiveTab } from './components/HeaderNav';
import { OverviewSection } from './components/OverviewSection';
import { InitialsSection } from './components/InitialsSection';
import { FinalsSection } from './components/FinalsSection';
import { TonesSection } from './components/TonesSection';
import { WordPracticeSection } from './components/WordPracticeSection';
import { RulesSection } from './components/RulesSection';
import { QuizGameSection } from './components/QuizGameSection';
import { MediaBackupModal } from './components/MediaBackupModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [mediaReloadKey, setMediaReloadKey] = useState(0);

  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem('hsk_pinyin_score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('hsk_pinyin_streak');
    return saved ? parseInt(saved, 10) : 1;
  });

  useEffect(() => {
    localStorage.setItem('hsk_pinyin_score', score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem('hsk_pinyin_streak', streak.toString());
  }, [streak]);

  const handleAddScore = (points: number) => {
    setScore((prev) => prev + points);
    setStreak((prev) => prev + 1);
  };

  const handleDataRestored = () => {
    setMediaReloadKey((prev) => prev + 1);
  };

  return (
    <div translate="no" className="min-h-screen bg-[#FDFCFB] text-[#2D2A26] flex flex-col font-sans selection:bg-[#A8B5A2]/40 selection:text-[#2D2A26] notranslate">
      {/* Navigation Bar */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        score={score}
        streak={streak}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main key={mediaReloadKey} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewSection onNavigate={setActiveTab} />}
        {activeTab === 'initials' && <InitialsSection onAddScore={handleAddScore} />}
        {activeTab === 'finals' && <FinalsSection onAddScore={handleAddScore} />}
        {activeTab === 'tones' && <TonesSection />}
        {activeTab === 'words' && <WordPracticeSection onAddScore={handleAddScore} />}
        {activeTab === 'rules' && <RulesSection />}
        {activeTab === 'quiz' && <QuizGameSection onAddScore={handleAddScore} />}
      </main>

      {/* Media Backup Modal */}
      <MediaBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={handleDataRestored}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8E4DF] py-6 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#4A5D4E] text-base">标准教程</span>
            <span>Giáo Trình Phát Âm Pinyin Tiếng Trung (Âm MP3 Chuẩn & Trò Chơi Đoán Âm)</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <span>Thiết kế tối giản • Lược bỏ từ mới & nét chữ • Ngữ âm chuyên sâu</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
