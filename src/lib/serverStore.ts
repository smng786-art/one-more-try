import { LeaderboardEntry, GameMode, ChallengeData } from '@/types/game';

// Realistic sample entries for development / fresh instance
const INITIAL_SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'lb_1', rank: 1, playerId: 'p_apex', nickname: 'NeonBlade ⚡', score: 1840, accuracy: 98.5, maxStreak: 22, mode: 'classic', date: 'Just now' },
  { id: 'lb_2', rank: 2, playerId: 'p_viper', nickname: 'ViperStrike 🐍', score: 1690, accuracy: 96.0, maxStreak: 19, mode: 'classic', date: '5m ago' },
  { id: 'lb_3', rank: 3, playerId: 'p_nova', nickname: 'CyberNova 🌌', score: 1540, accuracy: 94.2, maxStreak: 17, mode: 'classic', date: '12m ago' },
  { id: 'lb_4', rank: 4, playerId: 'p_zero', nickname: 'ZeroLag ⚡', score: 1410, accuracy: 93.0, maxStreak: 15, mode: 'classic', date: '25m ago' },
  { id: 'lb_5', rank: 5, playerId: 'p_pixel', nickname: 'PixelSamurai 🗡️', score: 1280, accuracy: 91.5, maxStreak: 14, mode: 'classic', date: '1h ago' },
  { id: 'lb_6', rank: 6, playerId: 'p_echo', nickname: 'GhostEcho 👻', score: 1150, accuracy: 89.0, maxStreak: 12, mode: 'classic', date: '2h ago' },
  { id: 'lb_7', rank: 7, playerId: 'p_hyper', nickname: 'HyperFlow 🔥', score: 990, accuracy: 88.0, maxStreak: 10, mode: 'classic', date: '3h ago' },
  { id: 'lb_8', rank: 8, playerId: 'p_volt', nickname: 'VoltRunner ⚡', score: 860, accuracy: 86.5, maxStreak: 9, mode: 'classic', date: '4h ago' },
  { id: 'lb_9', rank: 9, playerId: 'p_pulse', nickname: 'PulseWave 🌊', score: 720, accuracy: 84.0, maxStreak: 8, mode: 'classic', date: '5h ago' },
  { id: 'lb_10', rank: 10, playerId: 'p_rookie', nickname: 'Acrobat 🎯', score: 590, accuracy: 81.0, maxStreak: 6, mode: 'classic', date: '6h ago' },
];

class MemoryStore {
  public leaderboards: Map<string, LeaderboardEntry[]> = new Map();
  public challenges: Map<string, ChallengeData> = new Map();
  public sessions: Map<string, { startTime: number; mode: GameMode; seed: number; playerId: string }> = new Map();
  public analytics: Array<{ event: string; playerId?: string; props?: Record<string, unknown>; timestamp: number }> = [];

  constructor() {
    this.leaderboards.set('classic_all_time', [...INITIAL_SAMPLE_LEADERBOARD]);
    
    // Seed endless
    const endlessSamples: LeaderboardEntry[] = INITIAL_SAMPLE_LEADERBOARD.map((item, idx) => ({
      ...item,
      id: `endless_${idx}`,
      score: Math.round(item.score * 1.3),
      mode: 'endless' as GameMode,
    }));
    this.leaderboards.set('endless_all_time', endlessSamples);

    // Seed daily
    const dailySamples: LeaderboardEntry[] = INITIAL_SAMPLE_LEADERBOARD.map((item, idx) => ({
      ...item,
      id: `daily_${idx}`,
      score: Math.round(item.score * 0.95),
      mode: 'daily' as GameMode,
    }));
    this.leaderboards.set('daily_all_time', dailySamples);
  }

  public getLeaderboard(mode: GameMode, period: string): LeaderboardEntry[] {
    const key = `${mode}_${period}`;
    const list = this.leaderboards.get(key) || this.leaderboards.get(`${mode}_all_time`) || [];
    return list.slice(0, 50).map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }

  public addScore(entry: Omit<LeaderboardEntry, 'id' | 'rank'>): LeaderboardEntry {
    const key = `${entry.mode}_all_time`;
    const list = this.leaderboards.get(key) || [];
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: 'score_' + Math.random().toString(36).substring(2, 9),
      rank: 1,
      date: 'Just now',
    };

    list.push(newEntry);
    list.sort((a, b) => b.score - a.score);
    this.leaderboards.set(key, list);

    // Also add to daily
    const dailyKey = `${entry.mode}_daily`;
    const dailyList = this.leaderboards.get(dailyKey) || [];
    dailyList.push(newEntry);
    dailyList.sort((a, b) => b.score - a.score);
    this.leaderboards.set(dailyKey, dailyList);

    return newEntry;
  }

  public saveChallenge(challenge: ChallengeData) {
    this.challenges.set(challenge.id, challenge);
  }

  public getChallenge(id: string): ChallengeData | undefined {
    return this.challenges.get(id);
  }

  public trackEvent(event: string, playerId?: string, props?: Record<string, unknown>) {
    this.analytics.push({
      event,
      playerId,
      props,
      timestamp: Date.now(),
    });
  }
}

// Global singleton for Next.js dev server instance persistence
const globalForStore = globalThis as unknown as { serverStore: MemoryStore };
export const serverStore = globalForStore.serverStore || new MemoryStore();
if (process.env.NODE_ENV !== 'production') globalForStore.serverStore = serverStore;
