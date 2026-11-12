import { GameResult, PlayerProfile } from '@/types/game';

export async function generateScoreCardBlob(
  result: GameResult,
  profile: PlayerProfile,
  challengeUrl: string
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  // High-res 1200x675 (16:9 social card)
  canvas.width = 1200;
  canvas.height = 675;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 1. Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 675);
  bgGrad.addColorStop(0, '#06080F');
  bgGrad.addColorStop(0.5, '#0E1326');
  bgGrad.addColorStop(1, '#080914');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 675);

  // 2. Cyber grid lines
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x < 1200; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 675);
    ctx.stroke();
  }
  for (let y = 0; y < 675; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1200, y);
    ctx.stroke();
  }

  // 3. Neon Glow Orbs
  const drawGlow = (cx: number, cy: number, r: number, color: string) => {
    const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    radGrad.addColorStop(0, color);
    radGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };

  drawGlow(150, 100, 300, 'rgba(0, 240, 255, 0.12)');
  drawGlow(1050, 500, 350, 'rgba(255, 0, 127, 0.12)');
  drawGlow(600, 330, 250, 'rgba(157, 78, 221, 0.08)');

  // 4. Border frame
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, 1140, 615);

  ctx.strokeStyle = 'rgba(255, 0, 127, 0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, 1128, 603);

  // 5. Header: Game Title
  ctx.textAlign = 'left';
  ctx.fillStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 15;
  ctx.font = '900 42px system-ui, -apple-system, sans-serif';
  ctx.fillText('ONE MORE TRY!', 80, 105);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 18px system-ui, -apple-system, sans-serif';
  ctx.fillText("THINK YOU'RE FAST? PROVE IT!", 82, 135);

  // 6. Player Name & Tier Badge
  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(profile.nickname, 1120, 100);

  // Tier pill badge
  const tierWidth = 260;
  const tierX = 1120 - tierWidth;
  const tierY = 115;
  ctx.fillStyle = 'rgba(255, 0, 127, 0.2)';
  ctx.strokeStyle = '#FF007F';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(tierX, tierY, tierWidth, 36, 18);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FF007F';
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.fillText(result.rankTier.toUpperCase(), tierX + tierWidth / 2, tierY + 24);

  // 7. Huge Neon Score Readout in Center
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('FINAL SCORE', 600, 215);

  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 25;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 110px system-ui, -apple-system, sans-serif';
  ctx.fillText(result.score.toLocaleString(), 600, 315);
  ctx.shadowBlur = 0;

  // Mode badge
  ctx.fillStyle = '#00F0FF';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(`[ ${result.mode.toUpperCase()} MODE ]`, 600, 355);

  // 8. Stats Cards (Accuracy, Max Streak, Reaction Time)
  const stats = [
    { label: 'ACCURACY', value: `${result.accuracy}%`, color: '#00FFA3' },
    { label: 'MAX STREAK', value: `${result.maxStreak}x 🔥`, color: '#FFE600' },
    { label: 'AVG REACTION', value: `${Math.round(result.avgReactionTimeMs)} ms`, color: '#00F0FF' },
  ];

  const cardW = 280;
  const cardH = 90;
  const startX = 600 - (3 * cardW + 2 * 30) / 2;
  const cardY = 385;

  stats.forEach((st, idx) => {
    const cx = startX + idx * (cardW + 30);
    ctx.fillStyle = 'rgba(16, 21, 40, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx, cardY, cardW, cardH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(st.label, cx + cardW / 2, cardY + 30);

    ctx.fillStyle = st.color;
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
    ctx.fillText(st.value, cx + cardW / 2, cardY + 68);
  });

  // 9. Challenge Callout Footer
  const footerY = 515;
  ctx.fillStyle = 'rgba(255, 0, 127, 0.15)';
  ctx.strokeStyle = '#FF007F';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(140, footerY, 920, 85, 16);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillText('⚡ CAN YOU BEAT MY SCORE?', 600, footerY + 38);

  ctx.fillStyle = '#00F0FF';
  ctx.font = '600 18px system-ui, -apple-system, sans-serif';
  ctx.fillText(`TAP TO ACCEPT CHALLENGE: ${challengeUrl.replace(/^https?:\/\//, '')}`, 600, footerY + 66);

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export function createShareText(result: GameResult, profile: PlayerProfile, challengeUrl: string): string {
  return `🔥 I scored ${result.score.toLocaleString()} pts (${result.rankTier}) in ONE MORE TRY!\nCan you beat my reflex speed?\n\n👉 Accept challenge: ${challengeUrl}`;
}

export function getWhatsAppShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function getTwitterShareUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
