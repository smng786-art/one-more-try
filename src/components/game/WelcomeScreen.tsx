'use client';

import React from 'react';
import { GameMode, PlayerProfile } from '@/types/game';
import { Play, Zap, Shield, Calendar, Flame, Trophy } from 'lucide-react';
import { sound, triggerHaptic } from '@/lib/audio';

interface WelcomeScreenProps {
  profile: PlayerProfile;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  profile,
  selectedMode,
  onSelectMode,
  onStartGame,
  onOpenLeaderboard,
}) => {
  const handleModeClick = (mode: GameMode) => {
    sound.playCorrect(1);
    triggerHaptic('tap');
    onSelectMode(mode);
  };

  const handlePlayClick = () => {
    sound.playCountdown(0);
    triggerHaptic('tap');
    onStartGame();
  };

  const todayStr = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-80px)] px-4 py-4 text-center">
      {/* Hero Badge & Title */}
      <div className="w-full flex flex-col items-center mt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-bold tracking-wide uppercase mb-3 animate-pulse">
          <Zap className="w-3.5 h-3.5 fill-neon-cyan" />
          <span>Hyper-Casual Visual Reflex Game</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase">
          <span className="block text-white drop-shadow-sm">ONE MORE</span>
          <span className="block bg-gradient-to-r from-neon-cyan via-white to-neon-pink bg-clip-text text-transparent text-glow-cyan">
            TRY!
          </span>
        </h1>

        <p className="mt-2 text-sm md:text-base text-gray-300 font-semibold tracking-wide">
          &ldquo;Think you&apos;re fast? <span className="text-neon-yellow">Prove it!</span>&rdquo;
        </p>

        {/* Mini How-To-Play Visual Teaser */}
        <div className="mt-4 p-3 w-full bg-surface/70 rounded-2xl border border-border/60 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-xl bg-neon-cyan/80 flex items-center justify-center text-xs font-bold text-black">A</div>
            <div className="w-9 h-9 rounded-xl bg-neon-cyan/80 flex items-center justify-center text-xs font-bold text-black">A</div>
            <div className="w-9 h-9 rounded-xl bg-neon-pink animate-bounce flex items-center justify-center text-xs font-bold text-white shadow-neon shadow-neon-pink/40">★</div>
            <div className="w-9 h-9 rounded-xl bg-neon-cyan/80 flex items-center justify-center text-xs font-bold text-black">A</div>
          </div>
          <div className="text-left text-xs">
            <span className="font-bold text-white block">Spot the Odd One</span>
            <span className="text-gray-400 block text-[11px]">Tap before time runs out!</span>
          </div>
        </div>
      </div>

      {/* Mode Selector Cards */}
      <div className="w-full my-4 flex flex-col gap-2.5">
        <div className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
          Select Game Mode
        </div>

        {/* 1. CLASSIC */}
        <button
          onClick={() => handleModeClick('classic')}
          className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            selectedMode === 'classic'
              ? 'bg-gradient-to-r from-neon-cyan/20 to-surface border-neon-cyan shadow-neon shadow-neon-cyan/20 scale-[1.02]'
              : 'bg-surface/80 border-border/60 hover:border-gray-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${selectedMode === 'classic' ? 'bg-neon-cyan text-black' : 'bg-surface-light text-neon-cyan'}`}>
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">CLASSIC</span>
                <span className="text-[10px] uppercase font-black bg-neon-cyan/20 text-neon-cyan px-2 py-0.5 rounded-md">15 SEC</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">High-octane reflex sprint. Instant replay!</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block font-bold uppercase">Best</span>
            <span className="text-sm font-black text-neon-yellow">
              {profile.bestScores.classic.toLocaleString()}
            </span>
          </div>
        </button>

        {/* 2. ENDLESS */}
        <button
          onClick={() => handleModeClick('endless')}
          className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            selectedMode === 'endless'
              ? 'bg-gradient-to-r from-neon-pink/20 to-surface border-neon-pink shadow-neon shadow-neon-pink/20 scale-[1.02]'
              : 'bg-surface/80 border-border/60 hover:border-gray-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${selectedMode === 'endless' ? 'bg-neon-pink text-white' : 'bg-surface-light text-neon-pink'}`}>
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">ENDLESS</span>
                <span className="text-[10px] uppercase font-black bg-neon-pink/20 text-neon-pink px-2 py-0.5 rounded-md">3 LIVES</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Survive until 3 mistakes. Faster every round.</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block font-bold uppercase">Best</span>
            <span className="text-sm font-black text-neon-pink">
              {profile.bestScores.endless.toLocaleString()}
            </span>
          </div>
        </button>

        {/* 3. DAILY CHALLENGE */}
        <button
          onClick={() => handleModeClick('daily')}
          className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            selectedMode === 'daily'
              ? 'bg-gradient-to-r from-neon-yellow/20 to-surface border-neon-yellow shadow-neon shadow-neon-yellow/20 scale-[1.02]'
              : 'bg-surface/80 border-border/60 hover:border-gray-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${selectedMode === 'daily' ? 'bg-neon-yellow text-black' : 'bg-surface-light text-neon-yellow'}`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">DAILY CHALLENGE</span>
                <span className="text-[10px] uppercase font-black bg-neon-yellow/20 text-neon-yellow px-2 py-0.5 rounded-md">{todayStr}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Identical puzzle sequence for everyone!</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block font-bold uppercase">Today</span>
            <span className="text-sm font-black text-neon-green">
              {profile.bestScores.daily > 0 ? profile.bestScores.daily.toLocaleString() : 'Unplayed'}
            </span>
          </div>
        </button>
      </div>

      {/* Main Play CTA Button */}
      <div className="w-full flex flex-col gap-3 mb-2">
        <button
          onClick={handlePlayClick}
          className="relative w-full py-4 rounded-2xl bg-gradient-to-r from-neon-cyan via-sky-400 to-neon-pink text-black font-black text-xl tracking-wider uppercase shadow-neon-lg shadow-neon-cyan/40 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Play className="w-6 h-6 fill-black" />
          <span>START {selectedMode.toUpperCase()}</span>
        </button>

        {/* Bottom Quick Row */}
        <div className="flex items-center justify-between text-xs text-gray-400 px-2">
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span>{profile.totalGames} games played</span>
          </div>
          <button 
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1 text-neon-yellow hover:underline font-bold"
          >
            <Trophy className="w-4 h-4" />
            <span>View Leaderboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
