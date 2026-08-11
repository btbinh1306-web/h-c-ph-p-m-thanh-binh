import React, { useState, useEffect } from 'react';
import { PINYIN_RULES_DATA } from '../data/pinyinData';
import { Lightbulb, Volume2, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { saveMediaFile, getAllMediaFiles } from '../services/mediaStorage';

export const RulesSection: React.FC = () => {
  const [customAudioMap, setCustomAudioMap] = useState<Record<string, string>>({});

  useEffect(() => {
    getAllMediaFiles().then((allMedia) => {
      const audioMap: Record<string, string> = {};
      for (const [k, url] of Object.entries(allMedia)) {
        if (k.startsWith('audio_rule_')) {
          audioMap[k.replace('audio_rule_', '')] = url;
        }
      }
      setCustomAudioMap(audioMap);
    });
  }, []);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>, ruleExId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const storageKey = `audio_rule_${ruleExId}`;
      const url = await saveMediaFile(storageKey, file);
      setCustomAudioMap((prev) => ({
        ...prev,
        [ruleExId]: url,
      }));
    }
  };

  const playSound = (pinyinText: string, ruleExId: string) => {
    if (customAudioMap[ruleExId]) {
      audioEngine.playMp3Url(customAudioMap[ruleExId]);
    } else {
      audioEngine.speakPinyin(pinyinText);
    }
  };

  const renderFormattedDetail = (detail: string) => {
    // If string contains arrow ➔ or plus + or formula indicators
    if (detail.includes('➔') || detail.includes('+')) {
      // Case 1: Starts with label like "Công thức: "
      if (detail.startsWith('Công thức: ')) {
        const formulaPart = detail.replace('Công thức: ', '');
        return (
          <div className="text-base sm:text-lg font-semibold text-[#2D2A26] flex flex-wrap items-center gap-2">
            <span className="font-bold text-gray-800">Công thức:</span>
            <span className="text-red-600 font-extrabold font-mono text-base sm:text-xl bg-red-50/90 px-3 py-1 rounded-lg border border-red-200 shadow-2xs">
              {formulaPart}
            </span>
          </div>
        );
      }

      // Case 2: Contains parenthetical comment e.g. "j + ü ➔ ju (đọc là j-uy)"
      const parenIndex = detail.indexOf('(');
      if (parenIndex !== -1) {
        const formulaPart = detail.substring(0, parenIndex).trim();
        const commentPart = detail.substring(parenIndex).trim();

        return (
          <div className="text-base sm:text-lg font-semibold text-[#2D2A26] flex flex-wrap items-center gap-2">
            <span className="text-red-600 font-extrabold font-mono text-base sm:text-xl bg-red-50/90 px-3 py-1 rounded-lg border border-red-200 shadow-2xs">
              {formulaPart}
            </span>
            <span className="text-gray-600 text-xs sm:text-sm font-medium">
              {commentPart}
            </span>
          </div>
        );
      }

      // Case 3: Entire line is formula or multiple formulas e.g. "i ➔ yi", "ia ➔ ya, iao ➔ yao..."
      return (
        <div className="text-red-600 font-extrabold font-mono text-base sm:text-xl bg-red-50/90 px-3 py-1 rounded-lg border border-red-200 shadow-2xs inline-block my-0.5">
          {detail}
        </div>
      );
    }

    // Standard detail text line (e.g. "Viết phiên âm: Vẫn giữ nguyên dấu ban đầu.")
    if (detail.includes(': ')) {
      const parts = detail.split(': ');
      return (
        <div className="text-base sm:text-lg font-semibold text-[#2D2A26] leading-relaxed">
          <span className="font-bold text-gray-800">{parts[0]}: </span>
          <span className="text-gray-800 font-medium">{parts.slice(1).join(': ')}</span>
        </div>
      );
    }

    return (
      <div className="text-base sm:text-lg font-semibold text-[#2D2A26] leading-relaxed">
        {detail}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E] uppercase tracking-wider">
          <Lightbulb className="w-4 h-4" />
          Quy Tắc Ngữ Âm
        </div>
        <h2 className="text-2xl font-extrabold text-[#2D2A26]">
          Các Quy Tắc Đọc & Viết Bính Âm Pinyin Quốc Tế
        </h2>
        <p className="text-xs text-gray-500">
          Nắm vững quy tắc biến điệu thanh 3, mượn bán phụ âm y/w và bỏ hai chấm trên đầu ü khi ghép âm!
        </p>
      </div>

      {/* Rules List */}
      <div className="space-y-6">
        {PINYIN_RULES_DATA.map((rule) => (
          <div
            key={rule.id}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E4DF] shadow-xs space-y-6"
          >
            {/* Header */}
            <div className="border-b border-[#E8E4DF] pb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#2D2A26] flex items-center gap-2 font-serif">
                  <AlertTriangle className="w-5 h-5 text-[#4A5D4E] shrink-0" />
                  {rule.title}
                </h3>
                <p className="text-xs font-semibold text-gray-700 mt-1">{rule.summary}</p>
              </div>
            </div>

            {/* Bullet points */}
            <div className="bg-[#F9F7F2] rounded-2xl p-5 border border-[#E8E4DF] space-y-3">
              <span className="text-xs font-bold text-[#4A5D4E] uppercase tracking-wider block border-b border-[#E8E4DF] pb-2">
                Chi Tiết Quy Tắc:
              </span>
              <ul className="space-y-3">
                {rule.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-[#E8E4DF] shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-[#4A5D4E] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      {renderFormattedDetail(detail)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Examples Grid */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Ví dụ chuyển đổi & nghe âm chuẩn MP3:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {rule.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="p-4 bg-[#F9F7F2] hover:bg-white rounded-xl border border-[#E8E4DF] hover:border-[#A8B5A2] transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400 font-mono">{ex.original}</span>
                      <div className="flex items-center gap-2">
                        <label className="text-[9px] text-gray-400 hover:text-[#4A5D4E] cursor-pointer whitespace-nowrap bg-white px-1.5 py-0.5 rounded border border-[#E8E4DF]">
                          {customAudioMap[`${rule.id}-${i}`] ? 'Sửa MP3' : 'Thêm MP3'}
                          <input
                            type="file"
                            accept="audio/*,.mp3,.wav,.m4a,.ogg"
                            onChange={(e) => handleAudioUpload(e, `${rule.id}-${i}`)}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={() => playSound(ex.pronounciation, `${rule.id}-${i}`)}
                          className="p-2 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white rounded-lg shadow-xs transition-transform active:scale-90 cursor-pointer"
                          title={customAudioMap[`${rule.id}-${i}`] ? `Nghe Audio MP3 của bạn` : `Nghe AI phát âm ${ex.pronounciation}`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[#2D2A26] font-bold">
                      <span className="font-mono text-sm">{ex.written}</span>
                      <ArrowRight className="w-4 h-4 text-[#4A5D4E]" />
                      <span className="font-mono text-base text-[#4A5D4E] font-extrabold bg-white px-2 py-0.5 rounded border border-[#E8E4DF]">
                        {ex.pronounciation}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-500 border-t border-[#E8E4DF] pt-2">
                      Nghĩa: <strong className="text-[#2D2A26]">{ex.meaning}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
