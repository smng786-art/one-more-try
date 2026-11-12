import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { GameMode, TapLogItem } from '@/types/game';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sessionToken,
      playerId,
      nickname,
      score,
      accuracy,
      maxStreak,
      roundsCompleted,
      mode,
      tapsLog,
    } = body;

    const session = sessionToken ? serverStore.sessions.get(sessionToken) : null;
    const now = Date.now();

    // Anti-Cheat Validation
    let isCheating = false;
    let cheatReason = '';

    if (session) {
      const elapsedSeconds = (now - session.startTime) / 1000;

      // 1. Classic mode duration check
      if (mode === 'classic' && elapsedSeconds > 18.0) {
        // Tampered session or delayed submission
        isCheating = true;
        cheatReason = 'Session duration exceeds limit';
      }

      // 2. Minimum human reaction time check
      if (Array.isArray(tapsLog) && tapsLog.length > 3) {
        const reactionTimes = (tapsLog as TapLogItem[])
          .filter((t) => t.isCorrect)
          .map((t) => t.reactionTimeMs);

        if (reactionTimes.length > 0) {
          const avgReaction = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
          // Inhuman reaction speed threshold (< 120ms average over 4+ rounds)
          if (avgReaction < 120) {
            isCheating = true;
            cheatReason = 'Reaction time below human capability';
          }
        }
      }

      // 3. Score vs rounds sanity check
      // Max possible score per round is around 350 pts
      const maxPossibleScore = (roundsCompleted + 2) * 350;
      if (score > maxPossibleScore) {
        isCheating = true;
        cheatReason = 'Score mathematically inconsistent with rounds';
      }

      // Remove session to prevent replay
      serverStore.sessions.delete(sessionToken);
    }

    if (isCheating) {
      serverStore.trackEvent('cheat_flagged', playerId, { reason: cheatReason, score, mode });
      return NextResponse.json({
        success: false,
        error: 'Score validation failed: ' + cheatReason,
        flagged: true,
      }, { status: 400 });
    }

    // Record Validated Score
    const entry = serverStore.addScore({
      playerId: playerId || 'anon',
      nickname: (nickname || 'Anonymous').slice(0, 16),
      score: Math.max(0, Math.round(score)),
      accuracy: Math.min(100, Math.max(0, Math.round(accuracy * 10) / 10)),
      maxStreak: Math.max(0, Math.round(maxStreak)),
      mode: (mode as GameMode) || 'classic',
      date: 'Just now',
    });

    // If Supabase is connected, persist asynchronously
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('leaderboards').insert({
          player_id: playerId,
          nickname,
          mode,
          score,
          accuracy,
          max_streak: maxStreak,
          period: 'all_time',
          period_key: 'global',
        });
      } catch (err) {
        console.error('Supabase leaderboard insert error:', err);
      }
    }

    serverStore.trackEvent('game_finish', playerId, {
      mode,
      score,
      accuracy,
      maxStreak,
      roundsCompleted,
    });

    return NextResponse.json({
      success: true,
      entry,
      validated: true,
    });
  } catch (error) {
    console.error('Game finish error:', error);
    return NextResponse.json({ error: 'Failed to record score' }, { status: 500 });
  }
}
