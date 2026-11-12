// Seeded PRNG: Mulberry32
export class SeededRandom {
    s;
    constructor(seed) {
        this.s = seed >>> 0;
    }
    next() {
        let t = (this.s += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    range(min, max) {
        return min + this.next() * (max - min);
    }
    int(min, max) {
        return Math.floor(this.range(min, max + 1));
    }
    pick(arr) {
        return arr[this.int(0, arr.length - 1)];
    }
}
// Convert string (e.g. "2026-11-12") to integer seed
export function dateToSeed(dateStr) {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = (hash << 5) - hash + dateStr.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}
const SHAPES = [
    'rounded',
    'circle',
    'hexagon',
    'diamond',
    'star',
    'triangle',
    'heart',
    'bolt',
];
const ICONS = ['⚡', '🔥', '💎', '🎯', '⭐', '👁️', '🚀', '✨', '👾', '🌀'];
export function generateRound(roundNumber, seed) {
    const rng = seed !== undefined ? new SeededRandom(seed + roundNumber * 777) : null;
    const rand = () => (rng ? rng.next() : Math.random());
    const randInt = (min, max) => (rng ? rng.int(min, max) : Math.floor(min + Math.random() * (max - min + 1)));
    // Determine grid size
    let gridSize = 2;
    if (roundNumber === 1) {
        gridSize = 2; // 2x2
    }
    else if (roundNumber <= 3) {
        gridSize = 3; // 3x3
    }
    else if (roundNumber <= 6) {
        gridSize = 4; // 4x4
    }
    else if (roundNumber <= 11) {
        gridSize = 5; // 5x5
    }
    else if (roundNumber <= 18) {
        gridSize = 6; // 6x6
    }
    else {
        gridSize = 7; // 7x7
    }
    const totalTiles = gridSize * gridSize;
    const oddIndex = randInt(0, totalTiles - 1);
    // Round 1 is ultra beginner-friendly
    if (roundNumber === 1) {
        const baseColor = 'hsl(215, 95%, 55%)'; // Neon Blue
        const oddColor = 'hsl(340, 95%, 55%)'; // Neon Magenta Hot Pink
        const tiles = [];
        for (let i = 0; i < totalTiles; i++) {
            const isOdd = i === oddIndex;
            tiles.push({
                id: i,
                isOdd,
                color: isOdd ? oddColor : baseColor,
                shape: 'rounded',
                rotation: 0,
                scale: 1,
                opacity: 1,
            });
        }
        return {
            level: roundNumber,
            gridSize,
            tiles,
            oddIndex,
            themeType: 'color',
        };
    }
    // Determine round challenge type
    // Progressive difficulty logic:
    // Level 2-3: Color hue delta ~ 45-60 deg
    // Level 4: Shape difference
    // Level 5-6: Color delta ~ 25-35 deg
    // Level 7-8: Rotation / Pattern difference
    // Level 9-11: Color delta ~ 15-20 deg or Icon difference
    // Level 12-16: Fine Color delta ~ 10-15 deg
    // Level 17+: Micro difference ~ 6-10 deg + visual distractions
    const baseHue = randInt(0, 360);
    const baseSat = randInt(75, 95);
    const baseLight = randInt(45, 60);
    // Calculate difficulty-dependent delta
    let hueDelta = 40;
    if (roundNumber <= 3)
        hueDelta = 45;
    else if (roundNumber <= 6)
        hueDelta = 30;
    else if (roundNumber <= 10)
        hueDelta = 20;
    else if (roundNumber <= 15)
        hueDelta = 14;
    else if (roundNumber <= 22)
        hueDelta = 9;
    else
        hueDelta = Math.max(5, 8 - (roundNumber - 22) * 0.2);
    const direction = rand() > 0.5 ? 1 : -1;
    const oddHue = (baseHue + direction * hueDelta + 360) % 360;
    // Decide variation mode
    let themeType = 'color';
    if (roundNumber === 4 || (roundNumber > 6 && roundNumber % 4 === 0)) {
        themeType = 'shape';
    }
    else if (roundNumber === 7 || (roundNumber > 8 && roundNumber % 5 === 0)) {
        themeType = 'rotation';
    }
    else if (roundNumber >= 10 && roundNumber % 6 === 0) {
        themeType = 'icon';
    }
    const baseShape = SHAPES[randInt(0, SHAPES.length - 1)];
    let oddShape = baseShape;
    if (themeType === 'shape') {
        const otherShapes = SHAPES.filter((s) => s !== baseShape);
        oddShape = otherShapes[randInt(0, otherShapes.length - 1)];
    }
    const baseRotation = 0;
    let oddRotation = 0;
    if (themeType === 'rotation') {
        oddRotation = rand() > 0.5 ? 45 : 90;
    }
    let baseIcon = undefined;
    let oddIcon = undefined;
    if (themeType === 'icon') {
        const icon1 = ICONS[randInt(0, ICONS.length - 1)];
        const otherIcons = ICONS.filter((ic) => ic !== icon1);
        const icon2 = otherIcons[randInt(0, otherIcons.length - 1)];
        baseIcon = icon1;
        oddIcon = icon2;
    }
    const hasDistraction = roundNumber >= 14 && rand() > 0.4;
    const baseColor = `hsl(${baseHue}, ${baseSat}%, ${baseLight}%)`;
    const oddColor = themeType === 'color'
        ? `hsl(${oddHue}, ${baseSat}%, ${baseLight}%)`
        : baseColor;
    const tiles = [];
    for (let i = 0; i < totalTiles; i++) {
        const isOdd = i === oddIndex;
        tiles.push({
            id: i,
            isOdd,
            color: isOdd ? oddColor : baseColor,
            shape: isOdd ? oddShape : baseShape,
            rotation: isOdd ? oddRotation : baseRotation,
            scale: 1,
            opacity: 1,
            icon: isOdd ? oddIcon : baseIcon,
            hasDistraction: hasDistraction && rand() > 0.6,
        });
    }
    return {
        level: roundNumber,
        gridSize,
        tiles,
        oddIndex,
        themeType,
    };
}
export function calculateComboMultiplier(streak) {
    if (streak <= 2)
        return 1.0;
    if (streak <= 4)
        return 1.25;
    if (streak <= 7)
        return 1.5;
    if (streak <= 11)
        return 2.0;
    if (streak <= 16)
        return 2.5;
    return 3.0;
}
export function getRankTier(score) {
    if (score < 250) {
        return {
            tier: 'Casual Tapper',
            badge: '🥉',
            color: '#94a3b8',
            percentile: 'Top 75%',
        };
    }
    else if (score < 500) {
        return {
            tier: 'Quick Reflexes',
            badge: '🥈',
            color: '#38bdf8',
            percentile: 'Top 45%',
        };
    }
    else if (score < 800) {
        return {
            tier: 'Speed Demon',
            badge: '🥇',
            color: '#fbbf24',
            percentile: 'Top 20%',
        };
    }
    else if (score < 1200) {
        return {
            tier: 'Visual Prodigy',
            badge: '⚡',
            color: '#c084fc',
            percentile: 'Top 5%',
        };
    }
    else if (score < 1600) {
        return {
            tier: 'CYBER HAWK',
            badge: '🦅',
            color: '#00F0FF',
            percentile: 'Top 1%',
        };
    }
    else {
        return {
            tier: 'REFLEX GOD',
            badge: '👑🔥',
            color: '#FF007F',
            percentile: 'Top 0.1%',
        };
    }
}
