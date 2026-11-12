import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, playerId, properties } = body;
    if (event) {
      serverStore.trackEvent(event, playerId, properties);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
