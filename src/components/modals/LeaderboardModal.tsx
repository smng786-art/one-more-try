'use client';

import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, GameMode } from '@/types/game';
import { X, Trophy, Crown, Flame, Target, RefreshCw } from 'lucide-react';
import { sound, triggerHaptic } from '@/lib/audio';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerId: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentPlayerId,
}) => {
  const [mode, setMode] = useState<GameMode>('classic');
  const [period, setPeriod] = useState<string>('all_time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?mode=${mode}&period=${period}`);
      const data = await res.json();
      if (data.entries) {
        setEntries(data.entries);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, mode, period]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="w-full max-w-lg bg-[#0e1224] rounded-3xl border border-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-pop">
        {/* Header */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-neon-yellow/15 text-neon-yellow">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-tight">
                LEADERBOARD
              </h2>
              <span className="text-[11px] text-gray-400 font-semibold block">
                Top reflex champions worldwide
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                sound.playCorrect(1);
                fetchLeaderboard();
              }}
              title="Refresh"
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-surface transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
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
        </div>

        {/* Mode & Period Filter Tabs */}
        <div className="p-3 bg-surface/40 flex flex-col gap-2 border-b border-border/60">
          {/* Game Modes */}
          <div className="grid grid-cols-3 gap-1 bg-[#080a10] p-1 rounded-xl">
            {(['classic', 'endless', 'daily'] as GameMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  sound.playCorrect(1);
                  setMode(m);
                }}
                className={`py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                  mode === m
                    ? 'bg-neon-cyan text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Periods */}
          <div className="flex items-center justify-center gap-2 text-xs">
            {[
              { id: 'all_time', label: 'All-Time' },
              { id: 'daily', label: 'Today' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  sound.playCorrect(1);
                  setPeriod(p.id);
                }}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  period === p.id
                    ? 'bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/40'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-neon-cyan" />
              Loading scores...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No entries found. Be the first to score!
            </div>
          ) : (
            entries.map((entry, idx) => {
              const isTop3 = idx < 3;
              const isCurrentPlayer = entry.playerId === currentPlayerId;

              return (
                <div
                  key={entry.id || idx}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isCurrentPlayer
                      ? 'bg-neon-cyan/15 border-neon-cyan shadow-neon shadow-neon-cyan/20'
                      : isTop3
                      ? 'bg-[#151a33] border-border/80'
                      : 'bg-surface/50 border-border/40'
                  }`}
                >
                  {/* Rank & User */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-400 text-black shadow-neon shadow-amber-400/40'
                          : idx === 1
                          ? 'bg-slate-300 text-black'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-surface text-gray-400'
                      }`}
                    >
                      {idx === 0 ? <Crown className="w-4 h-4 fill-black" /> : idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-white">
                          {entry.nickname}
                        </span>
                        {isCurrentPlayer && (
                          <span className="text-[9px] uppercase font-black bg-neon-cyan text-black px-1.5 py-0.2 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span>{entry.date}</span>
                        <span>•</span>
                        <span className="text-neon-green">{entry.accuracy}% acc</span>
                        <span>•</span>
                        <span className="text-neon-yellow">{entry.maxStreak}x streak</span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="text-base font-black text-neon-yellow block">
                      {entry.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">
                      PTS
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/80 text-center bg-surface/30">
          <span className="text-[11px] text-gray-400">
            Scores are validated server-side to prevent tampering.
          </span>
        </div>
      </div>
    </div>
  );
};
