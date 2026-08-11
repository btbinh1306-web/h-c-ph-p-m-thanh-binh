import React from 'react';

interface FourLineGridProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FourLineGrid: React.FC<FourLineGridProps> = ({ symbol, size = 'md' }) => {
  const containerClasses = {
    sm: 'w-24 h-16 text-2xl',
    md: 'w-36 h-24 text-4xl',
    lg: 'w-48 h-32 text-6xl',
  }[size];

  return (
    <div
      className={`relative border-2 border-emerald-500/40 rounded-lg bg-white shadow-sm flex items-center justify-center overflow-hidden ${containerClasses}`}
      title={`Vị trí viết pinyin ${symbol} trên 4 dòng kẻ`}
    >
      {/* 4 Green Horizontal Guidelines */}
      <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 pointer-events-none">
        <div className="w-full h-[1.5px] bg-emerald-500/80" />
        <div className="w-full h-[1.5px] bg-emerald-500/80" />
        <div className="w-full h-[1.5px] bg-emerald-500/80" />
        <div className="w-full h-[1.5px] bg-emerald-500/80" />
      </div>

      {/* Pinyin Symbol centered in handwriting style */}
      <span className="relative z-10 font-sans font-bold text-slate-800 tracking-wider drop-shadow-sm select-none">
        {symbol}
      </span>
    </div>
  );
};
