import React, { useState, useEffect } from 'react';
import { PINYIN_WORDS_DATA, PinyinWordItem } from '../data/pinyinWordsData';
import { Volume2, BookOpen, CheckCircle, RotateCcw, Award, Filter, Sparkles, Upload, Trash2 } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { saveMediaFile, getAllMediaFiles, deleteMediaFile } from '../services/mediaStorage';

interface WordPracticeSectionProps {
  onAddScore?: (points: number) => void;
}

export const WordPracticeSection: React.FC<WordPracticeSectionProps> = ({ onAddScore }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [playbackRate, setPlaybackRate] = useState<number>(0.9); // 0.9 = normal, 0.65 = slow
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  // Interactive Flashcard Mode State
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [customAudioMap, setCustomAudioMap] = useState<Record<string, string>>({});

  useEffect(() => {
    getAllMediaFiles().then((all) => {
      const wordMap: Record<string, string> = {};
      Object.entries(all).forEach(([key, url]) => {
        if (key.startsWith('audio_word_')) {
          const wordId = key.replace('audio_word_', '');
          wordMap[wordId] = url;
        }
      });
      setCustomAudioMap(wordMap);
    }).catch((err) => {
      console.error('Failed to load word media files:', err);
    });
  }, []);

  const categories = [
    { key: 'ALL', label: 'Tất Cả (48 từ)' },
    { key: 'BÀI 1: THANH NHẸ', label: 'Bài 1: Phát Âm Thanh Nhẹ (16 từ)' },
    { key: 'BÀI 2: VỊ TRÍ DẤU THANH', label: 'Bài 2: Vị Trí Dấu Thanh (16 từ)' },
    { key: 'BÀI 3: ÂM TIẾT TỔNG HỢP', label: 'Bài 3: Âm Tiết Tổng Hợp (16 từ)' },
  ];

  const filteredWords =
    selectedCategory === 'ALL'
      ? PINYIN_WORDS_DATA
      : PINYIN_WORDS_DATA.filter((w) => w.category === selectedCategory);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>, wordId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const key = `audio_word_${wordId}`;
        const audioUrl = await saveMediaFile(key, file);
        setCustomAudioMap((prev) => ({
          ...prev,
          [wordId]: audioUrl,
        }));
        // Play uploaded audio as instant confirmation
        audioEngine.playMp3Url(audioUrl).catch(() => {
          const word = PINYIN_WORDS_DATA.find((w) => w.id === wordId);
          if (word) {
            audioEngine.speakPinyin(word.chinese || word.audioPinyin, playbackRate);
          }
        });
      } catch (err) {
        console.error('Error saving audio file:', err);
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleDeleteAudio = async (wordId: string) => {
    try {
      const key = `audio_word_${wordId}`;
      await deleteMediaFile(key);
      setCustomAudioMap((prev) => {
        const next = { ...prev };
        delete next[wordId];
        return next;
      });
    } catch (err) {
      console.error('Error deleting audio file:', err);
    }
  };

  const playWordAudio = (item: PinyinWordItem) => {
    const customUrl = customAudioMap[item.id];
    if (customUrl) {
      audioEngine.playMp3Url(customUrl, playbackRate).catch((err) => {
        console.warn('Custom MP3 play failed, falling back to TTS:', err);
        audioEngine.speakPinyin(item.chinese || item.audioPinyin, playbackRate);
      });
    } else {
      // Speak Chinese character if available for native pronunciation, or audioPinyin
      audioEngine.speakPinyin(item.chinese || item.audioPinyin, playbackRate);
    }
  };

  const toggleMastered = (id: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (onAddScore) onAddScore(5);
      }
      return next;
    });
  };

  // Flashcard controls
  const currentFlashcard = filteredWords[flashcardIndex % filteredWords.length] || filteredWords[0];

  const handleNextFlashcard = (isCorrect = false) => {
    if (isCorrect && onAddScore) {
      onAddScore(10);
      audioEngine.playCorrectSound();
    }
    setShowAnswer(false);
    setFlashcardIndex((prev) => (prev + 1) % filteredWords.length);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E] uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            Bài Tập Luyện Đọc Pinyin Từ Vựng Tiếng Trung
          </div>
          <h2 className="text-2xl font-extrabold text-[#2D2A26] font-serif">
            Thực Hành Đọc Pinyin & Phát Âm MP3 Chuẩn
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Luyện tập đọc Pinyin từ đơn, từ ghép 2 âm tiết và quy tắc biến điệu thanh 3 / thanh nhẹ có kèm âm thanh MP3 chuẩn.
          </p>
        </div>

        {/* Speed Selector & Filter Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Speed Toggle Button */}
          <div className="bg-[#F9F7F2] p-1 border border-[#E8E4DF] rounded-xl flex items-center gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase px-2">Tốc độ MP3:</span>
            <button
              onClick={() => setPlaybackRate(0.9)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                playbackRate === 0.9
                  ? 'bg-[#4A5D4E] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-[#2D2A26]'
              }`}
            >
              Chuẩn 1.0x
            </button>
            <button
              onClick={() => setPlaybackRate(0.65)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                playbackRate === 0.65
                  ? 'bg-[#4A5D4E] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-[#2D2A26]'
              }`}
            >
              Chậm 0.7x
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              setSelectedCategory(cat.key);
              setFlashcardIndex(0);
              setShowAnswer(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat.key
                ? 'bg-[#4A5D4E] text-white shadow-xs'
                : 'bg-white text-[#2D2A26] border border-[#E8E4DF] hover:border-[#A8B5A2]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FLASHCARD INTERACTIVE SELF-TEST MODE */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E4DF] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4DF] pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#4A5D4E]" />
            <h3 className="text-base font-bold text-[#2D2A26] font-serif">
              Chế Độ Luyện Đọc Lần Lượt & Tự Đối Chiếu Âm MP3
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            Từ {flashcardIndex + 1} / {filteredWords.length}
          </span>
        </div>

        {currentFlashcard && (
          <div className="bg-[#F9F7F2] rounded-2xl p-6 sm:p-10 border border-[#E8E4DF] text-center space-y-6 max-w-2xl mx-auto shadow-2xs">
            {/* Category Tag */}
            <span className="text-[11px] font-bold bg-white text-[#4A5D4E] px-3 py-1 rounded-full border border-[#E8E4DF]">
              {currentFlashcard.category}
            </span>

            {/* Pinyin Display */}
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-extrabold text-[#2D2A26] font-serif tracking-wide">
                {currentFlashcard.pinyin}
              </div>
              <div className="text-lg text-[#4A5D4E] font-bold">
                {currentFlashcard.chinese} - {currentFlashcard.vietnamese}
              </div>
            </div>

            {/* Audio Play Button & Upload */}
            <div className="flex flex-col justify-center items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playWordAudio(currentFlashcard)}
                  className="px-6 py-3 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white rounded-xl text-sm font-bold inline-flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  <span>
                    {customAudioMap[currentFlashcard.id]
                      ? `Nghe Audio MP3 của bạn`
                      : `Nghe AI Phát Âm Từ (${currentFlashcard.chinese})`}
                  </span>
                </button>

                {customAudioMap[currentFlashcard.id] && (
                  <button
                    onClick={() => handleDeleteAudio(currentFlashcard.id)}
                    className="p-3 text-red-500 hover:text-red-700 bg-white border border-[#E8E4DF] hover:border-red-300 rounded-xl transition-colors cursor-pointer"
                    title="Xóa file MP3 đã tải lên"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <label className="text-xs font-semibold text-[#4A5D4E] hover:text-[#3B4A3E] bg-white border border-[#E8E4DF] px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{customAudioMap[currentFlashcard.id] ? 'Thay đổi MP3' : 'Tải lên MP3 từ máy'}</span>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg"
                  onChange={(e) => handleAudioUpload(e, currentFlashcard.id)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Phonetic Tip */}
            {currentFlashcard.phoneticTip && (
              <div className="bg-white p-3 rounded-xl border border-[#E8E4DF] text-xs text-gray-600 font-medium max-w-md mx-auto">
                💡 <span className="text-[#2D2A26]">{currentFlashcard.phoneticTip}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => handleNextFlashcard(false)}
                className="px-4 py-2 bg-white border border-[#E8E4DF] hover:bg-gray-100 text-[#2D2A26] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Bỏ Qua / Cần Luyện Thêm
              </button>
              <button
                onClick={() => handleNextFlashcard(true)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Đã Đọc Đúng (+10 Điểm) ➔</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* WORD PRACTICE GRID LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#2D2A26] font-serif">
            Danh Sách Bài Tập Từ Vựng Pinyin ({filteredWords.length})
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            Đã thuộc: <strong className="text-[#4A5D4E]">{masteredIds.size}</strong> / {PINYIN_WORDS_DATA.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((item) => {
            const isMastered = masteredIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-3 relative ${
                  isMastered
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-2xs'
                    : 'border-[#E8E4DF] hover:border-[#A8B5A2] shadow-xs'
                }`}
              >
                {/* Header: Pinyin & Category */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold bg-[#F9F7F2] text-[#4A5D4E] px-2.5 py-0.5 rounded-full border border-[#E8E4DF]">
                      {item.category}
                    </span>
                    <div className="text-2xl font-extrabold text-[#2D2A26] font-serif tracking-wide mt-2">
                      {item.pinyin}
                    </div>
                  </div>

                  {/* Audio Play Action & Upload */}
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => playWordAudio(item)}
                        className={`p-2.5 text-white rounded-xl shadow-xs transition-transform active:scale-90 cursor-pointer ${
                          customAudioMap[item.id] ? 'bg-amber-700 hover:bg-amber-800' : 'bg-[#4A5D4E] hover:bg-[#3B4A3E]'
                        }`}
                        title={customAudioMap[item.id] ? `Nghe Audio MP3 của bạn` : `Nghe AI phát âm ${item.pinyin}`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {customAudioMap[item.id] && (
                        <button
                          onClick={() => handleDeleteAudio(item.id)}
                          className="p-2.5 text-red-500 hover:text-red-700 bg-[#F9F7F2] hover:bg-red-50 border border-[#E8E4DF] rounded-xl transition-colors cursor-pointer"
                          title="Xóa MP3 cá nhân"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <label className="text-[10px] text-[#4A5D4E] hover:text-[#2D2A26] font-semibold cursor-pointer flex items-center gap-1 bg-[#F9F7F2] px-2 py-0.5 rounded border border-[#E8E4DF] whitespace-nowrap">
                      <Upload className="w-2.5 h-2.5" />
                      <span>{customAudioMap[item.id] ? 'Sửa MP3' : 'Thêm MP3'}</span>
                      <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.ogg"
                        onChange={(e) => handleAudioUpload(e, item.id)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Chinese & Vietnamese */}
                <div className="bg-[#F9F7F2] p-3 rounded-xl border border-[#E8E4DF] text-xs space-y-1">
                  <div className="font-bold text-[#2D2A26]">
                    Hán Tự: <span className="text-[#4A5D4E] text-sm font-serif">{item.chinese}</span>
                  </div>
                  <div className="text-gray-600">Nghĩa: {item.vietnamese}</div>
                </div>

                {/* Phonetic Tip */}
                {item.phoneticTip && (
                  <p className="text-[11px] text-gray-500 italic leading-snug">
                    {item.phoneticTip}
                  </p>
                )}

                {/* Footer Check Button */}
                <div className="pt-2 border-t border-[#E8E4DF] flex items-center justify-between">
                  <button
                    onClick={() => toggleMastered(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isMastered
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-[#F9F7F2] text-gray-600 border border-[#E8E4DF] hover:border-[#A8B5A2]'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isMastered ? 'Đã Thành Thạo (+5đ)' : 'Đánh Dấu Đã Thuộc'}</span>
                  </button>

                  <button
                    onClick={() => playWordAudio(item)}
                    className="text-xs font-bold text-[#4A5D4E] hover:underline flex items-center gap-1"
                  >
                    Nghe AI Phát Âm
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
