'use client';

import React, { useState } from 'react';
import { PlayerProfile } from '@/types/game';
import { updatePlayerNickname } from '@/lib/storage';
import { X, User, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { sound } from '@/lib/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onProfileUpdate: (profile: PlayerProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
}) => {
  const [nickname, setNickname] = useState<string>(profile.nickname);
  const [saved, setSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      sound.playCorrect(3);
      const updated = updatePlayerNickname(nickname);
      onProfileUpdate(updated);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="w-full max-w-md bg-[#0e1224] rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden animate-pop">
        {/* Header */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-neon-cyan/15 text-neon-cyan">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-tight">
                PLAYER PROFILE
              </h2>
              <span className="text-[11px] text-gray-400 font-semibold block">
                Instant play • Zero registration required
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

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
              Arcade Nickname
            </label>
            <input
              type="text"
              maxLength={16}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 bg-[#080a10] border border-border rounded-xl text-white font-bold text-base focus:outline-none focus:border-neon-cyan"
              placeholder="Enter your gamer tag"
            />
            <span className="text-[11px] text-gray-500 block mt-1">
              Appears on global leaderboards and challenge links (max 16 chars).
            </span>
          </div>

          {/* Anonymous Info Card */}
          <div className="p-3 bg-surface/60 rounded-xl border border-border/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-neon-green shrink-0 mt-0.5" />
            <div className="text-xs text-gray-400">
              <span className="font-bold text-white block">Anonymous Profile</span>
              Your personal bests, daily streak, and unlockables are automatically linked to your device ID:
              <span className="block font-mono text-[10px] text-neon-cyan mt-0.5 truncate">
                {profile.id}
              </span>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-pink text-black font-black text-sm uppercase tracking-wider shadow-neon shadow-neon-cyan/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {saved ? <Check className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            <span>{saved ? 'NICKNAME SAVED!' : 'UPDATE NICKNAME'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
