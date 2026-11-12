export type GameMode = 'classic' | 'endless' | 'daily';

export type GameScreen = 
  | 'welcome' 
  | 'mode_select' 
  | 'countdown' 
  | 'playing' 
  | 'gameover' 
  | 'leaderboard' 
  | 'stats' 
  | 'themes' 
  | 'challenge';

export interface TileData {
  id: number;
  isOdd: boolean;
  color: string;
  shape: 'circle' | 'square' | 'rounded' | 'hexagon' | 'star' | 'diamond' | 'triangle' | 'ring' | 'heart' | 'bolt';
  rotation: number;
  scale: number;
  opacity: number;
  icon?: string;
  hasDistraction?: boolean;
}

export interface RoundConfig {
  level: number;
  gridSize: number; // e.g. 2 for 2x2, 5 for 5x5
  tiles: TileData[];
  oddIndex: number;
  timeLimitMs?: number; // for endless mode
  themeType: 'color' | 'shape' | 'rotation' | 'icon' | 'hybrid';
}

export interface TapLogItem {
  round: number;
  timeOffsetMs: number;
  isCorrect: boolean;
  reactionTimeMs: number;
}

export interface PlayerProfile {
  id: string;
  nickname: string;
  avatarSeed: string;
  totalGames: number;
  bestScores: {
    classic: number;
    endless: number;
    daily: number;
  };
  dailyStreak: number;
  lastPlayedDate: string;
  unlockedAchievements: string[];
  unlockedThemes: string[];
  activeThemeId: string;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface GameResult {
  id: string;
  mode: GameMode;
  score: number;
  accuracy: number;
  totalTaps: number;
  correctTaps: number;
  wrongTaps: number;
  maxStreak: number;
  roundsCompleted: number;
  durationSeconds: number;
  avgReactionTimeMs: number;
  rankTier: string;
  tierColor: string;
  isNewPersonalBest: boolean;
  timestamp: number;
  challengeId?: string;
  seed?: number;
}

export interface ChallengeData {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerScore: number;
  challengerStreak: number;
  challengerAccuracy: number;
  mode: GameMode;
  seed: number;
  createdAt: number;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  playerId: string;
  nickname: string;
  score: number;
  accuracy: number;
  maxStreak: number;
  mode: GameMode;
  date: string;
  isCurrentPlayer?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GameTheme {
  id: string;
  name: string;
  tagline: string;
  bgGradient: string;
  surfaceBg: string;
  accentColor: string;
  secondaryColor: string;
  glowColor: string;
  borderHighlight: string;
  requiredScore?: number;
  requiredMode?: GameMode;
  isFree?: boolean;
}

export interface AnalyticsMetric {
  totalGames: number;
  uniquePlayers: number;
  avgScore: number;
  avgDurationSec: number;
  shareClicks: number;
  challengePlays: number;
  recentGames: Array<{
    id: string;
    nickname: string;
    score: number;
    mode: GameMode;
    timestamp: number;
  }>;
}
