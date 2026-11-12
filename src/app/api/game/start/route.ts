import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';
import { GameMode } from '@/types/game';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mode = (body.mode as GameMode) || 'classic';
    const playerId = body.playerId || 'anonymous';
    const clientSeed = typeof body.seed === 'number' ? body.seed : Math.floor(Math.random() * 1000000);

    const sessionToken = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const now = Date.now();

    serverStore.sessions.set(sessionToken, {
      startTime: now,
      mode,
      seed: clientSeed,
      playerId,
    });

    serverStore.trackEvent('game_start', playerId, { mode, seed: clientSeed });

    return NextResponse.json({
      sessionToken,
      seed: clientSeed,
      serverTime: now,
    });
  } catch (error) {
    console.error('Game start error:', error);
    return NextResponse.json({ error: 'Failed to start game session' }, { status: 500 });
  }
}
