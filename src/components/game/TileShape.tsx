'use client';

import React from 'react';
import { TileData } from '@/types/game';

interface TileShapeProps {
  tile: TileData;
  sizePercent?: number;
}

export const TileShape: React.FC<TileShapeProps> = ({ tile }) => {
  const { color, shape, rotation, icon, scale = 1 } = tile;

  if (icon) {
    return (
      <div 
        className="flex items-center justify-center w-full h-full text-2xl md:text-3xl transition-transform"
        style={{
          transform: `rotate(${rotation}deg) scale(${scale})`,
        }}
      >
        <span>{icon}</span>
      </div>
    );
  }

  // Render SVG shapes
  return (
    <div 
      className="w-full h-full flex items-center justify-center p-1 transition-transform"
      style={{
        transform: `rotate(${rotation}deg) scale(${scale})`,
      }}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-sm"
        style={{ fill: color }}
      >
        {shape === 'rounded' && (
          <rect x="8" y="8" width="84" height="84" rx="22" />
        )}
        {shape === 'circle' && (
          <circle cx="50" cy="50" r="44" />
        )}
        {shape === 'diamond' && (
          <polygon points="50,6 94,50 50,94 6,50" />
        )}
        {shape === 'hexagon' && (
          <polygon points="50,6 92,28 92,72 50,94 8,72 8,28" />
        )}
        {shape === 'triangle' && (
          <polygon points="50,8 94,88 6,88" />
        )}
        {shape === 'star' && (
          <polygon points="50,5 64,36 98,36 70,57 81,90 50,70 19,90 30,57 2,36 36,36" />
        )}
        {shape === 'heart' && (
          <path d="M50,88 C50,88 12,60 12,32 C12,18 24,10 36,10 C44,10 48,15 50,20 C52,15 56,10 64,10 C76,10 88,18 88,32 C88,60 50,88 50,88 Z" />
        )}
        {shape === 'bolt' && (
          <polygon points="58,6 18,52 48,52 42,94 82,48 52,48" />
        )}
      </svg>
    </div>
  );
};
