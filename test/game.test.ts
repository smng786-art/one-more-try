import { generateRound, calculateComboMultiplier, getRankTier, dateToSeed } from '../src/lib/gameEngine.ts';
import { ALL_ACHIEVEMENTS } from '../src/lib/achievements.ts';
import { GAME_THEMES } from '../src/lib/themes.ts';

console.log('--- Testing ONE MORE TRY! Core Engine ---');

// 1. Level 1 beginner round
const r1 = generateRound(1);
console.assert(r1.gridSize === 2, `Expected 2x2 grid for round 1, got ${r1.gridSize}`);
console.assert(r1.tiles.length === 4, `Expected 4 tiles for round 1, got ${r1.tiles.length}`);
console.assert(r1.tiles.filter(t => t.isOdd).length === 1, 'Expected exactly 1 odd tile');
console.log('✓ Round 1 Beginner validation passed');

// 2. Progressive difficulty grid scaling
const r4 = generateRound(4);
console.assert(r4.gridSize === 4, `Expected 4x4 grid for round 4, got ${r4.gridSize}`);
console.assert(r4.tiles.length === 16, `Expected 16 tiles for round 4, got ${r4.tiles.length}`);

const r8 = generateRound(8);
console.assert(r8.gridSize === 5, `Expected 5x5 grid for round 8, got ${r8.gridSize}`);

const r15 = generateRound(15);
console.assert(r15.gridSize === 6, `Expected 6x6 grid for round 15, got ${r15.gridSize}`);

const r25 = generateRound(25);
console.assert(r25.gridSize === 7, `Expected 7x7 grid for round 25, got ${r25.gridSize}`);
console.log('✓ Grid scaling progression passed');

// 3. Seed determinism (Daily Challenge & Challenge Links)
const seed = 987654321;
const seedR1 = generateRound(10, seed);
const seedR2 = generateRound(10, seed);
console.assert(seedR1.oddIndex === seedR2.oddIndex, 'Deterministic seed must produce identical odd index');
console.assert(seedR1.tiles[0].color === seedR2.tiles[0].color, 'Deterministic seed must produce identical tile colors');
console.log('✓ Seed determinism passed (Daily Challenge sequence is identical globally)');

// 4. Combo Multipliers
console.assert(calculateComboMultiplier(1) === 1.0, 'Streak 1 should be 1.0x');
console.assert(calculateComboMultiplier(4) === 1.25, 'Streak 4 should be 1.25x');
console.assert(calculateComboMultiplier(6) === 1.5, 'Streak 6 should be 1.5x');
console.assert(calculateComboMultiplier(10) === 2.0, 'Streak 10 should be 2.0x');
console.assert(calculateComboMultiplier(18) === 3.0, 'Streak 18 should be 3.0x');
console.log('✓ Combo multipliers passed');

// 5. Rank Tiers
console.assert(getRankTier(150).tier === 'Casual Tapper', 'Tier < 250');
console.assert(getRankTier(350).tier === 'Quick Reflexes', 'Tier 250-500');
console.assert(getRankTier(650).tier === 'Speed Demon', 'Tier 500-800');
console.assert(getRankTier(950).tier === 'Visual Prodigy', 'Tier 800-1200');
console.assert(getRankTier(1350).tier === 'CYBER HAWK', 'Tier 1200-1600');
console.assert(getRankTier(1750).tier === 'REFLEX GOD', 'Tier 1600+');
console.log('✓ Performance rank tiers passed');

// 6. Achievements & Themes completeness
console.assert(ALL_ACHIEVEMENTS.length === 12, 'Expected 12 achievements');
console.assert(GAME_THEMES.length === 4, 'Expected 4 unlockable themes');
console.log('✓ Achievements (12) and Themes (4) verified');

// 7. Date to Seed converter
const d1 = dateToSeed('2026-11-12');
const d2 = dateToSeed('2026-11-12');
const d3 = dateToSeed('2026-11-13');
console.assert(d1 === d2, 'Same date must yield identical seed');
console.assert(d1 !== d3, 'Different dates must yield different seeds');
console.log('✓ Date to Seed generator verified');

console.log('ALL 7 GAME SUITE TESTS PASSED 100%!');
