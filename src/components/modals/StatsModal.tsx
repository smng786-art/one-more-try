'use client';

import React from 'react';
import { PlayerProfile } from '@/types/game';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { X, Award, Flame, Zap, Shield, Calendar, Lock } from 'lucide-react';
import { sound } from '@/lib/audio';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  if (!isOpen) return null;

  const unlockedCount = profile.unlockedAchievements.length;
  const totalCount = ALL_ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="w-full max-w-lg bg-[#0e1224] rounded-3xl border border-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-pop">
        {/* Header */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-neon-pink/15 text-neon-pink">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-tight">
                PLAYER STATS & BADGES
              </h2>
              <span className="text-[11px] text-gray-400 font-semibold block">
                {profile.nickname}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playWrong();
              onClose();
            }}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-surface rounded-2xl border border-border/80 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Daily Streak</span>
                <span className="text-lg font-black text-white">{profile.dailyStreak} Days</span>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-2xl border border-border/80 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-neon-cyan/15 text-neon-cyan">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Games</span>
                <span className="text-lg font-black text-white">{profile.totalGames}</span>
              </div>
            </div>
          </div>

          {/* Personal Bests by Mode */}
          <div className="p-3 bg-surface/50 rounded-2xl border border-border/60">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">
              Personal Bests
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-[#080a10] border border-border/50 text-center">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Classic</span>
                <span className="text-sm font-black text-neon-cyan">
                  {profile.bestScores.classic.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#080a10] border border-border/50 text-center">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Endless</span>
                <span className="text-sm font-black text-neon-pink">
                  {profile.bestScores.endless.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#080a10] border border-border/50 text-center">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Daily</span>
                <span className="text-sm font-black text-neon-green">
                  {profile.bestScores.daily.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Achievements Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Achievements ({unlockedCount}/{totalCount})
              </span>
              <span className="text-xs font-bold text-neon-yellow">{progressPercent}%</span>
            </div>

            <div className="w-full h-2 bg-[#080a10] rounded-full overflow-hidden border border-border/50 mb-3">
              <div
                className="h-full bg-gradient-to-r from-neon-pink to-neon-yellow transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Achievement Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_ACHIEVEMENTS.map((ach) => {
                const isUnlocked = profile.unlockedAchievements.includes(ach.id);

                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                      isUnlocked
                        ? 'bg-surface/80 border-neon-cyan/40 shadow-neon shadow-neon-cyan/10'
                        : 'bg-surface/30 border-border/40 opacity-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                        isUnlocked
                          ? 'bg-neon-cyan/20 border border-neon-cyan/40'
                          : 'bg-gray-800 text-gray-600'
                      }`}
                    >
                      {isUnlocked ? ach.icon : <Lock className="w-4 h-4 text-gray-500" />}
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-xs text-white block truncate">
                        {ach.title}
                      </span>
                      <span className="text-[11px] text-gray-400 block line-clamp-2">
                        {ach.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
