import React, { useState, useEffect } from 'react';
import { TONES_DATA } from '../data/pinyinData';
import { ToneItem } from '../types';
import { Volume2, Sparkles, TrendingUp, Music, Upload, Trash2 } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { saveMediaFile, getAllMediaFiles, deleteMediaFile } from '../services/mediaStorage';

export const TonesSection: React.FC = () => {
  const [activeTone, setActiveTone] = useState<ToneItem>(TONES_DATA[0]);

  // Custom MP3 audio map for tones and comparison items
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

  const handleAudioUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const storageKey = `audio_tone_${key}`;
      const url = await saveMediaFile(storageKey, file);
      setCustomAudioMap((prev) => ({
        ...prev,
        [key]: url,
      }));
    }
  };

  const removeCustomAudio = async (key: string) => {
    const storageKey = `audio_tone_${key}`;
    await deleteMediaFile(storageKey);
    setCustomAudioMap((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

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

          <div className="relative h-52 w-full flex items-center justify-between px-6 border-l-2 border-b-2 border-[#E8E4DF]">
            <div className="absolute inset-x-6 top-3 border-b border-gray-200 flex justify-between text-[10px] text-gray-400 font-mono">
              <span>5 (Cao)</span>
            </div>
            <div className="absolute inset-x-6 top-14 border-b border-gray-200 flex justify-between text-[10px] text-gray-400 font-mono">
              <span>4</span>
            </div>
            <div className="absolute inset-x-6 top-24 border-b border-gray-200 flex justify-between text-[10px] text-gray-400 font-mono">
              <span>3 (Trung bình)</span>
            </div>
            <div className="absolute inset-x-6 top-34 border-b border-gray-200 flex justify-between text-[10px] text-gray-400 font-mono">
              <span>2</span>
            </div>
            <div className="absolute inset-x-6 top-44 border-b border-gray-200 flex justify-between text-[10px] text-gray-400 font-mono">
              <span>1 (Trầm)</span>
            </div>

            {/* Trajectory Lines */}
            <svg className="absolute inset-6 w-[calc(100%-3rem)] h-[calc(100%-3rem)] pointer-events-none" viewBox="0 0 500 160">
              <line x1="20" y1="15" x2="100" y2="15" stroke="#4A5D4E" strokeWidth="4" strokeLinecap="round" />
              <text x="50" y="35" fill="#4A5D4E" fontSize="11" fontWeight="bold">T1: 5-5</text>

              <path d="M 120 80 Q 160 50 190 15" stroke="#10B981" strokeWidth="4" strokeLinecap="round" fill="none" />
              <text x="140" y="95" fill="#10B981" fontSize="11" fontWeight="bold">T2: 3-5</text>

              <path d="M 220 110 Q 250 150 290 40" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" fill="none" />
              <text x="240" y="145" fill="#F59E0B" fontSize="11" fontWeight="bold">T3: 2-1-4</text>

              <line x1="320" y1="15" x2="390" y2="140" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
              <text x="310" y="65" fill="#EF4444" fontSize="11" fontWeight="bold">T4: 5-1</text>

              <circle cx="440" cy="90" r="6" fill="#8B5CF6" />
              <text x="420" y="115" fill="#8B5CF6" fontSize="11" fontWeight="bold">Thanh Nhẹ</text>
            </svg>
          </div>
        </div>

        {/* 4 Tone Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TONES_DATA.map((tone) => {
            const isSelected = activeTone.toneNumber === tone.toneNumber;
            const toneKey = `tone_${tone.toneNumber}`;
            const hasCustomMp3 = Boolean(customAudioMap[toneKey]);

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
                    <label
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-white hover:bg-gray-100 text-gray-600 rounded-lg border border-[#E8E4DF] hover:border-[#A8B5A2] transition-transform active:scale-90 cursor-pointer"
                      title="Chèn file MP3 tùy chỉnh cho thanh điệu này"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#4A5D4E]" />
                      <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.ogg"
                        className="hidden"
                        onChange={(e) => handleAudioUpload(toneKey, e)}
                      />
                    </label>

                    {hasCustomMp3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustomAudio(toneKey);
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition-transform active:scale-90 cursor-pointer"
                        title="Xóa MP3 tự chèn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

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
                    {hasCustomMp3 && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Music className="w-3 h-3 text-amber-700" />
                        MP3 Tự Chèn
                      </span>
                    )}
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
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
            const hasGridCustomMp3 = Boolean(customAudioMap[gridKey]);

            return (
              <div
                key={idx}
                className="p-3 bg-[#F9F7F2] hover:bg-white text-[#2D2A26] border border-[#E8E4DF] hover:border-[#A8B5A2] rounded-xl flex items-center justify-between shadow-2xs transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-serif text-[#4A5D4E] font-extrabold">{item.pinyin}</span>
                  {hasGridCustomMp3 && (
                    <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1 py-0.2 rounded">
                      MP3
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <label
                    className="p-1 bg-white hover:bg-gray-100 text-gray-600 rounded border border-[#E8E4DF] cursor-pointer"
                    title="Chèn MP3 cho ô này"
                  >
                    <Upload className="w-3 h-3 text-[#4A5D4E]" />
                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a,.ogg"
                      className="hidden"
                      onChange={(e) => handleAudioUpload(gridKey, e)}
                    />
                  </label>

                  {hasGridCustomMp3 && (
                    <button
                      onClick={() => removeCustomAudio(gridKey)}
                      className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded border border-rose-200 cursor-pointer"
                      title="Xóa MP3"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}

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
