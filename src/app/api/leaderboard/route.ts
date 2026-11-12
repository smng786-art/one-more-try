import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { GameMode } from '@/types/game';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get('mode') as GameMode) || 'classic';
    const period = searchParams.get('period') || 'all_time';

    // If Supabase is available, query real database
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('leaderboards')
          .select('*')
          .eq('mode', mode)
          .order('score', { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0) {
          const formatted = data.map((d, idx) => ({
            id: d.id,
            rank: idx + 1,
            playerId: d.player_id,
            nickname: d.nickname,
            score: d.score,
            accuracy: Number(d.accuracy),
            maxStreak: d.max_streak,
            mode: d.mode as GameMode,
            date: new Date(d.created_at).toLocaleDateString(),
          }));
          return NextResponse.json({ entries: formatted });
        }
      } catch (err) {
        console.error('Supabase query error, fallback to memory:', err);
      }
    }

    // Resilient memory store
    const entries = serverStore.getLeaderboard(mode, period);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
