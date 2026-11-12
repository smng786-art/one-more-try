import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check memory store
    const challenge = serverStore.getChallenge(id);
    if (challenge) {
      serverStore.trackEvent('challenge_viewed', undefined, { challengeId: id });
      return NextResponse.json({ challenge });
    }

    // Check Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return NextResponse.json({
          challenge: {
            id: data.id,
            challengerId: data.challenger_id,
            challengerName: data.challenger_name,
            challengerScore: data.challenger_score,
            challengerStreak: data.challenger_streak,
            challengerAccuracy: Number(data.challenger_accuracy),
            mode: data.mode,
            seed: Number(data.seed),
            createdAt: new Date(data.created_at).getTime(),
          },
        });
      }
    }

    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
  } catch (error) {
    console.error('Challenge fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch challenge' }, { status: 500 });
  }
}
