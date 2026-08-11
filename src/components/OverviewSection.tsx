import React from 'react';
import { Volume2, Sparkles, ArrowRight, Lightbulb, Gamepad2, BookOpen } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { ActiveTab } from './HeaderNav';

interface OverviewSectionProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ onNavigate }) => {
  const playSample = () => {
    audioEngine.playMp3Url('/audio/audio_initial_example-h.mp3').catch(() => {
      audioEngine.speakPinyin('hǎo');
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Clean Minimalist Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#4A5D4E] text-white p-6 sm:p-10 shadow-xs border border-[#3B4A3E]">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#A8B5A2]">
            <Sparkles className="w-3.5 h-3.5 text-[#A8B5A2]" />
            Giáo Trình Ngữ Âm Chuẩn Pinyin MP3
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight font-serif">
            Học Phát Âm Tiếng Trung Toàn Diện
          </h2>
          <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
            Tập trung hoàn toàn vào trọn bộ <strong>21 Thanh Mẫu</strong>, <strong>36 Vận Mẫu</strong>, <strong>4 Thanh Điệu</strong> và <strong>Video Khẩu Hình 3D Chuẩn</strong> cùng trò chơi thử thách âm thanh trực quan giúp ghi nhớ sâu sắc (Lược bỏ từ mới & nét chữ).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('initials')}
              className="bg-white text-[#4A5D4E] hover:bg-gray-100 font-bold px-5 py-2.5 rounded-xl text-xs shadow-xs transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              Học Thanh Mẫu MP3
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className="bg-[#3B4A3E] hover:bg-[#2F3C32] text-white font-semibold px-5 py-2.5 rounded-xl text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4" />
              Chơi Game Luyện Nghe
            </button>
          </div>
        </div>

        {/* Subtle Watermark */}
        <div className="absolute -right-8 -bottom-10 text-[180px] font-serif opacity-10 select-none pointer-events-none text-white">
          拼
        </div>
      </div>

      {/* Anatomy Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E4DF] shadow-xs space-y-6">
        <div className="border-b border-[#E8E4DF] pb-4">
          <h3 className="text-lg font-bold text-[#2D2A26] flex items-center gap-2 font-serif">
            <Lightbulb className="w-5 h-5 text-[#4A5D4E]" />
            Cấu Trúc Âm Tiết Tiếng Trung Pinyin (Syllable Anatomy)
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Mỗi âm tiết Pinyin chuẩn bao gồm 3 thành phần chính hợp thành:
          </p>
        </div>

        {/* Interactive Anatomy Breakdown */}
        <div className="bg-[#F9F7F2] rounded-xl p-6 border border-[#E8E4DF] relative overflow-hidden">
          <div className="text-center space-y-2 mb-8">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Ví Dụ Âm Tiết Mẫu
            </span>
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl font-serif font-extrabold text-[#2D2A26]">好</span>
              <span className="text-2xl text-gray-400">➔</span>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={playSample}
                  className="group relative flex items-center gap-2 bg-white text-[#2D2A26] border border-[#E8E4DF] hover:border-[#A8B5A2] px-5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Nghe MP3 chuẩn"
                >
                  <span className="text-3xl font-extrabold font-serif text-[#4A5D4E]">hǎo</span>
                  <Volume2 className="w-5 h-5 text-[#4A5D4E] group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">Bấm vào nút "hǎo" để nghe tệp âm thanh MP3</p>
          </div>

          {/* 3 Component Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => onNavigate('initials')}
              className="bg-white rounded-xl p-4 border border-[#E8E4DF] hover:border-[#A8B5A2] shadow-2xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold bg-[#F9F7F2] text-[#4A5D4E] px-2.5 py-0.5 rounded-full border border-[#E8E4DF]">
                  Thanh Mẫu (声母)
                </span>
                <Volume2 className="w-4 h-4 text-[#4A5D4E]" />
              </div>
              <div className="text-3xl font-bold text-[#4A5D4E] my-1 font-serif">h</div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Phụ âm mở đầu đứng trước. Trọn bộ <strong>21 thanh mẫu</strong>.
              </p>
            </div>

            <div
              onClick={() => onNavigate('finals')}
              className="bg-white rounded-xl p-4 border border-[#E8E4DF] hover:border-[#A8B5A2] shadow-2xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold bg-[#F9F7F2] text-[#4A5D4E] px-2.5 py-0.5 rounded-full border border-[#E8E4DF]">
                  Vận Mẫu (韵母)
                </span>
                <Volume2 className="w-4 h-4 text-[#4A5D4E]" />
              </div>
              <div className="text-3xl font-bold text-[#4A5D4E] my-1 font-serif">ao</div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Nguyên âm phần vần đứng sau. Trọn bộ <strong>36 vận mẫu</strong>.
              </p>
            </div>

            <div
              onClick={() => onNavigate('tones')}
              className="bg-white rounded-xl p-4 border border-[#E8E4DF] hover:border-[#A8B5A2] shadow-2xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold bg-[#F9F7F2] text-[#4A5D4E] px-2.5 py-0.5 rounded-full border border-[#E8E4DF]">
                  Thanh Điệu (声调)
                </span>
                <Volume2 className="w-4 h-4 text-[#4A5D4E]" />
              </div>
              <div className="text-3xl font-bold text-[#4A5D4E] my-1 font-serif">ˇ (Thanh 3)</div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Dấu giọng trầm bổng. Gồm <strong>4 thanh chính</strong> + thanh nhẹ.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('initials')}
          className="bg-white p-5 rounded-2xl border border-[#E8E4DF] hover:border-[#A8B5A2] shadow-2xs transition-all cursor-pointer space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-[#F9F7F2] border border-[#E8E4DF] text-[#4A5D4E] flex items-center justify-center font-bold text-sm">
            21
          </div>
          <h4 className="font-bold text-[#2D2A26] text-sm">21 Thanh Mẫu</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Video khẩu hình môi lưỡi & ô kẹp 4 dòng kẻ bính âm.
          </p>
          <div className="flex items-center text-xs font-bold text-[#4A5D4E] gap-1 pt-1">
            <span>Học thanh mẫu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('finals')}
          className="bg-white p-5 rounded-2xl border border-[#E8E4DF] hover:border-[#A8B5A2] shadow-2xs transition-all cursor-pointer space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-[#F9F7F2] border border-[#E8E4DF] text-[#4A5D4E] flex items-center justify-center font-bold text-sm">
            36
          </div>
          <h4 className="font-bold text-[#2D2A26] text-sm">36 Vận Mẫu</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Đơn, Kép & Mũi với âm thanh MP3 chuẩn.
          </p>
          <div className="flex items-center text-xs font-bold text-[#4A5D4E] gap-1 pt-1">
            <span>Học vận mẫu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('tones')}
          className="bg-white p-5 rounded-2xl border border-[#E8E4DF] hover:border-[#A8B5A2] shadow-2xs transition-all cursor-pointer space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-[#F9F7F2] border border-[#E8E4DF] text-[#4A5D4E] flex items-center justify-center font-bold text-sm">
            4
          </div>
          <h4 className="font-bold text-[#2D2A26] text-sm">Thanh Điệu (声调)</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Biểu đồ cao độ 5 nấc & nghe thử âm 4 thanh.
          </p>
          <div className="flex items-center text-xs font-bold text-[#4A5D4E] gap-1 pt-1">
            <span>Học thanh điệu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('quiz')}
          className="bg-white p-5 rounded-2xl border border-[#E8E4DF] hover:border-[#A8B5A2] shadow-2xs transition-all cursor-pointer space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-[#F9F7F2] border border-[#E8E4DF] text-[#4A5D4E] flex items-center justify-center font-bold text-sm">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-[#2D2A26] text-sm">Game Luyện Nghe</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Thử thách phản xạ đoán âm thanh bính âm MP3.
          </p>
          <div className="flex items-center text-xs font-bold text-[#4A5D4E] gap-1 pt-1">
            <span>Chơi game ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
