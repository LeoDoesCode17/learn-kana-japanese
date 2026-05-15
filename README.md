# Learning Write Kana

A small web app built with **Vite + React + TypeScript** to practice writing Japanese kana (hiragana and katakana) from romaji prompts.

The app shows two cards:

- **Mora Hiragana**: displays a random romaji, then reveals the hiragana.
- **Mora Katakana**: displays a different random romaji, then reveals the katakana.

A single button toggles between **Reveal** and **Next**, so learners can first try to write the kana on paper and then check the correct characters.

---

## Features

- Random romaji prompts for hiragana and katakana (never the same romaji on both cards at once).
- Reveal / Next flow for active recall:
  - **Reveal** shows the kana for the current romaji.
  - **Next** generates a new pair of romaji.
- Complete basic **gojūon** set (46 sounds) with romaji, hiragana, and katakana.[web:47][web:57]
- Daily **streak tracking** stored in `localStorage` (streak days + sessions done today).
- Keyboard shortcuts:
  - Space / Right Arrow to advance.
  - H = play hiragana audio, K = play katakana audio (Web Speech API).
- Example words panel powered by a small API proxy to **Jisho.org** for extra reading practice.
- Simple, responsive UI using **Tailwind CSS** and a card-based layout.

---

## Tech Stack

- [Vite](https://vite.dev/) – dev server and bundler for fast React + TS development.[web:18][web:104]
- React – component-based UI for the menu, exercise page, and “stay tuned” page.[web:104]
- TypeScript – typed logic for kana data, streak tracking, and state handling.[web:20]
- Tailwind CSS – utility-first styling for layout, cards, buttons, and responsive design.[web:94]
- Web Speech API – client-side text-to-speech for kana pronunciation.
- Jisho API proxy – backend endpoint under `/api/jisho` used to fetch example words for the current kana.

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm, pnpm, or yarn

### Installation

```bash
# clone the repository
git clone git@github.com:LeoDoesCode17/learn-kana-japanese.git
cd learn-kana-japanese

# install dependencies
npm install
# or: pnpm install / yarn install
```

### Development

```bash
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`) in your browser.[web:27][web:104]

### Build

```bash
npm run build
npm run preview
```

---

## Project Structure

```text
.
├─ index.html             # Root HTML for the SPA entry
├─ src
│  ├─ main.tsx            # React app entry, routes to menu / exercise pages
│  ├─ pages
│  │  ├─ MenuPage.tsx     # Main menu with exercise selection
│  │  ├─ KanaExercisePage.tsx  # Main kana exercise logic & UI
│  │  └─ StayTunedPage.tsx     # “Coming soon” screen for future features
│  ├─ kana.ts             # KanaItem interface and full kanaList (46 basic kana)
│  └─ style.css           # Tailwind entry file (`@import "tailwindcss"`)
└─ vite.config.ts         # Vite configuration (React + Tailwind plugins)
```

---

## How It Works

1. `kana.ts` exports an array of kana objects:

   - `romaji`: e.g. `ka`
   - `hiragana`: e.g. `か`
   - `katakana`: e.g. `カ`.[web:47][web:57]

2. The exercise page keeps state for:

   - which kana are currently shown (indices for hiragana and katakana),
   - which kana have already been practiced (to avoid repeats),
   - whether answers are currently revealed,
   - streak information loaded from and saved to `localStorage`.

3. When the user clicks the main button:

   - If answers are hidden (**Reveal**): it shows the kana, bumps the streak counters, and fetches example words.
   - If answers are shown (**Next**): it marks the current kana as “done”, selects a new random pair that has not been used yet, hides the answers again, and resets the example words.
   - When all kana have been practiced, the button changes to **Reset**, which clears the “done” state and restarts the session.

---

## Possible Enhancements

- Add dakuten / handakuten / yōon kana and a toggle for “Basic” vs “Advanced”.
- Add separate exercise modes (hiragana-only, katakana-only, random mix).
- Show a “session summary” (accuracy, time spent, streak changes).
- Add stroke order hints or links to external stroke order diagrams.
- Add per-kana difficulty tracking (e.g. mark kana as “hard” and show them more often).

---

## License

Add your preferred license here (e.g. MIT), or keep it private if this is only for personal use.