# Learning Write Kana

A small web app built with **Vite + TypeScript + jQuery** to practice writing Japanese kana (hiragana and katakana) from romaji prompts.

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
- Complete basic **gojūon** set (46 sounds) with romaji, hiragana, and katakana.
- Simple, responsive UI using flexbox and card-based layout.

---

## Tech Stack

- [Vite](https://vite.dev/) – dev server and bundler.[web:18]
- TypeScript – typed logic and data model for kana items.[web:20]
- jQuery – DOM selection and event handling.
- CSS (vanilla) – styling for the cards, hint bar, and button.

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm, pnpm, or yarn

### Installation

```bash
# clone the repository
git clone <your-repo-url>
cd <your-project-folder>

# install dependencies
npm install
# or: pnpm install / yarn install
```

### Development

```bash
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`) in your browser.[web:27]

### Build

```bash
npm run build
npm run preview
```

---

## Project Structure

```text
.
├─ index.html        # Main HTML skeleton
├─ src
│  ├─ main.ts        # App entry, state handling, randomizer, DOM updates
│  ├─ kana.ts        # KanaItem interface and full kanaList
│  └─ style.css      # Layout and styling for cards, hint, button
└─ vite.config.ts    # Vite configuration
```

---

## How It Works

1. `kana.ts` exports an array of kana objects:

   - `romaji`: e.g. `ka`
   - `hiragana`: e.g. `か`
   - `katakana`: e.g. `カ`.[web:47][web:57]

2. On load, `main.ts`:

   - Picks two **different** random indices from `kanaList`.
   - Displays only the romaji on each card.
   - Sets the button label to **Reveal**.

3. When the user clicks the button:

   - If kana are hidden, it reveals hiragana and katakana and changes the label to **Next**.
   - If kana are revealed, it selects a new pair of romaji, hides kana again, and resets the label to **Reveal**.

---

## Possible Enhancements

- Add dakuten / handakuten / yōon kana and a toggle for “Basic” vs “Advanced”.
- Track score or streak (e.g. “How many in a row did you recall correctly?”).
- Add stroke order hints or links to external stroke order diagrams.
- Add keyboard shortcuts: space for Reveal/Next, etc.

---

## License

Add your preferred license here (e.g. MIT), or keep it private if this is only for personal use.