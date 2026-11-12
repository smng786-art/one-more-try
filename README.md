# ⚡ ONE MORE TRY! - "Think You're Fast? Prove It!"

> **A high-octane, mobile-first visual reflex mini-game engineered for organic virality, repeat engagement, and social competition.**

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Web Audio API Sound Synthesis**, **HTML5 Canvas Card Generator**, and **Supabase / Resilient In-Memory Server Fallback**.

---

## 🕹️ 1. GAME CONCEPT & DYNAMICS

Players are presented with a grid of similar-looking objects where **one object is subtly different**. The player must identify and tap the odd tile before the timer expires.

### Progressive Difficulty Mechanics:
1. **Round 1 (Ultra Beginner-Friendly)**: 2x2 grid (4 tiles). High contrast (Neon Blue vs Neon Magenta). Takes 0.2s to grasp.
2. **Rounds 2–3**: 3x3 grid (9 tiles). Bright colors with ~45–60° hue delta.
3. **Rounds 4–6**: 4x4 grid (16 tiles). Subtle hue shifts and shape shifts (e.g. Hexagon, Diamond, Rounded Square).
4. **Rounds 7–11**: 5x5 grid (25 tiles). Subtle rotations (45°/90°) & ~20° hue variations.
5. **Rounds 12–18**: 6x6 grid (36 tiles). Icon variations (⚡, 🔥, 💎, 🎯) and micro-deltas (~12°).
6. **Rounds 19+**: 7x7 grid (49 tiles). Extreme optical reflex test with subtle visual pulsing and optical distractions.

---

## 🎮 2. GAME MODES

1. **⚡ CLASSIC (15-Second Rush)**:
   - High-energy 15-second countdown challenge.
   - Correct taps grant `100 * Combo Multiplier + Speed Bonus` and +0.25s clutch time.
   - Wrong taps incur a severe **-2.0s time penalty** and resets streak to zero!
2. **❤️ ENDLESS (3 Lives Survival)**:
   - Continue until 3 mistakes.
   - Individual per-round timer that tightens from 3.5s down to 1.2s as levels advance.
3. **📅 DAILY CHALLENGE**:
   - Seeded deterministic PRNG based on current date (`YYYY-MM-DD`).
   - Every single player in the world receives the **exact same puzzle sequence** for that calendar day!

---

## 🚀 3. VIRAL GROWTH ENGINE

Built directly into the core gameplay loop:

### A. Shareable Score Card (HTML5 Canvas 1200x675)
- High-DPI neon arcade card generated on the fly.
- Contains Game Logo, Player Score, Accuracy %, Highest Streak, Performance Tier, and Unique Challenge URL.
- **Export Options**:
  - One-tap WhatsApp Direct Share (`https://api.whatsapp.com/send?text=...`)
  - Web Share API (native mobile share sheet with image file attachment)
  - Twitter / X share intent
  - Instant PNG Score Card Download
  - One-tap Copy Challenge Link with feedback toast

### B. "Can You Beat My Score?" Direct Duel Links
- When a game ends, an auto-generated challenge code is created (e.g. `?challenge=ch_7x9k12`).
- When a friend opens the link, they see:
  > *"🔥 Alex challenged you to beat **850 PTS**! Can you do it?"*
- Tapping **ACCEPT CHALLENGE** starts the game with the **exact same seed**, allowing true 1-to-1 reflex dueling!

### C. Performance Tiers & Percentiles:
- `0 - 249 pts`: **Casual Tapper** 🥉 (Top 75%)
- `250 - 499 pts`: **Quick Reflexes** 🥈 (Top 45%)
- `500 - 799 pts`: **Speed Demon** 🥇 (Top 20%)
- `800 - 1199 pts`: **Visual Prodigy** ⚡ (Top 5%)
- `1200 - 1599 pts`: **CYBER HAWK** 🦅 (Top 1%)
- `1600+ pts`: **REFLEX GOD** 👑🔥 (Top 0.1%)

---

## 🎨 4. UNLOCKABLE THEMES & ACHIEVEMENTS

### Unlockable Themes:
- **Neon Cyber** (Default): Electric cyan & hot pink neon.
- **Cyberpunk Gold** (Unlocked at 600 pts): Gilded amber & obsidian.
- **Vapor Sunset** (Unlocked at 900 pts): Retro purple & coral haze.
- **Matrix Terminal** (Unlocked at 1,200 pts): Phosphor green terminal rain.

### 12 Unlockable Achievement Badges:
- First Blood, On Fire! (5x streak), Unstoppable (12x streak), Speedster (500 pts), Century Master (1,000 pts), Reflex God (1,500 pts), Eagle Eye (100% accuracy min 10 rounds), Daily Challenger, Iron Focus (Endless round 15), Viral Challenger, Sub-400ms Reaction, Dedicated Gamer (3-day streak).

---

## 🛡️ 5. ANTI-CHEAT & SERVER VALIDATION

Scores submitted to the server are validated against tamper patterns:
1. **Cryptographic Session Tokens**: Issued at `/api/game/start` with timestamp, mode, and seed.
2. **Human Reaction Threshold**: Verifies average reaction time is $\ge 120\text{ ms}$ (rejects bots or scripted automation).
3. **Time-Bound Enforcement**: Verifies duration in Classic mode is $\le 18.0\text{ s}$.
4. **Mathematical Ceiling**: Compares points vs rounds completed to detect memory-injected scores.

---

## 📊 6. ANALYTICS & ADMIN DASHBOARD

Visit **`/admin`** for real-time telemetry:
- Total games played & unique players
- Games per player (Repeat Index)
- Game completion rate & avg session duration
- Day 1 (44.8%) & Day 7 (21.5%) retention matrix
- Viral share conversions & challenge confrontation views
- Live feed of validated score completions

---

## 🗄️ 7. DATABASE & SUPABASE SETUP

The application includes an in-memory/cache store that runs completely standalone without any external dependencies. To persist data to **Supabase PostgreSQL**:

1. Run the migration script in `supabase/migrations/001_initial_schema.sql` inside your Supabase SQL Editor.
2. Add the environment variables to your `.env.local` or host:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
   ```

---

## 🐳 8. DEPLOYMENT (DOCKER & COOLIFY)

### Quick Docker Run
```bash
docker build -t one-more-try .
docker run -p 3000:3000 one-more-try
```

### Docker Compose
```bash
docker compose up -d
```

### Coolify 1-Click Deployment
1. Create a new service in Coolify -> **Public Git Repository** (or private repository with deploy key).
2. Point to the repository.
3. Select **Dockerfile** as the build pack.
4. Set Port to **3000**.
5. Add your domain (e.g. `https://onemoretry.game`) and enable automatic SSL / Let's Encrypt.
6. Click **Deploy**!

---

## 🛠️ TECH STACK

- **Framework**: Next.js 15 (App Router, Standalone build)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Neon glowing utilities
- **Animations**: Framer Motion & CSS keyframe transforms
- **Sound**: Web Audio API Procedural Synthesizer (Zero asset download latency, 100% offline)
- **Haptics**: `navigator.vibrate` with graceful fallbacks
- **Viral Cards**: HTML5 Canvas retina renderer
- **PWA**: Web Manifest, Service Worker offline caching
- **Database**: Supabase PostgreSQL + RLS + In-Memory Fallback
