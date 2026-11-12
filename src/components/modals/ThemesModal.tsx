'use client';

import React from 'react';
import { PlayerProfile } from '@/types/game';
import { GAME_THEMES } from '@/lib/themes';
import { updatePlayerTheme } from '@/lib/storage';
import { X, Palette, Check, Lock } from 'lucide-react';
import { sound } from '@/lib/audio';

interface ThemesModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onThemeChange: (profile: PlayerProfile) => void;
}

export const ThemesModal: React.FC<ThemesModalProps> = ({
  isOpen,
  onClose,
  profile,
  onThemeChange,
}) => {
  if (!isOpen) return null;

  const handleSelectTheme = (themeId: string) => {
    if (profile.unlockedThemes.includes(themeId)) {
      sound.playCorrect(3);
      const updated = updatePlayerTheme(themeId);
      onThemeChange(updated);
    } else {
      sound.playWrong();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="w-full max-w-lg bg-[#0e1224] rounded-3xl border border-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-pop">
        {/* Header */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-tight">
                VISUAL THEMES
              </h2>
              <span className="text-[11px] text-gray-400 font-semibold block">
                Unlock custom arcade colorways
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

        {/* Themes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {GAME_THEMES.map((theme) => {
            const isUnlocked = profile.unlockedThemes.includes(theme.id);
            const isActive = profile.activeThemeId === theme.id;

            return (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                disabled={!isUnlocked}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-surface border-neon-cyan shadow-neon shadow-neon-cyan/20 ring-1 ring-neon-cyan'
                    : isUnlocked
                    ? 'bg-surface/60 border-border/60 hover:border-gray-500'
                    : 'bg-surface/20 border-border/40 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Color Swatch Preview */}
                  <div className="w-12 h-12 rounded-xl bg-[#080a10] border border-border flex items-center justify-center p-1.5 shadow-inner">
                    <div className="w-full h-full rounded-lg flex items-center justify-center gap-1">
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: theme.secondaryColor }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">
                        {theme.name}
                      </span>
                      {isActive && (
                        <span className="text-[9px] uppercase font-black bg-neon-cyan text-black px-1.5 py-0.2 rounded">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      {theme.tagline}
                    </span>
                    {!isUnlocked && theme.requiredScore && (
                      <span className="text-[11px] font-bold text-neon-yellow flex items-center gap-1 mt-1">
                        <Lock className="w-3 h-3" />
                        Requires {theme.requiredScore.toLocaleString()} pts in any mode
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {isActive ? (
                    <div className="w-8 h-8 rounded-full bg-neon-cyan flex items-center justify-center text-black">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                  ) : isUnlocked ? (
                    <span className="text-xs text-gray-400 hover:text-white font-bold">
                      Equip
                    </span>
                  ) : (
                    <Lock className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
