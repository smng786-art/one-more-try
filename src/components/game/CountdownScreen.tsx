'use client';

import React, { useEffect, useState } from 'react';
import { sound, triggerHaptic } from '@/lib/audio';
import { GameMode } from '@/types/game';

interface CountdownScreenProps {
  mode: GameMode;
  onCountdownComplete: () => void;
}

export const CountdownScreen: React.FC<CountdownScreenProps> = ({
  mode,
  onCountdownComplete,
}) => {
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    // Play initial sound
    sound.playCountdown(3);
    triggerHaptic('tap');

    const timer1 = setTimeout(() => {
      setCount(2);
      sound.playCountdown(2);
      triggerHaptic('tap');
    }, 850);

    const timer2 = setTimeout(() => {
      setCount(1);
      sound.playCountdown(1);
      triggerHaptic('tap');
    }, 1700);

    const timer3 = setTimeout(() => {
      setCount(0); // 0 = "GO!"
      sound.playCountdown(0);
      triggerHaptic('milestone');
    }, 2550);

    const timer4 = setTimeout(() => {
      onCountdownComplete();
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onCountdownComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#080a10]/95 backdrop-blur-md flex flex-col items-center justify-center select-none">
      <div className="text-center">
        <div className="text-xs uppercase font-extrabold tracking-widest text-neon-cyan mb-3">
          {mode.toUpperCase()} MODE
        </div>

        <div className="relative flex items-center justify-center w-48 h-48">
          {/* Animated pulse rings */}
          <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/40 animate-ping opacity-60" />
          <div className="absolute inset-4 rounded-full border border-neon-pink/40 animate-pulse" />

          {/* Number display */}
          <span
            key={count}
            className={`font-black text-8xl md:text-9xl tracking-tighter drop-shadow-2xl animate-pop ${
              count === 0
                ? 'text-neon-pink text-glow-pink scale-110'
                : 'text-white text-glow-cyan'
            }`}
          >
            {count === 0 ? 'GO!' : count}
          </span>
        </div>

        <p className="mt-8 text-sm md:text-base font-bold text-gray-300 tracking-wider">
          {count === 0 ? 'TAP THE ODD ONE FAST!' : 'GET READY...'}
        </p>
      </div>
    </div>
  );
};
