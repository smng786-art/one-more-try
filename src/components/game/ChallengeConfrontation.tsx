'use client';

import React from 'react';
import { ChallengeData } from '@/types/game';
import { Swords, Play, Trophy, Flame } from 'lucide-react';
import { sound, triggerHaptic } from '@/lib/audio';

interface ChallengeConfrontationProps {
  challenge: ChallengeData;
  onAcceptChallenge: () => void;
  onDecline: () => void;
}

export const ChallengeConfrontation: React.FC<ChallengeConfrontationProps> = ({
  challenge,
  onAcceptChallenge,
  onDecline,
}) => {
  const handleAccept = () => {
    sound.playCountdown(0);
    triggerHaptic('milestone');
    onAcceptChallenge();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-80px)] px-4 py-6 text-center select-none">
      {/* Top Header */}
      <div className="w-full">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-pink/15 border border-neon-pink/40 text-neon-pink text-xs font-black uppercase tracking-wider mb-3 animate-pulse">
          <Swords className="w-4 h-4" />
          <span>DIRECT CHALLENGE RECEIVED</span>
        </div>

        <h1 className="text-3xl font-black uppercase text-white tracking-tight">
          DUEL INITIATED
        </h1>
        <p className="text-sm text-gray-300 font-medium mt-1">
          Your friend claims to have faster visual reflexes than you.
        </p>
      </div>

      {/* Challenger Profile Box */}
      <div className="w-full my-6 p-6 rounded-3xl bg-gradient-to-b from-[#181d36] to-surface border-2 border-neon-cyan shadow-neon shadow-neon-cyan/25">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-neon-pink to-neon-cyan p-[3px] shadow-lg mb-3">
          <div className="w-full h-full bg-[#080a10] rounded-full flex items-center justify-center font-black text-2xl text-white">
            {challenge.challengerName.charAt(0).toUpperCase()}
          </div>
        </div>

        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
          CHALLENGER
        </span>
        <h3 className="text-xl font-black text-white mt-0.5">
          {challenge.challengerName}
        </h3>

        {/* Score to Beat */}
        <div className="my-4 py-3 bg-[#080a10]/80 rounded-2xl border border-border/70">
          <span className="text-xs font-bold text-neon-yellow uppercase tracking-widest block">
            SCORE TO BEAT
          </span>
          <span className="text-5xl font-black text-white text-glow-yellow">
            {challenge.challengerScore.toLocaleString()}
          </span>
        </div>

        {/* Challenge Stats */}
        <div className="flex items-center justify-around text-xs text-gray-300 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-neon-yellow fill-neon-yellow" />
            <span>{challenge.challengerStreak}x Streak</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-neon-cyan" />
            <span>{challenge.challengerAccuracy}% Accuracy</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={handleAccept}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-neon-pink via-purple-600 to-neon-cyan text-white font-black text-xl tracking-wider uppercase shadow-neon-lg shadow-neon-pink/40 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>ACCEPT CHALLENGE</span>
        </button>

        <button
          onClick={onDecline}
          className="py-2.5 text-xs text-gray-400 hover:text-white font-bold transition-colors"
        >
          Or play standard mode instead
        </button>
      </div>
    </div>
  );
};
