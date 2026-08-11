import React, { useState, useRef, useEffect } from 'react';
import { InitialItem } from '../types';
import { Video, Upload, Play, Pause, RotateCcw, Volume2, Film, Check, Trash2 } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { saveMediaFile, getAllMediaFiles, deleteMediaFile } from '../services/mediaStorage';

interface MouthDiagramProps {
  type: InitialItem['mouthDiagramType'];
  symbol: string;
  aspirated?: boolean;
}

export const MouthDiagram: React.FC<MouthDiagramProps> = ({ symbol, aspirated }) => {
  // Map of custom video and audio URLs per symbol key (e.g. { 'b': 'blob:...', 'p': 'blob:...' })
  const [customVideoMap, setCustomVideoMap] = useState<Record<string, string>>({});
  const [customAudioMap, setCustomAudioMap] = useState<Record<string, string>>({});
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentKey = symbol.toLowerCase().trim();
  const customVideoUrl = customVideoMap[currentKey] || null;
  const customAudioUrl = customAudioMap[currentKey] || null;

  // Local video path convention (e.g., /video/b.mp4)
  const defaultLocalVideoUrl = `/video/${currentKey.replace(/[^a-z]/g, '')}.mp4`;
  const activeVideoSrc = customVideoUrl || defaultLocalVideoUrl;

  // Load persisted media files from IndexedDB on initial mount
  useEffect(() => {
    getAllMediaFiles().then((allMedia) => {
      const vMap: Record<string, string> = {};
      const aMap: Record<string, string> = {};
      for (const [k, url] of Object.entries(allMedia)) {
        if (k.startsWith('video_mouth_')) {
          vMap[k.replace('video_mouth_', '')] = url;
        } else if (k.startsWith('audio_mouth_')) {
          aMap[k.replace('audio_mouth_', '')] = url;
        }
      }
      setCustomVideoMap(vMap);
      setCustomAudioMap(aMap);
    });
  }, []);

  // Reset playback and update notice when symbol changes
  useEffect(() => {
    if (customVideoMap[currentKey]) {
      setUploadNotice(`Đã lưu video riêng cho [${symbol}]`);
    } else if (customAudioMap[currentKey]) {
      setUploadNotice(`Đã lưu audio riêng cho [${symbol}]`);
    } else {
      setUploadNotice(null);
    }
  }, [symbol, currentKey, customVideoMap, customAudioMap]);

  // When symbol changes, reset video player state
  useEffect(() => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  }, [symbol, currentKey]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (file.type.startsWith('audio/')) {
          const key = `audio_mouth_${currentKey}`;
          const url = await saveMediaFile(key, file);
          setCustomAudioMap((prev) => ({ ...prev, [currentKey]: url }));
          setUploadNotice(`Đã tự động lưu audio [${symbol}]: ${file.name}`);
        } else {
          const key = `video_mouth_${currentKey}`;
          const url = await saveMediaFile(key, file);
          setCustomVideoMap((prev) => ({ ...prev, [currentKey]: url }));
          setUploadNotice(`Đã tự động lưu video [${symbol}]: ${file.name}`);
          setIsPlaying(true);
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.play().catch((err) => {
                console.warn('Auto play video failed:', err);
                setIsPlaying(false);
              });
            }
          }, 150);
        }
      } catch (err) {
        console.error('Error uploading mouth diagram media:', err);
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleRemoveCustomVideo = async () => {
    const key = `video_mouth_${currentKey}`;
    await deleteMediaFile(key);
    setCustomVideoMap((prev) => {
      const next = { ...prev };
      delete next[currentKey];
      return next;
    });
    setUploadNotice(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  const handlePlaySound = () => {
    if (customAudioUrl) {
      audioEngine.playMp3Url(customAudioUrl);
    } else {
      audioEngine.speakPinyin(symbol);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-[#E8E4DF] shadow-xs overflow-hidden flex flex-col space-y-3 p-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#E8E4DF] pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-[#4A5D4E]" />
          <span className="text-xs font-bold text-[#2D2A26]">
            Video Khẩu Hình [{symbol}]
          </span>
          {aspirated && (
            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-200">
              Bật hơi
            </span>
          )}
        </div>

        {/* Upload & Clear Buttons */}
        <div className="flex items-center gap-1.5">
          {customVideoUrl && (
            <button
              onClick={handleRemoveCustomVideo}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title={`Xóa video riêng của [${symbol}] và dùng video mặc định`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F9F7F2] hover:bg-[#E8E4DF] text-[#4A5D4E] border border-[#E8E4DF] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title={`Tải video hoặc audio (MOV, MP4, MP3...) riêng cho thanh mẫu [${symbol}]`}
          >
            <Upload className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>Tải Video Cho [{symbol}]</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*,.mp4,.webm,.mov,.mp3,.wav,.m4a"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Video Player Display Screen */}
      <div className="relative w-full aspect-video max-h-[460px] bg-[#1E1B18] rounded-xl overflow-hidden flex items-center justify-center border border-[#E8E4DF] shadow-inner group">
        <video
          ref={videoRef}
          key={activeVideoSrc}
          src={activeVideoSrc}
          loop
          playsInline
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-contain max-h-[460px]"
        />

        {/* Custom Video Notice Badge */}
        {uploadNotice && (
          <div className="absolute top-3 left-3 bg-emerald-900/90 text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 border border-emerald-500/30 shadow-md">
            <Check className="w-4 h-4 text-emerald-400" />
            {uploadNotice}
          </div>
        )}
      </div>

      {/* Video Controls & Speed Bar */}
      <div className="flex items-center justify-between text-xs bg-[#F9F7F2] p-3 rounded-xl border border-[#E8E4DF] flex-wrap gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handlePlayPause}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white rounded-lg cursor-pointer transition-transform active:scale-95 font-bold shadow-xs"
            title={isPlaying ? 'Tạm dừng video' : `Phát video khẩu hình [${symbol}]`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Tạm dừng' : 'Phát Video'}</span>
          </button>

          <button
            onClick={handlePlaySound}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8E4DF] hover:bg-gray-100 text-[#2D2A26] rounded-lg text-xs font-bold cursor-pointer shadow-2xs"
          >
            <Volume2 className="w-4 h-4 text-[#4A5D4E]" />
            <span>Phát Âm MP3</span>
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-semibold">Tốc độ:</span>
          {[0.5, 0.75, 1.0].map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                speed === s
                  ? 'bg-[#4A5D4E] text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-[#E8E4DF] hover:bg-gray-100'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

