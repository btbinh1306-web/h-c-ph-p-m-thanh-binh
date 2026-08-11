import React, { useState, useEffect } from 'react';
import { INITIALS_DATA, INITIAL_PARTS } from '../data/pinyinData';
import { InitialItem } from '../types';
import { Volume2, Wind, Sparkles, Filter, Check, Gamepad2, Award, RotateCcw, BookOpen } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { FourLineGrid } from './FourLineGrid';
import { MouthDiagram } from './MouthDiagram';
import { getAllMediaFiles } from '../services/mediaStorage';

interface InitialsSectionProps {
  onAddScore?: (points: number) => void;
}

export const InitialsSection: React.FC<InitialsSectionProps> = ({ onAddScore }) => {
  // Part selection state: default to 1 (Phần 1 - Buổi 1)
  const [selectedPartNumber, setSelectedPartNumber] = useState<number>(1);
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  // Find default active initial for selected part
  const partItems = INITIALS_DATA.filter((item) => item.partNumber === selectedPartNumber);
  const [activeInitial, setActiveInitial] = useState<InitialItem>(partItems[0] || INITIALS_DATA[0]);

  // Bundled MP3 audio for initials and examples
  const [customAudioMap, setCustomAudioMap] = useState<Record<string, string>>({});

  useEffect(() => {
    getAllMediaFiles().then((allMedia) => {
      const audioMap: Record<string, string> = {};
      for (const [k, url] of Object.entries(allMedia)) {
        if (k.startsWith('audio_initial_')) {
          audioMap[k.replace('audio_initial_', '')] = url;
        }
      }
      setCustomAudioMap(audioMap);
    });
  }, []);

  // Mini game state for current active part
  const [quizState, setQuizState] = useState<{
    targetItem: InitialItem | null;
    selectedAnswer: string | null;
    isCorrect: boolean | null;
    options: InitialItem[];
  } | null>(null);

  // Switch part handler
  const handlePartChange = (partNumber: number) => {
    setSelectedPartNumber(partNumber);
    setSelectedGroup('ALL');
    setQuizState(null);
    const newPartItems = INITIALS_DATA.filter((item) => item.partNumber === partNumber);
    if (newPartItems.length > 0) {
      setActiveInitial(newPartItems[0]);
    }
  };

  // Filter items STRICTLY by selectedPartNumber and selectedGroup
  const filteredInitials = INITIALS_DATA.filter((item) => {
    if (item.partNumber !== selectedPartNumber) return false;
    if (selectedGroup !== 'ALL' && item.group !== selectedGroup) return false;
    return true;
  });

  // Extract unique groups available in the currently selected part
  const availableGroupsInPart = Array.from(
    new Set(INITIALS_DATA.filter((i) => i.partNumber === selectedPartNumber).map((i) => i.group))
  );
  const visibleGroups = selectedGroup === 'ALL' ? availableGroupsInPart : [selectedGroup];

  const playInitialSound = (item: InitialItem) => {
    setActiveInitial(item);
    if (customAudioMap[item.id]) {
      audioEngine.playMp3Url(customAudioMap[item.id]);
    } else {
      audioEngine.speakPinyin(item.symbol);
    }
  };

  const playExampleSound = (pinyinText: string, exampleId: string) => {
    if (customAudioMap[exampleId]) {
      audioEngine.playMp3Url(customAudioMap[exampleId]);
    } else {
      audioEngine.speakPinyin(pinyinText);
    }
  };

  // Start mini game specifically constrained to the CURRENT selected part
  const startPartMiniGame = () => {
    // Current pool of items from the SELECTED PART ONLY
    const partPool = INITIALS_DATA.filter((item) => item.partNumber === selectedPartNumber);
    if (partPool.length === 0) return;

    const randomIndex = Math.floor(Math.random() * partPool.length);
    const target = partPool[randomIndex];

    // Pick 3 or 4 options from the same part pool
    const shuffledPool = [...partPool].sort(() => 0.5 - Math.random());
    const optionSet = new Set<InitialItem>([target]);
    for (const item of shuffledPool) {
      if (optionSet.size >= Math.min(4, partPool.length)) break;
      optionSet.add(item);
    }

    const options = Array.from(optionSet).sort(() => 0.5 - Math.random());

    setQuizState({
      targetItem: target,
      selectedAnswer: null,
      isCorrect: null,
      options,
    });

    // Play target sound
    setTimeout(() => {
      if (customAudioMap[target.id]) {
        audioEngine.playMp3Url(customAudioMap[target.id]);
      } else {
        audioEngine.speakPinyin(target.symbol);
      }
    }, 200);
  };

  const handleAnswerSelect = (item: InitialItem) => {
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

  const currentPartInfo = INITIAL_PARTS.find((p) => p.partNumber === selectedPartNumber);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E] uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Thanh Mẫu Bính Âm Tiếng Trung (声母)
            </div>
            <h2 className="text-2xl font-extrabold text-[#2D2A26]">
              Hệ Thống Thanh Mẫu & Khẩu Hình Học
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Chọn buổi học bên dưới để hiển thị đúng danh sách thanh mẫu tương ứng.
            </p>
          </div>

          {/* RADIO BUTTON / SEGMENTED BUTTON CHOOSER FOR BUỔI HỌC */}
          <div className="bg-[#F9F7F2] p-2 rounded-2xl border border-[#E8E4DF] self-start lg:self-center">
            <div className="text-[11px] font-extrabold text-[#4A5D4E] uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Chọn Phần Học (Buổi Học):</span>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              {INITIAL_PARTS.map((part) => {
                const isSelected = selectedPartNumber === part.partNumber;
                return (
                  <label
                    key={part.id}
                    onClick={() => handlePartChange(part.partNumber)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#4A5D4E] text-white border-[#3B4A3E] shadow-xs'
                        : 'bg-white text-[#2D2A26] border-[#E8E4DF] hover:border-[#A8B5A2] hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lessonPartRadio"
                      value={part.partNumber}
                      checked={isSelected}
                      onChange={() => handlePartChange(part.partNumber)}
                      className="w-4 h-4 accent-[#4A5D4E] cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-extrabold leading-tight">
                        {part.title} ({part.sessionName})
                      </div>
                      <div
                        className={`text-[10px] font-medium ${
                          isSelected ? 'text-emerald-100' : 'text-gray-500'
                        }`}
                      >
                        {part.initialSymbols.length} Thanh Mẫu
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Part Info Badge */}
        {currentPartInfo && (
          <div className="bg-[#F9F7F2] border border-[#E8E4DF] rounded-xl p-3 flex items-center justify-between text-xs text-[#2D2A26]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#4A5D4E] bg-white px-2.5 py-1 rounded-lg border border-[#E8E4DF]">
                Đang xem: {currentPartInfo.title} ({currentPartInfo.sessionName})
              </span>
              <span className="text-gray-600 hidden sm:inline">{currentPartInfo.description}</span>
            </div>
            <span className="font-bold text-[#4A5D4E]">
              {filteredInitials.length} thanh mẫu
            </span>
          </div>
        )}

        {/* Group Filter Chips (Filtered for current part) */}
        {availableGroupsInPart.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#E8E4DF]">
            <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Lọc Nhóm âm:
            </span>
            <button
              onClick={() => {
                setSelectedGroup('ALL');
                setQuizState(null);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedGroup === 'ALL'
                  ? 'bg-[#4A5D4E] text-white shadow-xs'
                  : 'bg-[#F9F7F2] text-[#2D2A26] border border-[#E8E4DF] hover:border-[#A8B5A2]'
              }`}
            >
              Tất Cả Trong {currentPartInfo?.title}
            </button>
            {availableGroupsInPart.map((groupName) => (
              <button
                key={groupName}
                onClick={() => {
                  setSelectedGroup(groupName);
                  setQuizState(null);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedGroup === groupName
                    ? 'bg-[#4A5D4E] text-white shadow-xs'
                    : 'bg-[#F9F7F2] text-[#2D2A26] border border-[#E8E4DF] hover:border-[#A8B5A2]'
                }`}
              >
                {groupName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid & Active Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Grid of Initials Buttons */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E4DF] pb-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Danh Sách Thanh Mẫu - {currentPartInfo?.title} ({filteredInitials.length})
            </h3>
            <span className="text-xs text-[#4A5D4E] font-medium">Bấm để nghe âm MP3</span>
          </div>

          <div className="space-y-3">
            {visibleGroups.map((groupName) => {
              const rowItems = filteredInitials.filter((item) => item.group === groupName);

              return (
                <div key={groupName} className="grid grid-cols-4 gap-3">
                  {rowItems.map((item) => {
                    const isSelected = activeInitial.id === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => playInitialSound(item)}
                        className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#4A5D4E] text-white border-[#3B4A3E] shadow-sm scale-105'
                            : 'bg-[#FDFCFB] text-[#2D2A26] border-[#E8E4DF] hover:border-[#A8B5A2] hover:bg-[#F9F7F2]'
                        }`}
                      >
                        <span className="text-3xl font-bold font-serif tracking-wide">{item.symbol}</span>

                        {item.aspirated && (
                          <span
                            title="Bật hơi mạnh"
                            className={`absolute top-1.5 right-1.5 p-1 rounded-full text-[10px] ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            <Wind className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Initial Details + Mouth Video */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-xs space-y-5">
          {/* Active Initial Title Bar */}
          <div className="flex items-start justify-between border-b border-[#E8E4DF] pb-4">
            <div>
              <span className="text-xs font-bold text-[#4A5D4E] bg-[#F9F7F2] px-2.5 py-1 rounded-md border border-[#E8E4DF]">
                {activeInitial.group} • {currentPartInfo?.title}
              </span>
              <h3 className="text-4xl font-extrabold text-[#2D2A26] mt-2 font-serif flex items-center gap-2 flex-wrap">
                <span>{activeInitial.symbol}</span>
                <button
                  onClick={() => playInitialSound(activeInitial)}
                  className="p-2 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white rounded-xl shadow-xs transition-transform active:scale-90 cursor-pointer"
                  title="Nghe phát âm MP3"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

              </h3>
            </div>

            {/* Badges */}
            <div>
              {activeInitial.aspirated ? (
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1 border border-rose-200">
                  <Wind className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                  BẬT HƠI MẠNH
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-[#F9F7F2] text-gray-600 text-xs font-medium border border-[#E8E4DF]">
                  Không Bật Hơi
                </span>
              )}
            </div>
          </div>

          {/* Mouth Video Container */}
          <div className="w-full">
            <MouthDiagram
              type={activeInitial.mouthDiagramType}
              symbol={activeInitial.symbol}
              aspirated={activeInitial.aspirated}
            />
          </div>

          {/* Vietnamese Guide */}
          <div className="bg-[#F9F7F2] border border-[#E8E4DF] rounded-xl p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-[#4A5D4E] uppercase tracking-wider flex items-center gap-1">
              <Check className="w-4 h-4 text-[#4A5D4E]" />
              Hướng Dẫn Phát Âm
            </h4>
            <p className="text-xs font-semibold text-[#2D2A26] leading-relaxed">
              {activeInitial.vietnameseGuide}
            </p>
            <p className="text-[11px] text-gray-500 italic pt-1 border-t border-[#E8E4DF]">
              Khẩu hình: {activeInitial.mouthDescription}
            </p>
          </div>

          {/* Example Word */}
          <div className="bg-[#FDFCFB] rounded-xl p-3.5 border border-[#E8E4DF] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Từ ví dụ</span>
              <div className="text-sm font-bold text-[#2D2A26] mt-0.5">
                {activeInitial.exampleWord} ({activeInitial.exampleVietnamese})
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={() => playExampleSound(activeInitial.examplePinyin, `example-${activeInitial.id}`)}
                className="px-3 py-1.5 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Nghe âm mẫu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EMBEDDED MINI-GAME CONSTRAINED TO CURRENT PART */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4DF] pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E]">
              <Gamepad2 className="w-4 h-4" />
              <span>TRÒ CHƠI LẮNG NGHE ĐOÁN ÂM - {currentPartInfo?.title}</span>
            </div>
            <h3 className="text-lg font-bold text-[#2D2A26]">
              Thử Thách Lắng Nghe {currentPartInfo?.title} ({currentPartInfo?.sessionName})
            </h3>
          </div>

          <button
            onClick={startPartMiniGame}
            className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{quizState ? 'Đổi Câu Hỏi Mới' : `Bắt Đầu Chơi ${currentPartInfo?.title}`}</span>
          </button>
        </div>

        {/* Mini Game Interactive Playing View */}
        {quizState ? (
          <div className="bg-[#F9F7F2] border border-[#E8E4DF] rounded-xl p-6 space-y-6 text-center">
            <p className="text-xs font-bold text-gray-500">
              Lắng nghe tệp âm thanh MP3 và chọn thanh mẫu đúng trong {currentPartInfo?.title}:
            </p>

            {/* Audio Button */}
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
              >
                <Volume2 className="w-8 h-8 animate-pulse" />
                <span className="text-[10px] font-bold mt-1">Nghe MP3</span>
              </button>
            </div>

            {/* Option Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
              {quizState.options.map((opt) => {
                const isSelected = quizState.selectedAnswer === opt.id;
                const isTarget = quizState.targetItem?.id === opt.id;

                let btnStyle =
                  'bg-white text-[#2D2A26] border-[#E8E4DF] hover:border-[#A8B5A2]';
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

            {/* Result Feedback Banner */}
            {quizState.selectedAnswer !== null && (
              <div className="pt-2">
                {quizState.isCorrect ? (
                  <div className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 p-3 rounded-xl inline-flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Chính xác! Âm vừa phát là thanh mẫu [{quizState.targetItem?.symbol}] +10 Điểm
                  </div>
                ) : (
                  <div className="text-xs font-bold text-rose-800 bg-rose-100 border border-rose-200 p-3 rounded-xl inline-flex items-center gap-2">
                    Rất tiếc! Âm đúng là [{quizState.targetItem?.symbol}]. Hãy thử lại nhé!
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-gray-500 italic">
            Bấm "Bắt Đầu Chơi {currentPartInfo?.title}" để khởi động bài tập đoán âm thanh MP3 nhanh cho {currentPartInfo?.title}.
          </div>
        )}
      </div>
    </div>
  );
};
