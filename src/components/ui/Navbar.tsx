'use client';

import React from 'react';
import { PlayerProfile } from '@/types/game';
import { Volume2, VolumeX, Trophy, Award, Palette, User, Flame } from 'lucide-react';
import { sound } from '@/lib/audio';
import { toggleAudioSetting } from '@/lib/storage';

interface NavbarProps {
  profile: PlayerProfile;
  onOpenLeaderboard: () => void;
  onOpenStats: () => void;
  onOpenThemes: () => void;
  onOpenProfile: () => void;
  onHomeClick: () => void;
  onProfileUpdate: (p: PlayerProfile) => void;
  isPlaying: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  onOpenLeaderboard,
  onOpenStats,
  onOpenThemes,
  onOpenProfile,
  onHomeClick,
  onProfileUpdate,
  isPlaying,
}) => {
  const handleToggleSound = () => {
    const newState = toggleAudioSetting();
    sound.setMuted(!newState);
    onProfileUpdate({ ...profile, soundEnabled: newState });
    if (newState) sound.playCorrect(2);
  };

  return (
    <header className="w-full max-w-2xl mx-auto px-4 py-3 flex items-center justify-between z-30">
      {/* Brand Logo */}
      <button
        onClick={onHomeClick}
        disabled={isPlaying}
        className="flex items-center gap-2 group transition-transform active:scale-95 text-left disabled:opacity-50"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-neon-pink to-neon-cyan p-[2px] shadow-neon shadow-neon-cyan/20">
          <div className="w-full h-full bg-[#080a10] rounded-[10px] flex items-center justify-center font-black text-neon-cyan text-lg">
            ⚡
          </div>
        </div>
        <div>
          <span className="font-black text-lg md:text-xl tracking-tight bg-gradient-to-r from-white via-neon-cyan to-neon-pink bg-clip-text text-transparent group-hover:opacity-90">
            ONE MORE TRY!
          </span>
          <span className="block text-[10px] text-gray-400 font-bold tracking-widest uppercase">
            REFLEX RUSH
          </span>
        </div>
      </button>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Daily Streak Indicator */}
        {profile.dailyStreak > 0 && !isPlaying && (
          <div 
            title="Consecutive Days Streak"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold"
          >
            <Flame className="w-3.5 h-3.5 fill-orange-400" />
            <span>{profile.dailyStreak}d</span>
          </div>
        )}

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          title={profile.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          className="p-2 rounded-xl bg-surface border border-border/60 text-gray-300 hover:text-white hover:border-neon-cyan/50 transition-all active:scale-90"
        >
          {profile.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-neon-cyan" />
          ) : (
            <VolumeX className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {!isPlaying && (
          <>
            {/* Leaderboard Button */}
            <button
              onClick={onOpenLeaderboard}
              title="Global Leaderboard"
              className="p-2 rounded-xl bg-surface border border-border/60 text-gray-300 hover:text-neon-yellow hover:border-neon-yellow/50 transition-all active:scale-90"
            >
              <Trophy className="w-4 h-4" />
            </button>

            {/* Achievements & Stats */}
            <button
              onClick={onOpenStats}
              title="Player Stats & Badges"
              className="p-2 rounded-xl bg-surface border border-border/60 text-gray-300 hover:text-neon-pink hover:border-neon-pink/50 transition-all active:scale-90"
            >
              <Award className="w-4 h-4" />
            </button>

            {/* Themes */}
            <button
              onClick={onOpenThemes}
              title="Unlockable Themes"
              className="p-2 rounded-xl bg-surface border border-border/60 text-gray-300 hover:text-purple-400 hover:border-purple-400/50 transition-all active:scale-90"
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* Player Profile & Name Edit */}
            <button
              onClick={onOpenProfile}
              title="Edit Nickname"
              className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-xl bg-surface border border-border/60 text-gray-200 hover:border-neon-cyan/50 text-xs font-semibold transition-all active:scale-95"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-neon-purple to-neon-pink flex items-center justify-center text-[10px]">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="max-w-[70px] truncate">{profile.nickname.split('#')[0]}</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
