import React, { useState, useEffect } from 'react';
import { TONES_DATA } from '../data/pinyinData';
import { ToneItem } from '../types';
import { Volume2, Sparkles, TrendingUp, Music } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { getAllMediaFiles } from '../services/mediaStorage';

export const TonesSection: React.FC = () => {
  const [activeTone, setActiveTone] = useState<ToneItem>(TONES_DATA[0]);

  // Bundled MP3 audio map for tones and comparison items
  const [customAudioMap, setCustomAudioMap] = useState<Record<string, string>>({});

  useEffect(() => {
    getAllMediaFiles().then((allMedia) => {
      const audioMap: Record<string, string> = {};
      for (const [k, url] of Object.entries(allMedia)) {
        if (k.startsWith('audio_tone_')) {
          audioMap[k.replace('audio_tone_', '')] = url;
        }
      }
      setCustomAudioMap(audioMap);
    });
  }, []);

  const playToneSound = (key: string, defaultPinyin: string) => {
    if (customAudioMap[key]) {
      audioEngine.playMp3Url(customAudioMap[key]);
    } else {
      audioEngine.speakPinyin(defaultPinyin);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E] uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#4A5D4E]" />
          Dấu Giọng Cao Độ MP3
        </div>
        <h2 className="text-2xl font-extrabold text-[#2D2A26]">
          4 Thanh Điệu Chính & Thanh Nhẹ Tiếng Trung (声调)
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
          Tiếng Trung có <strong>4 thanh chính</strong> và <strong>một thanh nhẹ</strong>. Thanh điệu thay đổi làm thay đổi nghĩa của từ vựng.
        </p>
      </div>

      {/* Pitch Contour Chart */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E4DF] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4DF] pb-4">
          <h3 className="text-base font-bold text-[#2D2A26] flex items-center gap-2 font-serif">
            <TrendingUp className="w-5 h-5 text-[#4A5D4E]" />
            Biểu Đồ Cao Độ Thanh Điệu 5 Nấc (Pitch Contour Chart)
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            Thang cao độ chuẩn 1 (Thấp) đến 5 (Cao)
          </span>
        </div>

        {/* Diagram Box */}
        <div className="relative w-full bg-[#F9F7F2] rounded-xl p-6 border border-[#E8E4DF] space-y-4">
          <div className="text-xs text-gray-500 font-mono uppercase tracking-widest flex items-center justify-between">
            <span>Sơ Đồ Biểu Đồ Độ Cao Giọng</span>
            <span className="text-[#4A5D4E] font-bold">Nấc 5 (Cao) ➔ Nấc 1 (Trầm)</span>
          </div>

          <div className="relative h-64 sm:h-72 w-full overflow-hidden border-l-2 border-b-2 border-[#E8E4DF]">
            <svg
              className="absolute inset-0 z-10 h-full w-full"
              viewBox="0 0 560 220"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Biểu đồ cao độ năm nấc của các thanh điệu tiếng Trung"
            >
              <g stroke="#D9DEE6" strokeWidth="1">
                <line x1="48" y1="20" x2="540" y2="20" />
                <line x1="48" y1="66" x2="540" y2="66" />
                <line x1="48" y1="112" x2="540" y2="112" />
                <line x1="48" y1="158" x2="540" y2="158" />
                <line x1="48" y1="204" x2="540" y2="204" />
              </g>

              <g fill="#94A3B8" fontSize="11" fontFamily="monospace">
                <text x="0" y="24">5 (Cao)</text>
                <text x="0" y="70">4</text>
                <text x="0" y="116">3 (Trung bình)</text>
                <text x="0" y="162">2</text>
                <text x="0" y="208">1 (Trầm)</text>
              </g>

              <line x1="88" y1="20" x2="158" y2="20" stroke="#4A5D4E" strokeWidth="4" strokeLinecap="round" />
              <text x="110" y="46" fill="#4A5D4E" fontSize="11" fontWeight="bold">T1: 5-5</text>

              <path d="M 180 112 Q 215 88 245 20" stroke="#10B981" strokeWidth="4" strokeLinecap="round" fill="none" />
              <text x="202" y="138" fill="#10B981" fontSize="11" fontWeight="bold">T2: 3-5</text>

              <path d="M 282 158 Q 318 214 365 66" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" fill="none" />
              <text x="295" y="195" fill="#F59E0B" fontSize="11" fontWeight="bold">T3: 2-1-4</text>

              <line x1="397" y1="20" x2="455" y2="204" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
              <text x="380" y="96" fill="#EF4444" fontSize="11" fontWeight="bold">T4: 5-1</text>

              <circle cx="505" cy="112" r="6" fill="#8B5CF6" />
              <text x="466" y="142" fill="#8B5CF6" fontSize="11" fontWeight="bold">Thanh Nhẹ</text>
            </svg>
          </div>
        </div>

        {/* 4 Tone Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TONES_DATA.map((tone) => {
            const isSelected = activeTone.toneNumber === tone.toneNumber;
            const toneKey = `tone_${tone.toneNumber}`;
            return (
              <div
                key={tone.toneNumber}
                onClick={() => {
                  setActiveTone(tone);
                  playToneSound(toneKey, tone.examplePinyin);
                }}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-[#F9F7F2] border-[#4A5D4E] shadow-xs'
                    : 'bg-white border-[#E8E4DF] hover:border-[#A8B5A2]'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold bg-white text-[#4A5D4E] px-2.5 py-0.5 rounded-full border border-[#E8E4DF]">
                    {tone.pitchContour}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playToneSound(toneKey, tone.examplePinyin);
                      }}
                      className="p-2 bg-[#4A5D4E] text-white rounded-xl hover:bg-[#3B4A3E] active:scale-90 transition-transform shadow-xs"
                      title="Nghe phát âm MP3"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-[#2D2A26] text-base font-serif flex items-center justify-between">
                    <span>{tone.name}</span>
                  </h4>
                  <div className="text-xs text-[#4A5D4E] font-semibold">{tone.chineseName}</div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">{tone.description}</p>

                <div className="pt-2 border-t border-[#E8E4DF] flex items-center justify-between">
                  <span className="text-base font-extrabold text-[#2D2A26] font-serif">
                    {tone.exampleWord}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{tone.exampleVietnamese}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Practice Grid */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E4DF] shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#2D2A26] flex items-center gap-2 font-serif">
          <Music className="w-5 h-5 text-[#4A5D4E]" />
          Luyện Nghe & Đọc So Sánh Dấu Giọng MP3
        </h3>
        <p className="text-xs text-gray-500">
          Bấm từng ô để nghe sự thay đổi cao độ giọng giữa 4 thanh điệu cùng nguyên âm:
        </p>

        <div className="grid grid-cols-4 gap-3 pt-2">
          {[
            { pinyin: 'ā', word: 'ā (Thanh 1)', meaning: 'Cao bằng' },
            { pinyin: 'á', word: 'á (Thanh 2)', meaning: 'Vút lên' },
            { pinyin: 'ǎ', word: 'ǎ (Thanh 3)', meaning: 'Hạ rồi uốn' },
            { pinyin: 'à', word: 'à (Thanh 4)', meaning: 'Rơi gắt' },
            { pinyin: 'ē', word: 'ē (Thanh 1)', meaning: 'Cao bằng' },
            { pinyin: 'é', word: 'é (Thanh 2)', meaning: 'Vút lên' },
            { pinyin: 'ě', word: 'ě (Thanh 3)', meaning: 'Hạ rồi uốn' },
            { pinyin: 'è', word: 'è (Thanh 4)', meaning: 'Rơi gắt' },
            { pinyin: 'ī', word: 'ī (Thanh 1)', meaning: 'Cao bằng' },
            { pinyin: 'í', word: 'í (Thanh 2)', meaning: 'Vút lên' },
            { pinyin: 'ǐ', word: 'ǐ (Thanh 3)', meaning: 'Hạ rồi uốn' },
            { pinyin: 'ì', word: 'ì (Thanh 4)', meaning: 'Rơi gắt' },
          ].map((item, idx) => {
            const gridKey = `grid_${item.pinyin}`;
            return (
              <div
                key={idx}
                className="p-3 bg-[#F9F7F2] hover:bg-white text-[#2D2A26] border border-[#E8E4DF] hover:border-[#A8B5A2] rounded-xl flex items-center justify-between shadow-2xs transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-serif text-[#4A5D4E] font-extrabold">{item.pinyin}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => playToneSound(gridKey, item.pinyin)}
                    className="p-1.5 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white rounded shadow-2xs active:scale-95 transition-transform cursor-pointer"
                    title="Nghe âm"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
