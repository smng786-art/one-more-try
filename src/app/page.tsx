'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  GameMode,
  GameScreen,
  PlayerProfile,
  GameResult,
  ChallengeData,
} from '@/types/game';
import { getInitialProfile, processGameResult } from '@/lib/storage';
import { GAME_THEMES } from '@/lib/themes';
import { sound } from '@/lib/audio';
import { dateToSeed } from '@/lib/gameEngine';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';

import { Navbar } from '@/components/ui/Navbar';
import { WelcomeScreen } from '@/components/game/WelcomeScreen';
import { CountdownScreen } from '@/components/game/CountdownScreen';
import { GameplayScreen } from '@/components/game/GameplayScreen';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { ChallengeConfrontation } from '@/components/game/ChallengeConfrontation';

import { LeaderboardModal } from '@/components/modals/LeaderboardModal';
import { StatsModal } from '@/components/modals/StatsModal';
import { ThemesModal } from '@/components/modals/ThemesModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { Sparkles } from 'lucide-react';

function GameRoot() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<PlayerProfile>(getInitialProfile);
  const [screen, setScreen] = useState<GameScreen>('welcome');
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [activeSeed, setActiveSeed] = useState<number | undefined>(undefined);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [isPersonalBest, setIsPersonalBest] = useState<boolean>(false);

  // Challenge Mode State
  const [incomingChallenge, setIncomingChallenge] = useState<ChallengeData | null>(null);

  // Modals State
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isThemesOpen, setIsThemesOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Achievement Unlock Popups
  const [achievementToast, setAchievementToast] = useState<{ title: string; icon: string } | null>(null);

  // Load profile and check query params on mount
  useEffect(() => {
    const loaded = getInitialProfile();
    setProfile(loaded);
    sound.setMuted(!loaded.soundEnabled);

    // Check challenge query parameter
    const challengeParam = searchParams.get('challenge');
    if (challengeParam) {
      fetch(`/api/challenge/${challengeParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.challenge) {
            setIncomingChallenge(data.challenge);
            setSelectedMode(data.challenge.mode);
            setActiveSeed(data.challenge.seed);
            setScreen('challenge');
          }
        })
        .catch((err) => console.error('Challenge query fetch error:', err));
    }
  }, [searchParams]);

  // Handle Game Start
  const handleStartGame = async () => {
    let seed = activeSeed;

    // Daily mode uses deterministic seed based on current date (YYYY-MM-DD)
    if (selectedMode === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      seed = dateToSeed(today);
      setActiveSeed(seed);
    }

    try {
      // Initialize server anti-cheat session
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: selectedMode,
          playerId: profile.id,
          seed,
        }),
      });
      const data = await res.json();
      if (data.sessionToken) {
        setSessionToken(data.sessionToken);
      }
    } catch (err) {
      console.error('Failed to init session token:', err);
    }

    setScreen('countdown');
  };

  // Handle Countdown Finished -> Start Playing
  const handleCountdownComplete = () => {
    setScreen('playing');
  };

  // Handle Game Over
  const handleGameOver = async (result: GameResult) => {
    setLastResult(result);

    // Process locally and check unlocks
    const {
      profile: updatedProfile,
      newAchievements,
      isNewPersonalBest: isBest,
    } = processGameResult(result);

    setProfile({ ...updatedProfile });
    setIsPersonalBest(isBest);

    // Trigger achievement popup if newly unlocked
    if (newAchievements.length > 0) {
      const firstAch = ALL_ACHIEVEMENTS.find((a) => a.id === newAchievements[0]);
      if (firstAch) {
        setAchievementToast({ title: firstAch.title, icon: firstAch.icon });
        setTimeout(() => setAchievementToast(null), 4000);
      }
    }

    // Submit validated score to server API
    try {
      await fetch('/api/game/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          playerId: profile.id,
          nickname: profile.nickname,
          score: result.score,
          accuracy: result.accuracy,
          maxStreak: result.maxStreak,
          roundsCompleted: result.roundsCompleted,
          mode: result.mode,
        }),
      });
    } catch (err) {
      console.error('Failed to record score to server:', err);
    }

    setScreen('gameover');
  };

  const handlePlayAgain = () => {
    handleStartGame();
  };

  const handleReturnHome = () => {
    setActiveSeed(undefined);
    setIncomingChallenge(null);
    setScreen('welcome');
  };

  // Determine current active theme styling
  const currentTheme = GAME_THEMES.find((t) => t.id === profile.activeThemeId) || GAME_THEMES[0];

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${currentTheme.bgGradient} flex flex-col justify-between selection:bg-neon-cyan selection:text-black`}
    >
      {/* Toast popup for newly unlocked achievements */}
      {achievementToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#12172d] border border-neon-yellow px-4 py-2.5 rounded-2xl shadow-neon shadow-neon-yellow/30 flex items-center gap-3 animate-bounce">
          <div className="text-2xl">{achievementToast.icon}</div>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-neon-yellow tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>ACHIEVEMENT UNLOCKED!</span>
            </div>
            <div className="font-extrabold text-white text-xs">
              {achievementToast.title}
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        profile={profile}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenThemes={() => setIsThemesOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onHomeClick={handleReturnHome}
        onProfileUpdate={setProfile}
        isPlaying={screen === 'playing' || screen === 'countdown'}
      />

      {/* Main Dynamic Screen Area */}
      <main className="w-full flex-1 flex flex-col items-center justify-center">
        {screen === 'welcome' && (
          <WelcomeScreen
            profile={profile}
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
            onStartGame={handleStartGame}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        )}

        {screen === 'challenge' && incomingChallenge && (
          <ChallengeConfrontation
            challenge={incomingChallenge}
            onAcceptChallenge={handleStartGame}
            onDecline={handleReturnHome}
          />
        )}

        {screen === 'countdown' && (
          <CountdownScreen
            mode={selectedMode}
            onCountdownComplete={handleCountdownComplete}
          />
        )}

        {screen === 'playing' && (
          <GameplayScreen
            mode={selectedMode}
            seed={activeSeed}
            sessionToken={sessionToken}
            onGameOver={handleGameOver}
          />
        )}

        {screen === 'gameover' && lastResult && (
          <GameOverScreen
            result={lastResult}
            profile={profile}
            isPersonalBest={isPersonalBest}
            onPlayAgain={handlePlayAgain}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onHomeClick={handleReturnHome}
          />
        )}
      </main>

      {/* Modals */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentPlayerId={profile.id}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        profile={profile}
      />

      <ThemesModal
        isOpen={isThemesOpen}
        onClose={() => setIsThemesOpen(false)}
        profile={profile}
        onThemeChange={setProfile}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080a10]" />}>
      <GameRoot />
    </Suspense>
  );
}
