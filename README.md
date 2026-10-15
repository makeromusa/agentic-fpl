# ⚽ Agentic FPL Manager

An enterprise-grade, agentic Fantasy Premier League intelligence platform featuring game-theory mini-league optimization, a 5-gameweek trajectory engine, an interactive visual pitch, and a conversational AI tactical copilot.

---

## 🌟 Key Features

1. **Interactive Football Pitch View:**
   - Real-time Starting XI with dynamic formation detection (3-5-2, 4-3-3, 3-4-3).
   - Visual substitutes bench with injury alerts and captaincy/vice-captaincy badges.
   - Selected player statistical inspector (Form, ICT index, total points, cost).

2. **Mini-League "Rival Spy" & Game-Theory Engine:**
   - Tracks rival squads and calculates Effective Ownership (EO).
   - Dynamic game-theory advice: Differential captaincy recommendations to catch up to league leaders.

3. **5-Gameweek Horizon Planner:**
   - Multi-week transfer roadmap evaluating rolling free transfers vs taking point hits.
   - Strategic Chip recommendations (Wildcard, Free Hit, Bench Boost, Triple Captain).

4. **Midnight Price Change Predictor & Market Watch:**
   - Predicts players approaching the ±100% net transfer threshold ahead of the official 1:30 AM price adjustments.

5. **"Pep Roulette" & Press Conference Rotation Decoder:**
   - Rotation risk percentages computed from minutes played, tactical substitution patterns, and press conference quotes.

6. **AI Tactical Copilot:**
   - Natural language assistant answering complex squad questions, transfer viability, and differential analysis.

---

## 🚀 Tech Stack

- **Frontend & API:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS (Official Premier League / FPL color tokens), Lucide Icons
- **Database & Auth:** PostgreSQL (Supabase / Local PostgreSQL)
- **AI Engine:** Google Gemini with tool calling & structured JSON reasoning
- **Deployment:** Vercel + GitHub Actions

---

## 🛠️ Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production:**
   ```bash
   npm run build
   ```
