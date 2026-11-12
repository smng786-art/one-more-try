import { PlayerProfile, GameResult } from '../types/game';
import { ALL_ACHIEVEMENTS } from './achievements';

const STORAGE_KEY = 'one_more_try_profile_v1';

export function getInitialProfile(): PlayerProfile {
  if (typeof window === 'undefined') {
    return {
      id: 'default-player',
      nickname: 'Speedster #1001',
      avatarSeed: '1001',
      totalGames: 0,
      bestScores: { classic: 0, endless: 0, daily: 0 },
      dailyStreak: 1,
      lastPlayedDate: '',
      unlockedAchievements: [],
      unlockedThemes: ['neon-cyber'],
      activeThemeId: 'neon-cyber',
      soundEnabled: true,
      hapticsEnabled: true,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        bestScores: parsed.bestScores || { classic: 0, endless: 0, daily: 0 },
        unlockedAchievements: parsed.unlockedAchievements || [],
        unlockedThemes: parsed.unlockedThemes || ['neon-cyber'],
      };
    }
  } catch {}

  const randomId = 'player_' + Math.random().toString(36).substring(2, 9);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newProfile: PlayerProfile = {
    id: randomId,
    nickname: `Speedster #${randomNum}`,
    avatarSeed: randomNum.toString(),
    totalGames: 0,
    bestScores: { classic: 0, endless: 0, daily: 0 },
    dailyStreak: 1,
    lastPlayedDate: new Date().toISOString().split('T')[0],
    unlockedAchievements: [],
    unlockedThemes: ['neon-cyber'],
    activeThemeId: 'neon-cyber',
    soundEnabled: true,
    hapticsEnabled: true,
  };

  saveProfile(newProfile);
  return newProfile;
}

export function saveProfile(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {}
}

export function updatePlayerNickname(nickname: string): PlayerProfile {
  const profile = getInitialProfile();
  profile.nickname = nickname.trim().slice(0, 16) || profile.nickname;
  saveProfile(profile);
  return profile;
}

export function updatePlayerTheme(themeId: string): PlayerProfile {
  const profile = getInitialProfile();
  if (profile.unlockedThemes.includes(themeId)) {
    profile.activeThemeId = themeId;
    saveProfile(profile);
  }
  return profile;
}

export function toggleAudioSetting(): boolean {
  const profile = getInitialProfile();
  profile.soundEnabled = !profile.soundEnabled;
  saveProfile(profile);
  return profile.soundEnabled;
}

export function processGameResult(result: GameResult): {
  profile: PlayerProfile;
  newAchievements: string[];
  newThemeUnlocked: boolean;
  isNewPersonalBest: boolean;
} {
  const profile = getInitialProfile();
  const today = new Date().toISOString().split('T')[0];

  // Daily streak management
  if (profile.lastPlayedDate) {
    const lastDate = new Date(profile.lastPlayedDate);
    const currDate = new Date(today);
    const diffDays = Math.floor((currDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      profile.dailyStreak += 1;
    } else if (diffDays > 1) {
      profile.dailyStreak = 1;
    }
  } else {
    profile.dailyStreak = 1;
  }
  profile.lastPlayedDate = today;
  profile.totalGames += 1;

  // Check personal best
  let isNewPersonalBest = false;
  const currentBest = profile.bestScores[result.mode] || 0;
  if (result.score > currentBest) {
    profile.bestScores[result.mode] = result.score;
    isNewPersonalBest = true;
  }

  // Check new achievements
  const newAchievements: string[] = [];
  const checkAndAdd = (achId: string) => {
    if (!profile.unlockedAchievements.includes(achId)) {
      profile.unlockedAchievements.push(achId);
      newAchievements.push(achId);
    }
  };

  // 1. First play
  checkAndAdd('first_play');

  // 2. Streaks
  if (result.maxStreak >= 5) checkAndAdd('streak_5');
  if (result.maxStreak >= 12) checkAndAdd('streak_12');

  // 3. Scores
  if (result.score >= 500) checkAndAdd('score_500');
  if (result.score >= 1000) checkAndAdd('score_1000');
  if (result.score >= 1500) checkAndAdd('score_1500');

  // 4. Accuracy
  if (result.accuracy === 100 && result.roundsCompleted >= 10) {
    checkAndAdd('eagle_eye');
  }

  // 5. Daily
  if (result.mode === 'daily') {
    checkAndAdd('daily_player');
  }

  // 6. Endless
  if (result.mode === 'endless' && result.roundsCompleted >= 15) {
    checkAndAdd('endless_round_15');
  }

  // 7. Fast reflex
  if (result.avgReactionTimeMs > 0 && result.avgReactionTimeMs < 400 && result.roundsCompleted >= 8) {
    checkAndAdd('fast_reflex');
  }

  // 8. Streak days
  if (profile.dailyStreak >= 3) {
    checkAndAdd('streak_days_3');
  }

  // Check theme unlocks
  let newThemeUnlocked = false;
  const maxScoreEver = Math.max(
    profile.bestScores.classic,
    profile.bestScores.endless,
    profile.bestScores.daily
  );

  if (maxScoreEver >= 600 && !profile.unlockedThemes.includes('cyber-gold')) {
    profile.unlockedThemes.push('cyber-gold');
    newThemeUnlocked = true;
  }
  if (maxScoreEver >= 900 && !profile.unlockedThemes.includes('vaporwave')) {
    profile.unlockedThemes.push('vaporwave');
    newThemeUnlocked = true;
  }
  if (maxScoreEver >= 1200 && !profile.unlockedThemes.includes('matrix')) {
    profile.unlockedThemes.push('matrix');
    newThemeUnlocked = true;
  }

  saveProfile(profile);

  return {
    profile,
    newAchievements,
    newThemeUnlocked,
    isNewPersonalBest,
  };
}
