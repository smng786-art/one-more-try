import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ChallengeData } from '@/types/game';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      challengerId,
      challengerName,
      challengerScore,
      challengerStreak,
      challengerAccuracy,
      mode,
      seed,
    } = body;

    const id = 'ch_' + Math.random().toString(36).substring(2, 8);
    const challenge: ChallengeData = {
      id,
      challengerId: challengerId || 'anon',
      challengerName: challengerName || 'Speedster',
      challengerScore: Number(challengerScore) || 0,
      challengerStreak: Number(challengerStreak) || 0,
      challengerAccuracy: Number(challengerAccuracy) || 100,
      mode: mode || 'classic',
      seed: Number(seed) || Math.floor(Math.random() * 100000),
      createdAt: Date.now(),
    };

    serverStore.saveChallenge(challenge);
    serverStore.trackEvent('challenge_created', challengerId, {
      challengeId: id,
      score: challengerScore,
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('challenges').insert({
          id,
          challenger_id: challenge.challengerId,
          challenger_name: challenge.challengerName,
          challenger_score: challenge.challengerScore,
          challenger_streak: challenge.challengerStreak,
          challenger_accuracy: challenge.challengerAccuracy,
          mode: challenge.mode,
          seed: challenge.seed,
        });
      } catch (err) {
        console.error('Supabase challenge insert error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      challenge,
      challengeId: id,
    });
  } catch (error) {
    console.error('Challenge create error:', error);
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }
}
