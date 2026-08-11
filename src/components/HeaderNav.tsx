import React from 'react';
import { BookOpen, Volume2, Gamepad2, Sparkles, Award, Flame, Lightbulb, Music, GraduationCap } from 'lucide-react';

export type ActiveTab = 'overview' | 'initials' | 'finals' | 'tones' | 'words' | 'rules' | 'quiz';

interface HeaderNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  score: number;
  streak: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ activeTab, setActiveTab, score, streak }) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Tổng Quan', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'initials', label: 'Thanh Mẫu (21)', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'finals', label: 'Vận Mẫu (36)', icon: <Music className="w-4 h-4" /> },
    { id: 'tones', label: 'Thanh Điệu', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'words', label: 'Bài Tập Đọc Từ', icon: <GraduationCap className="w-4 h-4" />, badge: 'Luyện MP3' },
    { id: 'rules', label: 'Quy Tắc Pinyin', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'quiz', label: 'Trò Chơi Đoán Âm', icon: <Gamepad2 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FDFCFB] border-b border-[#E8E4DF] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4A5D4E] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <span className="font-serif font-bold text-xl">拼</span>
            </div>
            <div>
              <h1 className="font-bold text-[#2D2A26] text-base sm:text-lg leading-tight flex items-center gap-2 font-serif">
                Học Phát Âm Pinyin
                <span className="text-[10px] font-sans font-semibold bg-[#A8B5A2]/30 text-[#4A5D4E] px-2 py-0.5 rounded-full border border-[#A8B5A2]/50 hidden sm:inline-block">
                  Chuẩn MP3
                </span>
              </h1>
              <p className="text-[11px] text-gray-500 font-medium hidden md:block">Video Khẩu Hình • Âm MP3 Chuẩn • Trò Chơi Ôn Tập Luyện Nghe</p>
            </div>
          </div>

          {/* User Score */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-[#F9F7F2] border border-[#E8E4DF] text-[#4A5D4E] px-2.5 py-1.5 rounded-full text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>{score} điểm</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#F9F7F2] border border-[#E8E4DF] text-[#2D2A26] px-2.5 py-1.5 rounded-full text-xs font-semibold hidden sm:flex">
              <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>{streak} chuỗi</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Scrollable Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 border-t border-[#E8E4DF]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#4A5D4E] text-white shadow-xs scale-[1.02]'
                    : 'bg-[#F9F7F2] text-[#2D2A26] border border-[#E8E4DF] hover:border-[#A8B5A2]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#A8B5A2]/30 text-[#4A5D4E]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
