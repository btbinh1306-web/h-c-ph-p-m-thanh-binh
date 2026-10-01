import React, { useState, useEffect } from 'react';
import { FINALS_DATA, FINAL_PARTS } from '../data/pinyinData';
import { FinalItem } from '../types';
import { Volume2, Filter, Music, Gamepad2, Award, RotateCcw, CheckCircle2 } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { getAllMediaFiles } from '../services/mediaStorage';

interface FinalsSectionProps {
  onAddScore?: (points: number) => void;
}

interface FinalQuizGameCardProps {
  gameNumber: number;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor: string;
  targetPool: FinalItem[];
  customAudioMap: Record<string, string>;
  onAddScore?: (points: number) => void;
}

const FinalQuizGameCard: React.FC<FinalQuizGameCardProps> = ({
  gameNumber,
  title,
  subtitle,
  badgeText,
  badgeColor,
  targetPool,
  customAudioMap,
  onAddScore,
}) => {
  const [quizState, setQuizState] = useState<{
    targetItem: FinalItem | null;
    selectedAnswer: string | null;
    isCorrect: boolean | null;
    options: FinalItem[];
  } | null>(null);

  const startQuiz = () => {
    if (!targetPool || targetPool.length === 0) return;
    const target = targetPool[Math.floor(Math.random() * targetPool.length)];

    const shuffled = [...targetPool].sort(() => 0.5 - Math.random());
    const optionSet = new Set<FinalItem>([target]);
    for (const item of shuffled) {
      if (optionSet.size >= 4) break;
      optionSet.add(item);
    }
    const options = Array.from(optionSet).sort(() => 0.5 - Math.random());

    setQuizState({
      targetItem: target,
      selectedAnswer: null,
      isCorrect: null,
      options,
    });

    setTimeout(() => {
      if (customAudioMap[target.id]) {
        audioEngine.playMp3Url(customAudioMap[target.id]);
      } else {
        audioEngine.speakPinyin(target.symbol);
      }
    }, 200);
  };

  const handleAnswerSelect = (item: FinalItem) => {
    if (!quizState || !quizState.targetItem || quizState.selectedAnswer !== null) return;

    const isRight = item.id === quizState.targetItem.id;
    setQuizState((prev) =>
      prev
        ? {
            ...prev,
            selectedAnswer: item.id,
            isCorrect: isRight,
          }
        : null
    );

    if (isRight) {
      audioEngine.playCorrectSound();
      if (onAddScore) onAddScore(10);
    } else {
      audioEngine.playWrongSound();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4DF] pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E]">
            <Gamepad2 className="w-4 h-4 text-[#4A5D4E]" />
            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${badgeColor}`}>
              TRÒ CHƠI {gameNumber}: {badgeText}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-[#2D2A26] mt-1">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>

        <button
          onClick={startQuiz}
          className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{quizState ? 'Đổi Câu Hỏi Mới' : 'Bắt Đầu Chơi'}</span>
        </button>
      </div>

      {quizState ? (
        <div className="bg-[#F9F7F2] border border-[#E8E4DF] rounded-xl p-6 space-y-6 text-center">
          <p className="text-xs font-bold text-gray-600">
            Lắng nghe tệp âm thanh MP3 và chọn vận mẫu đúng:
          </p>

          <div className="flex flex-col items-center justify-center gap-2">
            <button
              onClick={() => {
                if (quizState.targetItem) {
                  if (customAudioMap[quizState.targetItem.id]) {
                    audioEngine.playMp3Url(customAudioMap[quizState.targetItem.id]);
                  } else {
                    audioEngine.speakPinyin(quizState.targetItem.symbol);
                  }
                }
              }}
              className="w-20 h-20 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white rounded-full flex flex-col items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
              title="Bấm để nghe lại MP3"
            >
              <Volume2 className="w-8 h-8 animate-pulse" />
              <span className="text-[10px] font-bold mt-1">Nghe MP3</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
            {quizState.options.map((opt) => {
              const isSelected = quizState.selectedAnswer === opt.id;
              const isTarget = quizState.targetItem?.id === opt.id;

              let btnStyle = 'bg-white text-[#2D2A26] border-[#E8E4DF] hover:border-[#A8B5A2]';
              if (quizState.selectedAnswer !== null) {
                if (isTarget) {
                  btnStyle = 'bg-emerald-600 text-white border-emerald-700 shadow-sm';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-600 text-white border-rose-700';
                } else {
                  btnStyle = 'bg-gray-100 text-gray-400 border-gray-200 opacity-50';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleAnswerSelect(opt)}
                  disabled={quizState.selectedAnswer !== null}
                  className={`p-4 rounded-xl border-2 text-2xl font-extrabold font-serif transition-all cursor-pointer ${btnStyle}`}
                >
                  {opt.symbol}
                </button>
              );
            })}
          </div>

          {quizState.selectedAnswer !== null && (
            <div className="pt-2 flex flex-col items-center gap-2">
              {quizState.isCorrect ? (
                <div className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 p-3 rounded-xl inline-flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Chính xác! Âm vừa phát là vận mẫu [{quizState.targetItem?.symbol}] (+10 Điểm)
                </div>
              ) : (
                <div className="text-xs font-bold text-rose-800 bg-rose-100 border border-rose-200 p-3 rounded-xl inline-flex items-center gap-2">
                  Rất tiếc! Đáp án đúng là [{quizState.targetItem?.symbol}]. Hãy thử lại nhé!
                </div>
              )}
              <button
                onClick={startQuiz}
                className="px-4 py-2 bg-[#4A5D4E] text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#3B4A3E] cursor-pointer mt-1"
              >
                Câu Tiếp Theo ➔
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-gray-500 italic bg-[#F9F7F2] rounded-xl border border-dashed border-[#E8E4DF]">
          Bấm "Bắt Đầu Chơi" để khởi động thử thách đoán vận mẫu cho {title}.
        </div>
      )}
    </div>
  );
};

export const FinalsSection: React.FC<FinalsSectionProps> = ({ onAddScore }) => {
  const [lessonPart, setLessonPart] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Custom MP3 audio map for finals
  const [customAudioMap, setCustomAudioMap] = useState<Record<string, string>>({});

  useEffect(() => {
    getAllMediaFiles().then((allMedia) => {
      const audioMap: Record<string, string> = {};
      for (const [k, url] of Object.entries(allMedia)) {
        if (k.startsWith('audio_final_')) {
          audioMap[k.replace('audio_final_', '')] = url;
        }
      }
      setCustomAudioMap(audioMap);
    });
  }, []);

  const categories = [
    { key: 'ALL', label: 'Tất Cả' },
    { key: 'Đơn (单韵母)', label: 'Vận Mẫu Đơn' },
    { key: 'Kép (复韵母)', label: 'Vận Mẫu Kép' },
    { key: 'Mũi (鼻韵母)', label: 'Vận Mẫu Mũi' },
  ];

  // Filter finals based strictly on selected lessonPart (Part 1 vs Part 2) and category
  const filteredFinals = FINALS_DATA.filter((item) => {
    if (item.partNumber !== lessonPart) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    return true;
  });

  const part1Finals = FINALS_DATA.filter((item) => item.partNumber === 1);
  const part2Finals = FINALS_DATA.filter((item) => item.partNumber === 2);

  const playFinalSound = (item: FinalItem) => {
    if (customAudioMap[item.id]) {
      audioEngine.playMp3Url(customAudioMap[item.id]);
    } else {
      audioEngine.speakPinyin(item.symbol);
    }
  };

  const playExampleSound = (examplePinyin: string, exampleId: string) => {
    if (customAudioMap[exampleId]) {
      audioEngine.playMp3Url(customAudioMap[exampleId]);
    } else {
      audioEngine.speakPinyin(examplePinyin);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Title Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E] uppercase tracking-wider mb-1">
              <Music className="w-4 h-4" />
              36 Vận Mẫu Tiếng Trung (韵母)
            </div>
            <h2 className="text-2xl font-extrabold text-[#2D2A26]">
              Hệ Thống Vận Mẫu & Phát Âm Chuẩn MP3
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Gồm 7 vận mẫu đơn, 13 vận mẫu kép và 16 vận mẫu mũi có đầy đủ hướng dẫn môi lưỡi và phát âm MP3.
            </p>
          </div>

          {/* Segmented Radio Button Selector for Lesson Parts */}
          <div className="flex flex-wrap items-center gap-3 bg-[#F9F7F2] p-2 rounded-2xl border border-[#E8E4DF]">
            {FINAL_PARTS.map((part) => {
              const isSelected = lessonPart === part.partNumber;
              return (
                <label
                  key={part.id}
                  onClick={() => setLessonPart(part.partNumber)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-xs'
                      : 'bg-white text-gray-700 border-[#E8E4DF] hover:border-[#A8B5A2]'
                  }`}
                >
                  <input
                    type="radio"
                    name="finalLessonPart"
                    checked={isSelected}
                    onChange={() => setLessonPart(part.partNumber)}
                    className="accent-[#4A5D4E] w-4 h-4 cursor-pointer"
                  />
                  <span>
                    {part.title} ({part.sessionName})
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-[#E8E4DF]">
          <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc Phân Loại:
          </span>
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === c.key
                  ? 'bg-[#4A5D4E] text-white shadow-xs'
                  : 'bg-[#F9F7F2] text-[#2D2A26] border border-[#E8E4DF] hover:border-[#A8B5A2]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Finals Cards for Selected Part */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredFinals.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-3 border border-[#E8E4DF] hover:border-[#A8B5A2] shadow-xs transition-all flex flex-col justify-between space-y-2 group"
          >
            {/* Card Header: Symbol & Category Badge */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold bg-[#F9F7F2] text-[#4A5D4E] px-2 py-0.5 rounded-full border border-[#E8E4DF]">
                    {item.category}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-[#2D2A26] font-serif tracking-wide mt-1">
                  {item.symbol}
                </div>
              </div>

              {/* Audio Play Button */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => playFinalSound(item)}
                  className="p-2.5 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white rounded-lg shadow-xs transition-transform active:scale-90 cursor-pointer"
                  title={`Nghe phát âm MP3 ${item.symbol}`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mouth position guide */}
            <div className="bg-[#F9F7F2] px-2.5 py-2 rounded-lg border border-[#E8E4DF] text-[11px] text-gray-500">
              Khẩu hình: {item.mouthGuide}
            </div>

            {/* Example Word */}
            <div className="flex items-center justify-between pt-1.5 border-t border-[#E8E4DF]">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Ví dụ</span>
                <div className="text-xs font-bold text-[#2D2A26]">
                  {item.exampleWord} ({item.exampleVietnamese})
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={() => playExampleSound(item.examplePinyin, `example-${item.id}`)}
                  className="px-2 py-1 bg-[#F9F7F2] border border-[#E8E4DF] hover:bg-gray-100 text-[#2D2A26] rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  Nghe
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3 INDEPENDENT GAMES SECTION AT THE BOTTOM */}
      <div className="space-y-6 pt-6 border-t-2 border-dashed border-[#E8E4DF]">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-[#4A5D4E] uppercase tracking-wider bg-white px-4 py-1.5 rounded-full border border-[#E8E4DF]">
            <Gamepad2 className="w-4 h-4 text-[#4A5D4E]" />
            GÓC GIẢI TRÍ & TRÒ CHƠI ÔN TẬP VẬN MẪU
          </div>
          <h3 className="text-xl font-extrabold text-[#2D2A26]">
            3 Trò Chơi Đoán Vận Mẫu Độc Lập
          </h3>
          <p className="text-xs text-gray-500 max-w-lg mx-auto">
            Hãy luyện tập phản xạ nghe MP3 với 3 chế độ trò chơi riêng biệt dưới đây:
          </p>
        </div>

        <div className="space-y-6">
          {/* Trò chơi 1: Đoán Vận Mẫu - Chỉ lấy dữ liệu của Phần 1 */}
          <FinalQuizGameCard
            gameNumber={1}
            title="Trò Chơi Đoán Vận Mẫu (Phần 1)"
            subtitle="Chỉ lấy dữ liệu 18 vận mẫu thuộc Phần 1 (Buổi 1). Không xuất hiện Phần 2."
            badgeText="Phần 1 (Buổi 1)"
            badgeColor="bg-emerald-100 text-emerald-800 border border-emerald-300"
            targetPool={part1Finals}
            customAudioMap={customAudioMap}
            onAddScore={onAddScore}
          />

          {/* Trò chơi 2: Đoán Vận Mẫu - Chỉ lấy dữ liệu của Phần 2 */}
          <FinalQuizGameCard
            gameNumber={2}
            title="Trò Chơi Đoán Vận Mẫu (Phần 2)"
            subtitle="Chỉ lấy dữ liệu 18 vận mẫu thuộc Phần 2 (Buổi 2). Không xuất hiện Phần 1."
            badgeText="Phần 2 (Buổi 2)"
            badgeColor="bg-blue-100 text-blue-800 border border-blue-300"
            targetPool={part2Finals}
            customAudioMap={customAudioMap}
            onAddScore={onAddScore}
          />

          {/* Trò chơi 3: Đoán Tổng Hợp - Lấy dữ liệu của Phần 1 và Phần 2 trộn chung */}
          <FinalQuizGameCard
            gameNumber={3}
            title="Trò Chơi Đoán Tổng Hợp (Phần 1 + Phần 2)"
            subtitle="Trộn lẫn toàn bộ 36 vận mẫu của Phần 1 và Phần 2 để luyện tập phản xạ tổng hợp."
            badgeText="Tổng Hợp All 36 Âm"
            badgeColor="bg-purple-100 text-purple-800 border border-purple-300"
            targetPool={FINALS_DATA}
            customAudioMap={customAudioMap}
            onAddScore={onAddScore}
          />
        </div>
      </div>
    </div>
  );
};
