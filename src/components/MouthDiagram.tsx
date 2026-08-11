import React, { useState, useRef, useEffect } from 'react';
import { InitialItem } from '../types';
import { Play, Pause, Volume2, Film } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { getAllMediaFiles } from '../services/mediaStorage';

interface MouthDiagramProps {
  type: InitialItem['mouthDiagramType'];
  symbol: string;
  aspirated?: boolean;
}

export const MouthDiagram: React.FC<MouthDiagramProps> = ({ symbol, aspirated }) => {
  // Map of bundled video and audio URLs per symbol key.
  const [customVideoMap, setCustomVideoMap] = useState<Record<string, string>>({});
  const [customAudioMap, setCustomAudioMap] = useState<Record<string, string>>({});
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentKey = symbol.toLowerCase().trim();
  const customVideoUrl = customVideoMap[currentKey] || null;
  const customAudioUrl = customAudioMap[currentKey] || null;

  // Local video path convention (e.g., /video/b.mp4)
  const defaultLocalVideoUrl = `/video/${currentKey.replace(/[^a-z]/g, '')}.mp4`;
  const activeVideoSrc = customVideoUrl || defaultLocalVideoUrl;

  // Load bundled media files on initial mount.
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

  // When symbol changes, reset video player state
  useEffect(() => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  }, [symbol, currentKey]);

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
