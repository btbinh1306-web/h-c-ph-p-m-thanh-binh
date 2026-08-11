import React, { useState, useEffect } from 'react';
import { QUIZ_QUESTIONS } from '../data/pinyinData';
import { QuizQuestion } from '../types';
import { Volume2, Gamepad2, RotateCcw, CheckCircle2, XCircle, Award, Sparkles, Upload, Trash2, Music, Layers } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { saveMediaFile, getAllMediaFiles, deleteMediaFile } from '../services/mediaStorage';
import confetti from 'canvas-confetti';

interface QuizGameSectionProps {
  onAddScore: (points: number) => void;
}

export const QuizGameSection: React.FC<QuizGameSectionProps> = ({ onAddScore }) => {
  const [gameMode, setGameMode] = useState<'ALL' | 1 | 2>('ALL');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Custom MP3 map for quiz questions with IndexedDB persistence
  const [customAudioMap, setCustomAudioMap] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load custom uploaded quiz audio from IndexedDB
    getAllMediaFiles().then((allMedia) => {
      const quizMap: Record<string, string> = {};
      Object.keys(allMedia).forEach((key) => {
        if (key.startsWith('audio_quiz_')) {
          const qId = key.replace('audio_quiz_', '');
          quizMap[qId] = allMedia[key];
        }
      });
      setCustomAudioMap(quizMap);
    }).catch((err) => {
      console.error('Failed to load media files:', err);
    });
  }, []);

  const handleAudioUpload = async (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const key = `audio_quiz_${questionId}`;
        const audioUrl = await saveMediaFile(key, file);
        setCustomAudioMap((prev) => ({
          ...prev,
          [questionId]: audioUrl,
        }));
        // Play the newly uploaded audio immediately
        audioEngine.playMp3Url(audioUrl).catch(() => {
          if (currentQ) {
            audioEngine.speakPinyin(currentQ.audioPinyin);
          }
        });
      } catch (err) {
        console.error('Error saving audio file:', err);
      } finally {
        e.target.value = '';
      }
    }
  };

  const removeCustomAudio = async (questionId: string) => {
    const key = `audio_quiz_${questionId}`;
    await deleteMediaFile(key);
    setCustomAudioMap((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  useEffect(() => {
    restartGame(gameMode);
  }, [gameMode]);

  const restartGame = (mode = gameMode) => {
    let rawList = QUIZ_QUESTIONS;
    if (mode === 1) {
      rawList = QUIZ_QUESTIONS.filter((q) => q.lessonPart === 1);
    } else if (mode === 2) {
      rawList = QUIZ_QUESTIONS.filter((q) => q.lessonPart === 2);
    }
    const shuffled = [...rawList].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setSessionScore(0);
    setSessionStreak(0);
    setIsFinished(false);
  };

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (currentQ && !isFinished) {
      const timer = setTimeout(() => {
        playAudioPrompt();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isFinished]);

  const playAudioPrompt = () => {
    if (currentQ) {
      const customUrl = customAudioMap[currentQ.id];
      if (customUrl) {
        audioEngine.playMp3Url(customUrl).catch((err) => {
          console.warn('Custom MP3 play failed, falling back to TTS:', err);
          audioEngine.speakPinyin(currentQ.audioPinyin);
        });
      } else {
        audioEngine.speakPinyin(currentQ.audioPinyin);
      }
    }
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;

    audioEngine.playClickSound();
    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      audioEngine.playCorrectSound();
      const points = 10 + sessionStreak * 2;
      setSessionScore((prev) => prev + points);
      setSessionStreak((prev) => prev + 1);
      onAddScore(points);
    } else {
      audioEngine.playWrongSound();
      setSessionStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  if (!currentQ && !isFinished) {
    return null;
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E] uppercase tracking-wider mb-1">
              <Gamepad2 className="w-4 h-4" />
              Luyện Nghe Bài Tập Âm MP3
            </div>
            <h2 className="text-2xl font-extrabold text-[#2D2A26] font-serif">
              Trò Chơi Đoán Phát Âm Pinyin MP3
            </h2>
          </div>

          {!isFinished && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-gray-400 font-semibold">Điểm ván này</div>
                <div className="text-base font-bold text-[#4A5D4E]">+{sessionScore} điểm</div>
              </div>

              <button
                onClick={() => restartGame(gameMode)}
                className="p-2 bg-[#F9F7F2] border border-[#E8E4DF] hover:bg-gray-100 text-[#2D2A26] rounded-xl transition-colors cursor-pointer"
                title="Chơi lại từ đầu"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Game Mode Selector */}
        <div className="flex items-center gap-2 bg-[#F9F7F2] p-1.5 rounded-2xl border border-[#E8E4DF] flex-wrap pt-2">
          <span className="text-xs font-bold text-gray-500 px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#4A5D4E]" /> Chế độ chơi:
          </span>
          <button
            onClick={() => setGameMode(1)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              gameMode === 1
                ? 'bg-[#4A5D4E] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 bg-white border border-[#E8E4DF]'
            }`}
          >
            Phần 1 (Buổi 1)
          </button>
          <button
            onClick={() => setGameMode(2)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              gameMode === 2
                ? 'bg-[#4A5D4E] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 bg-white border border-[#E8E4DF]'
            }`}
          >
            Phần 2 (Buổi 2)
          </button>
          <button
            onClick={() => setGameMode('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              gameMode === 'ALL'
                ? 'bg-[#4A5D4E] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 bg-white border border-[#E8E4DF]'
            }`}
          >
            Đoán Tổng Hợp (Tất Cả)
          </button>
        </div>
      </div>

      {/* Main Game Box */}
      {!isFinished ? (
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#E8E4DF] shadow-xs space-y-8">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>
                Câu hỏi {currentIndex + 1} / {questions.length}
              </span>
              <span>Chuỗi thắng: {sessionStreak}</span>
            </div>
            <div className="w-full bg-[#F9F7F2] h-2.5 rounded-full overflow-hidden border border-[#E8E4DF]">
              <div
                className="bg-[#4A5D4E] h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Audio Prompt Box */}
          <div className="bg-[#F9F7F2] rounded-2xl p-8 border border-[#E8E4DF] text-center space-y-6 relative overflow-hidden">
            <span className="text-xs font-bold text-[#4A5D4E] uppercase tracking-widest bg-white border border-[#E8E4DF] px-3 py-1 rounded-full">
              Lắng nghe tệp MP3 và chọn đáp án
            </span>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={playAudioPrompt}
                className="group relative flex items-center gap-2.5 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white font-bold px-7 py-3.5 rounded-xl text-base shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>PHÁT ÂM MP3</span>
              </button>

              <label
                className="flex items-center gap-1.5 bg-white hover:bg-gray-100 text-[#4A5D4E] font-bold px-4 py-3.5 rounded-xl text-xs border border-[#E8E4DF] hover:border-[#A8B5A2] shadow-2xs transition-transform active:scale-95 cursor-pointer"
                title="Tải lên file MP3 tùy chỉnh cho câu hỏi này"
              >
                <Upload className="w-4 h-4 text-[#4A5D4E]" />
                <span>TỰ CHÈN FILE MP3</span>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg"
                  className="hidden"
                  onChange={(e) => handleAudioUpload(currentQ.id, e)}
                />
              </label>

              {customAudioMap[currentQ.id] && (
                <button
                  onClick={() => removeCustomAudio(currentQ.id)}
                  className="p-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                  title="Xóa file MP3 tự chèn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {customAudioMap[currentQ.id] && (
              <div className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-700" />
                Đã chèn file MP3 tùy chỉnh cho câu hỏi này
              </div>
            )}

            <div className="text-5xl font-serif font-extrabold text-[#2D2A26] tracking-wider">
              {currentQ.displayPrompt}
            </div>
          </div>

          {/* Option Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {currentQ.options.map((opt) => {
              let btnClass =
                'bg-white text-[#2D2A26] border-2 border-[#E8E4DF] hover:border-[#A8B5A2]';

              if (isAnswered) {
                if (opt === currentQ.correctAnswer) {
                  btnClass = 'bg-emerald-600 text-white border-emerald-700 shadow-xs';
                } else if (opt === selectedAnswer) {
                  btnClass = 'bg-rose-600 text-white border-rose-700';
                } else {
                  btnClass = 'bg-gray-100 text-gray-400 border-gray-200 opacity-50';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`p-5 rounded-xl text-2xl font-extrabold font-serif transition-all cursor-pointer flex items-center justify-center gap-2 ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isAnswered && opt === currentQ.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  )}
                  {isAnswered && opt === selectedAnswer && opt !== currentQ.correctAnswer && (
                    <XCircle className="w-5 h-5 text-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div
              className={`p-5 rounded-xl border space-y-2 animate-fadeIn ${
                selectedAnswer === currentQ.correctAnswer
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                {selectedAnswer === currentQ.correctAnswer ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Chính xác! Âm vừa nghe đúng chuẩn</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Chưa chính xác! Đáp án đúng là [{currentQ.correctAnswer}]</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed font-medium">{currentQ.explanation}</p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-5 py-2 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white rounded-lg font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  {currentIndex + 1 < questions.length ? 'Câu tiếp theo ➔' : 'Xem kết quả'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#E8E4DF] shadow-xs text-center space-y-6">
          <div className="w-16 h-16 bg-[#F9F7F2] border border-[#E8E4DF] text-[#4A5D4E] rounded-2xl flex items-center justify-center mx-auto text-3xl">
            <Award className="w-8 h-8 text-[#4A5D4E]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-[#2D2A26] font-serif">
              Hoàn Thành Bài Tập Đoán Âm MP3!
            </h3>
            <p className="text-gray-500 text-xs">
              Bạn đã hoàn thành xuất sắc các câu hỏi kiểm tra khả năng lắng nghe bính âm!
            </p>
          </div>

          <div className="inline-flex items-center gap-6 bg-[#F9F7F2] border border-[#E8E4DF] px-8 py-4 rounded-xl">
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase">Điểm Số</div>
              <div className="text-2xl font-extrabold text-[#4A5D4E]">+{sessionScore}</div>
            </div>
            <div className="w-px h-8 bg-[#E8E4DF]" />
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase">Tổng Số Câu</div>
              <div className="text-2xl font-extrabold text-[#2D2A26]">{questions.length}</div>
            </div>
          </div>

          <div>
            <button
              onClick={restartGame}
              className="bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white font-bold px-8 py-3 rounded-xl text-xs shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              Chơi Lại Ván Mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
