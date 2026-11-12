'use client';

import React, { useState, useEffect } from 'react';
import { GameResult, PlayerProfile } from '@/types/game';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Share2,
  Copy,
  Download,
  Trophy,
  Check,
  Zap,
  Target,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react';
import { sound, triggerHaptic } from '@/lib/audio';
import {
  generateScoreCardBlob,
  createShareText,
  getWhatsAppShareUrl,
  getTwitterShareUrl,
} from '@/lib/scoreCardGenerator';

interface GameOverScreenProps {
  result: GameResult;
  profile: PlayerProfile;
  isPersonalBest: boolean;
  onPlayAgain: () => void;
  onOpenLeaderboard: () => void;
  onHomeClick: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  result,
  profile,
  isPersonalBest,
  onPlayAgain,
  onOpenLeaderboard,
  onHomeClick,
}) => {
  const [challengeId, setChallengeId] = useState<string>('');
  const [challengeUrl, setChallengeUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState<boolean>(false);
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [cardPreviewUrl, setCardPreviewUrl] = useState<string>('');

  // Fire confetti on high score or great performance
  useEffect(() => {
    if (isPersonalBest || result.score >= 500) {
      sound.playFanfare();
      triggerHaptic('milestone');

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F0FF', '#FF007F', '#FFE600', '#00FFA3'],
      });
    }

    // Create Challenge Link automatically on game finish
    const initChallenge = async () => {
      try {
        const res = await fetch('/api/challenge/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengerId: profile.id,
            challengerName: profile.nickname,
            challengerScore: result.score,
            challengerStreak: result.maxStreak,
            challengerAccuracy: result.accuracy,
            mode: result.mode,
            seed: result.seed || Math.floor(Math.random() * 100000),
          }),
        });
        const data = await res.json();
        if (data.challengeId) {
          setChallengeId(data.challengeId);
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const url = `${origin}?challenge=${data.challengeId}`;
          setChallengeUrl(url);

          // Generate card image blob in background
          generateScoreCardBlob(result, profile, url).then((blob) => {
            if (blob) {
              setCardBlob(blob);
              setCardPreviewUrl(URL.createObjectURL(blob));
            }
          });
        }
      } catch (err) {
        console.error('Failed to create challenge link:', err);
      }
    };

    initChallenge();
  }, [isPersonalBest, result, profile]);

  const handleCopyLink = () => {
    sound.playCorrect(3);
    triggerHaptic('tap');
    if (challengeUrl) {
      navigator.clipboard.writeText(challengeUrl).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'share_click',
          playerId: profile.id,
          properties: { type: 'copy_link', score: result.score },
        }),
      }).catch(() => {});
    }
  };

  const handleNativeShare = async () => {
    sound.playCorrect(2);
    triggerHaptic('tap');

    const shareText = createShareText(result, profile, challengeUrl || window.location.href);

    if (navigator.share) {
      try {
        if (cardBlob && navigator.canShare && navigator.canShare({ files: [new File([cardBlob], 'score.png', { type: 'image/png' })] })) {
          const file = new File([cardBlob], 'score.png', { type: 'image/png' });
          await navigator.share({
            title: 'ONE MORE TRY! - Can you beat my score?',
            text: shareText,
            url: challengeUrl,
            files: [file],
          });
        } else {
          await navigator.share({
            title: 'ONE MORE TRY!',
            text: shareText,
            url: challengeUrl,
          });
        }
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadCard = () => {
    sound.playCorrect(4);
    triggerHaptic('tap');
    if (!cardBlob) return;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(cardBlob);
    a.download = `OneMoreTry-Score-${result.score}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareText = createShareText(result, profile, challengeUrl || (typeof window !== 'undefined' ? window.location.href : ''));
  const whatsappUrl = getWhatsAppShareUrl(shareText);
  const twitterUrl = getTwitterShareUrl(shareText);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-80px)] px-4 py-3 select-none">
      {/* Top Banner */}
      <div className="w-full text-center">
        {isPersonalBest && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-yellow/15 border border-neon-yellow/40 text-neon-yellow text-xs font-black uppercase tracking-wider mb-2 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 fill-neon-yellow" />
            <span>NEW PERSONAL BEST!</span>
          </div>
        )}

        <h2 className="text-3xl font-black uppercase text-white tracking-tight">
          SESSION COMPLETE
        </h2>

        {/* Rank Tier Badge */}
        <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border shadow-inner">
          <span className="text-xl">
            {result.score >= 1200 ? '👑' : result.score >= 800 ? '⚡' : '🥉'}
          </span>
          <span
            className="font-black text-sm uppercase tracking-wide"
            style={{ color: result.tierColor }}
          >
            {result.rankTier}
          </span>
        </div>

        {/* Huge Final Score */}
        <div className="my-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
            FINAL SCORE
          </span>
          <span className="text-6xl font-black tracking-tight text-white drop-shadow-lg text-glow-cyan">
            {result.score.toLocaleString()}
          </span>
        </div>

        {/* 4-Stat Metric Grid */}
        <div className="grid grid-cols-4 gap-2 w-full bg-surface/80 p-3 rounded-2xl border border-border/80 shadow-md">
          <div className="text-center">
            <div className="flex items-center justify-center text-neon-green mb-0.5">
              <Target className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-gray-400 block font-bold uppercase">Accuracy</span>
            <span className="text-sm font-black text-white">{result.accuracy}%</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center text-neon-yellow mb-0.5">
              <Flame className="w-3.5 h-3.5 fill-neon-yellow" />
            </div>
            <span className="text-[10px] text-gray-400 block font-bold uppercase">Max Streak</span>
            <span className="text-sm font-black text-white">{result.maxStreak}x</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center text-neon-cyan mb-0.5">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-gray-400 block font-bold uppercase">Reaction</span>
            <span className="text-sm font-black text-white">{result.avgReactionTimeMs}ms</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center text-neon-pink mb-0.5">
              <Zap className="w-3.5 h-3.5 fill-neon-pink" />
            </div>
            <span className="text-[10px] text-gray-400 block font-bold uppercase">Rounds</span>
            <span className="text-sm font-black text-white">{result.roundsCompleted}</span>
          </div>
        </div>
      </div>

      {/* VIRAL SHARE & CHALLENGE SECTION */}
      <div className="w-full my-3 p-3.5 bg-gradient-to-b from-[#141930] to-surface rounded-2xl border border-neon-pink/40 shadow-neon shadow-neon-pink/15">
        <div className="flex items-center justify-between mb-2">
          <div className="text-left">
            <span className="text-xs font-black text-neon-pink uppercase tracking-wider block">
              🔥 CAN YOU BEAT MY SCORE?
            </span>
            <span className="text-[11px] text-gray-300">
              Challenge friends to the exact same reflex test
            </span>
          </div>
          {challengeId && (
            <span className="text-[10px] font-mono bg-neon-pink/20 text-neon-pink px-2 py-0.5 rounded-md border border-neon-pink/30">
              #{challengeId}
            </span>
          )}
        </div>

        {/* Share buttons group */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {/* WhatsApp Direct Share */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              sound.playCorrect(2);
              fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event: 'share_click',
                  playerId: profile.id,
                  properties: { type: 'whatsapp', score: result.score },
                }),
              }).catch(() => {});
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-transform active:scale-95"
          >
            <span>WhatsApp</span>
          </a>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-surface-light hover:bg-[#202947] border border-border text-white font-bold text-xs shadow-md transition-transform active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Additional Viral Options (Native Share & Download Card) */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/50 text-xs">
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-1.5 text-neon-cyan hover:underline font-bold"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>More Share Options</span>
          </button>

          {cardBlob && (
            <button
              onClick={handleDownloadCard}
              className="flex items-center gap-1.5 text-gray-300 hover:text-white font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Score Card</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS (PLAY AGAIN & NAVIGATION) */}
      <div className="w-full flex flex-col gap-2">
        {/* Main ONE MORE TRY! Replay CTA */}
        <button
          onClick={() => {
            sound.playCountdown(0);
            triggerHaptic('tap');
            onPlayAgain();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-neon-cyan via-sky-400 to-neon-pink text-black font-black text-xl tracking-wider uppercase shadow-neon-lg shadow-neon-cyan/40 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <RotateCcw className="w-6 h-6 stroke-[3]" />
          <span>ONE MORE TRY!</span>
        </button>

        {/* Secondary Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenLeaderboard}
            className="py-2.5 rounded-xl bg-surface border border-border/80 text-neon-yellow font-bold text-xs hover:border-neon-yellow/50 transition-all flex items-center justify-center gap-1.5"
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={onHomeClick}
            className="py-2.5 rounded-xl bg-surface border border-border/80 text-gray-300 font-bold text-xs hover:border-gray-500 transition-all flex items-center justify-center"
          >
            <span>Change Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
