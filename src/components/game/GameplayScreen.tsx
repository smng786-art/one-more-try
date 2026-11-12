'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode, RoundConfig, GameResult, TapLogItem } from '@/types/game';
import { generateRound, calculateComboMultiplier, getRankTier } from '@/lib/gameEngine';
import { sound, triggerHaptic } from '@/lib/audio';
import { TileShape } from './TileShape';
import { Flame, Heart, AlertTriangle, Zap } from 'lucide-react';

interface GameplayScreenProps {
  mode: GameMode;
  seed?: number;
  sessionToken?: string;
  onGameOver: (result: GameResult) => void;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  mode,
  seed,
  sessionToken,
  onGameOver,
}) => {
  // Game State
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [currentRound, setCurrentRound] = useState<RoundConfig>(() => generateRound(1, seed));
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [correctTaps, setCorrectTaps] = useState<number>(0);
  const [wrongTaps, setWrongTaps] = useState<number>(0);
  const [lives, setLives] = useState<number>(3); // For Endless mode

  // Floating score popups
  const [scorePops, setScorePops] = useState<Array<{ id: number; text: string; color: string; x: number; y: number }>>([]);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);
  const [wrongFlash, setWrongFlash] = useState<boolean>(false);

  // Classic/Daily 15-second Timer
  const TOTAL_TIME = 15.0;
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME);

  // Endless round speed timer (starts at 3.5s, shrinks to 1.2s)
  const [endlessRoundTime, setEndlessRoundTime] = useState<number>(3.5);
  const [endlessTimeRemaining, setEndlessTimeRemaining] = useState<number>(3.5);

  // Timing & Analytics Logging
  const gameStartTimeRef = useRef<number>(Date.now());
  const roundStartTimeRef = useRef<number>(Date.now());
  const tapsLogRef = useRef<TapLogItem[]>([]);
  const isGameOverRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger Game Over
  const endGame = useCallback(() => {
    if (isGameOverRef.current) return;
    isGameOverRef.current = true;

    sound.playGameOver();
    triggerHaptic('gameover');

    const totalTaps = correctTaps + wrongTaps;
    const accuracy = totalTaps > 0 ? Math.round((correctTaps / totalTaps) * 1000) / 10 : 100;
    const duration = (Date.now() - gameStartTimeRef.current) / 1000;

    const reactionTimes = tapsLogRef.current
      .filter((t) => t.isCorrect)
      .map((t) => t.reactionTimeMs);
    const avgReactionTimeMs = reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0;

    const rank = getRankTier(score);

    const result: GameResult = {
      id: 'res_' + Math.random().toString(36).substring(2, 9),
      mode,
      score,
      accuracy,
      totalTaps,
      correctTaps,
      wrongTaps,
      maxStreak,
      roundsCompleted: roundNumber - 1,
      durationSeconds: Math.round(duration * 10) / 10,
      avgReactionTimeMs: Math.round(avgReactionTimeMs),
      rankTier: rank.tier,
      tierColor: rank.color,
      isNewPersonalBest: false,
      timestamp: Date.now(),
      seed,
    };

    onGameOver(result);
  }, [correctTaps, wrongTaps, maxStreak, roundNumber, score, mode, seed, onGameOver]);

  // Main Timer Loop (Classic & Daily)
  useEffect(() => {
    if (mode === 'endless') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.05) {
          clearInterval(interval);
          endGame();
          return 0;
        }
        return Math.max(0, prev - 0.05);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [mode, endGame]);

  // Endless Mode Per-Round Timer Loop
  useEffect(() => {
    if (mode !== 'endless') return;

    const interval = setInterval(() => {
      setEndlessTimeRemaining((prev) => {
        if (prev <= 0.05) {
          // Timeout counts as a mistake in endless
          handleEndlessMistake();
          return endlessRoundTime;
        }
        return prev - 0.05;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [mode, endlessRoundTime]);

  const handleEndlessMistake = () => {
    sound.playWrong();
    triggerHaptic('wrong');
    triggerShake();

    setStreak(0);
    setWrongTaps((w) => w + 1);

    setLives((prevLives) => {
      const nextLives = prevLives - 1;
      if (nextLives <= 0) {
        endGame();
      } else {
        // Advance to next round anyway
        advanceRound();
      }
      return nextLives;
    });
  };

  const triggerShake = () => {
    setIsScreenShaking(true);
    setWrongFlash(true);
    setTimeout(() => setIsScreenShaking(false), 250);
    setTimeout(() => setWrongFlash(false), 200);
  };

  const advanceRound = () => {
    const nextRoundNum = roundNumber + 1;
    setRoundNumber(nextRoundNum);
    setCurrentRound(generateRound(nextRoundNum, seed));
    roundStartTimeRef.current = Date.now();

    // In Endless mode, decrease allowed time per round
    if (mode === 'endless') {
      const nextTime = Math.max(1.2, 3.5 - nextRoundNum * 0.1);
      setEndlessRoundTime(nextTime);
      setEndlessTimeRemaining(nextTime);
    }
  };

  // User Tile Tap Handler
  const handleTileTap = (tileIndex: number, e: React.PointerEvent) => {
    if (isGameOverRef.current) return;

    const now = Date.now();
    const reactionTime = now - roundStartTimeRef.current;
    const isCorrect = tileIndex === currentRound.oddIndex;

    // Log tap for anti-cheat verification
    tapsLogRef.current.push({
      round: roundNumber,
      timeOffsetMs: now - gameStartTimeRef.current,
      isCorrect,
      reactionTimeMs: reactionTime,
    });

    // Get click coords for floating popup
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const popX = rect.left + rect.width / 2;
    const popY = rect.top;

    if (isCorrect) {
      // Correct Tap Logic
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((prev) => Math.max(prev, newStreak));
      setCorrectTaps((c) => c + 1);

      // Scoring calculation: Base (100) * Combo Multiplier + Speed Bonus
      const mult = calculateComboMultiplier(newStreak);
      const speedBonus = Math.max(0, Math.round((800 - reactionTime) / 5));
      const roundPoints = Math.round(100 * mult + speedBonus);

      setScore((s) => s + roundPoints);

      // Sound & Haptics
      sound.playCorrect(newStreak);
      triggerHaptic('correct');

      // Milestone sounds for high streaks
      if (newStreak === 5 || newStreak === 10 || newStreak === 15 || newStreak === 20) {
        sound.playMilestone();
        triggerHaptic('milestone');
      }

      // Small time reward in Classic mode (+0.25s up to max 15s)
      if (mode === 'classic' || mode === 'daily') {
        setTimeLeft((prev) => Math.min(TOTAL_TIME, prev + 0.25));
      }

      // Show floating popup
      const popId = Date.now() + Math.random();
      setScorePops((pops) => [
        ...pops.slice(-4),
        {
          id: popId,
          text: `+${roundPoints}`,
          color: newStreak >= 5 ? '#FFE600' : '#00F0FF',
          x: popX,
          y: popY,
        },
      ]);
      setTimeout(() => {
        setScorePops((pops) => pops.filter((p) => p.id !== popId));
      }, 700);

      advanceRound();
    } else {
      // Wrong Tap Logic
      setStreak(0);
      setWrongTaps((w) => w + 1);

      sound.playWrong();
      triggerHaptic('wrong');
      triggerShake();

      // Show penalty popup
      const popId = Date.now() + Math.random();
      const penaltyText = mode === 'endless' ? '-1 ❤️' : '-2.0s ⏳';
      setScorePops((pops) => [
        ...pops.slice(-4),
        {
          id: popId,
          text: penaltyText,
          color: '#FF2A55',
          x: popX,
          y: popY,
        },
      ]);
      setTimeout(() => {
        setScorePops((pops) => pops.filter((p) => p.id !== popId));
      }, 700);

      if (mode === 'classic' || mode === 'daily') {
        // Harsh 2-second penalty
        setTimeLeft((prev) => {
          const next = prev - 2.0;
          if (next <= 0) {
            endGame();
            return 0;
          }
          return next;
        });
      } else if (mode === 'endless') {
        setLives((prevLives) => {
          const nextLives = prevLives - 1;
          if (nextLives <= 0) {
            endGame();
          }
          return nextLives;
        });
      }
    }
  };

  const currentMultiplier = calculateComboMultiplier(streak);
  const timeProgressPercent = mode === 'endless'
    ? (endlessTimeRemaining / endlessRoundTime) * 100
    : (timeLeft / TOTAL_TIME) * 100;

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-lg mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-80px)] px-3 py-2 select-none ${
        isScreenShaking ? 'shake-active' : ''
      }`}
    >
      {/* Red screen flash on wrong tap */}
      {wrongFlash && (
        <div className="fixed inset-0 pointer-events-none bg-red-600/20 z-40 transition-opacity" />
      )}

      {/* Floating Score Popups */}
      {scorePops.map((pop) => (
        <div
          key={pop.id}
          className="fixed pointer-events-none z-50 font-black text-2xl animate-float"
          style={{
            left: `${pop.x - 20}px`,
            top: `${pop.y - 30}px`,
            color: pop.color,
            textShadow: `0 0 10px ${pop.color}`,
          }}
        >
          {pop.text}
        </div>
      ))}

      {/* TOP HUD */}
      <div className="w-full flex flex-col gap-2 bg-surface/90 backdrop-blur-md p-3 rounded-2xl border border-border/80 shadow-lg">
        {/* Score & Streak Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              SCORE
            </span>
            <span className="text-3xl font-black text-white tracking-tight drop-shadow-md">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Mode & Level Pill */}
          <div className="text-center">
            <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-surface-light border border-border text-neon-cyan tracking-wider">
              {mode} • R{roundNumber} ({currentRound.gridSize}x{currentRound.gridSize})
            </span>
            {streak >= 3 && (
              <div className="flex items-center justify-center gap-1 mt-1 text-neon-yellow font-black text-xs animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-neon-yellow" />
                <span>{streak}x STREAK ({currentMultiplier}x)</span>
              </div>
            )}
          </div>

          {/* Lives or Time Display */}
          <div className="text-right">
            {mode === 'endless' ? (
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  LIVES
                </span>
                <div className="flex items-center gap-1 text-neon-pink">
                  {[1, 2, 3].map((heartIndex) => (
                    <Heart
                      key={heartIndex}
                      className={`w-5 h-5 ${
                        heartIndex <= lives
                          ? 'fill-neon-pink text-neon-pink animate-pulse'
                          : 'fill-transparent text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  TIME
                </span>
                <span
                  className={`text-3xl font-black tracking-tight ${
                    timeLeft <= 3.5 ? 'text-neon-red text-glow-pink animate-pulse' : 'text-neon-cyan'
                  }`}
                >
                  {timeLeft.toFixed(1)}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Timer Progress Bar */}
        <div className="w-full h-2.5 bg-[#080a10] rounded-full overflow-hidden p-[1px] border border-border/50">
          <div
            className={`h-full rounded-full transition-all duration-75 ${
              timeProgressPercent <= 25
                ? 'bg-neon-red shadow-neon shadow-neon-red/50'
                : timeProgressPercent <= 50
                ? 'bg-neon-yellow'
                : 'bg-gradient-to-r from-neon-cyan to-neon-green'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, timeProgressPercent))}%` }}
          />
        </div>
      </div>

      {/* GAME GRID CONTAINER */}
      <div className="w-full flex-1 flex items-center justify-center py-3">
        <div
          className="w-full aspect-square max-w-[380px] sm:max-w-[420px] p-2.5 bg-surface/50 rounded-3xl border border-border/70 backdrop-blur-sm grid gap-2 sm:gap-2.5 shadow-2xl transition-all"
          style={{
            gridTemplateColumns: `repeat(${currentRound.gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${currentRound.gridSize}, minmax(0, 1fr))`,
          }}
        >
          {currentRound.tiles.map((tile, idx) => (
            <button
              key={`${roundNumber}_${idx}`}
              onPointerDown={(e) => handleTileTap(idx, e)}
              className="relative w-full h-full rounded-xl sm:rounded-2xl transition-transform active:scale-90 flex items-center justify-center p-1 sm:p-1.5 focus:outline-none"
              style={{
                touchAction: 'manipulation',
              }}
            >
              <TileShape tile={tile} />
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM FOOTER STATUS */}
      <div className="w-full flex items-center justify-between text-xs text-gray-400 px-2 py-1">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-gray-300">Accuracy:</span>
          <span>
            {correctTaps + wrongTaps > 0
              ? `${Math.round((correctTaps / (correctTaps + wrongTaps)) * 100)}%`
              : '100%'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <span>Tap the odd one out</span>
        </div>
      </div>
    </div>
  );
};
