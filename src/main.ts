// src/main.ts
import $ from "jquery";
import { kanaList, type KanaItem } from "./kana";
import "./style.css";

interface AppState {
  hiraganaIdx: number;
  katakanaIdx: number;
  isRevelead: boolean;
  kanaCounter: number; // how many "Next" we have done
  isFinished: boolean; // all kana used
}

interface KanaState {
  kana: KanaItem;
  isHiraganaDone: boolean;
  isKatakanaDone: boolean;
}

// Streak Helpers
function loadStreak(): void {
  const data = JSON.parse(localStorage.getItem("kana_streak") || "{}");
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();

  if (data.lastDate !== today) {
    // new day: check if streak continues or resets
    data.streak = data.lastDate === yesterday ? data.streak || 0 : 0;
    data.sessionToday = 0;
  }

  renderStreak(data.streak || 0, data.sessionToday || 0);
}

function bumpStreak(): void {
  const data = JSON.parse(localStorage.getItem("kana_streak") || "{}");
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();

  if (data.lastDate !== today) {
    data.streak = data.lastDate === yesterday ? (data.streak || 0) + 1 : 1;
    data.sessionToday = 1;
    data.lastDate = today;
  } else {
    data.sessionToday = (data.sessionToday || 0) + 1;
  }

  localStorage.setItem("kana_streak", JSON.stringify(data));
  renderStreak(data.streak, data.sessionToday);
}

function renderStreak(streak: number, sessionToday: number): void {
  // inject streak bar if not already present
  if (!$("#streak-bar").length) {
    $("h1").after(
      `<div id="streak-bar">
        🔥 <span id="streak-count">${streak}</span> day streak
        &nbsp;·&nbsp;
        <span id="session-count">${sessionToday}</span> done today
      </div>`,
    );
  } else {
    $("#streak-count").text(streak);
    $("#session-count").text(sessionToday);
  }
}

// Web Speech API
function speak(text: string): void {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "ja-JP";
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

function injectSpeakButtons(): void {
  // add speak button to each card if not already present
  if (!$("#speak-hira").length) {
    $("#hiragana-card").append(
      `<button class="speak-btn" id="speak-hira" title="Dengar (H)">🔊</button>`,
    );
  }
  if (!$("#speak-kata").length) {
    $("#katakana-card").append(
      `<button class="speak-btn" id="speak-kata" title="Dengar (K)">🔊</button>`,
    );
  }

  $("#speak-hira")
    .off("click")
    .on("click", (e) => {
      e.stopPropagation();
      speak(kanaList[state.hiraganaIdx].hiragana);
    });
  $("#speak-kata")
    .off("click")
    .on("click", (e) => {
      e.stopPropagation();
      speak(kanaList[state.katakanaIdx].katakana);
    });
}

function showSpeakButtons(visible: boolean): void {
  $(".speak-btn")
    .css("opacity", visible ? "1" : "0")
    .css("pointer-events", visible ? "auto" : "none");
}

// Jisho API
async function fetchJishoWords(hiragana: string): Promise<void> {
  if (!$("#jisho-panel").length) {
    $("#action-btn").before(
      `<div id="jisho-panel">
        <div id="jisho-label">Example words using this kana</div>
        <div id="jisho-words"></div>
      </div>`,
    );
  }

  $("#jisho-panel").show();
  $("#jisho-words").html(
    `<span class="jisho-loading">Loading example words...</span>`,
  );

  try {
    const res = await fetch(
      `/api/jisho?keyword=${encodeURIComponent(hiragana)}`,
    );
    const data = await res.json();

    const words = (data.data as any[])
      .filter((w) => {
        const reading = w.japanese?.[0]?.reading || "";
        const word = w.japanese?.[0]?.word || "";
        // only show words that START with the kana being learned
        return (
          (reading.startsWith(hiragana) || word.startsWith(hiragana)) &&
          w.japanese?.[0]?.word
        );
      })
      .slice(0, 4);

    if (!words.length) {
      $("#jisho-words").html(
        `<span class="jisho-loading">No example words found.</span>`,
      );
      return;
    }

    const html = words
      .map((w) => {
        const jp = w.japanese[0];
        const reading = jp.reading || "";
        const meaning = (w.senses[0]?.english_definitions || [])
          .slice(0, 2)
          .join(", ");
        return `<div class="jisho-word" data-word="${jp.word}">
          <span class="jisho-jp">${jp.word}</span>
          <span class="jisho-reading">${reading}</span>
          <span class="jisho-meaning">${meaning}</span>
        </div>`;
      })
      .join("");

    $("#jisho-words").html(html);

    $(".jisho-word").on("click", function () {
      speak($(this).data("word"));
    });
  } catch {
    $("#jisho-words").html(
      `<span class="jisho-loading">Failed to load words.</span>`,
    );
  }
}

function hideJishoPanel(): void {
  $("#jisho-panel").hide();
}

const KANA_NUMBER = kanaList.length;

const kanaListState: KanaState[] = kanaList.map((kana: KanaItem) => {
  return {
    kana: kana,
    isHiraganaDone: false,
    isKatakanaDone: false,
  };
});

const state: AppState = {
  hiraganaIdx: Math.floor(Math.random() * KANA_NUMBER),
  katakanaIdx: Math.floor(Math.random() * KANA_NUMBER),
  isRevelead: false,
  kanaCounter: 0,
  isFinished: false,
};

function setButtonLabel(): void {
  if (state.isFinished) {
    $("#action-btn").text("Reset");
  } else {
    $("#action-btn").text(state.isRevelead ? "Next" : "Reveal");
  }
}

function pickTwoDifferentIndices(maxExclusive: number): [number, number] {
  // collect remaining indices separately for hira and kata
  const remainingHira: number[] = [];
  const remainingKata: number[] = [];

  for (let i = 0; i < maxExclusive; i++) {
    if (!kanaListState[i].isHiraganaDone) remainingHira.push(i);
    if (!kanaListState[i].isKatakanaDone) remainingKata.push(i);
  }

  // if either is empty, no more pairs are possible
  if (remainingHira.length === 0 || remainingKata.length === 0) {
    return [-1, -1]; // signal "no more"
  }

  const hIdx = remainingHira[Math.floor(Math.random() * remainingHira.length)];
  const kIdx = remainingKata[Math.floor(Math.random() * remainingKata.length)];

  // avoid using the same index if there are alternatives
  // if (kIdx === hIdx && remainingKata.length > 1) {
  //   // pick again until different
  //   do {
  //     kIdx = remainingKata[Math.floor(Math.random() * remainingKata.length)];
  //   } while (kIdx === hIdx);
  // }

  return [hIdx, kIdx];
}

function showRomajiOnly(): void {
  $("#hiragana-romaji").text(kanaList[state.hiraganaIdx].romaji);
  $("#hiragana-kana").text("");

  $("#katakana-romaji").text(kanaList[state.katakanaIdx].romaji);
  $("#katakana-kana").text("");

  $("#hint-area").text("Try to write the kana!");
  showSpeakButtons(false);
  hideJishoPanel();
}

function revealKana(): void {
  $("#hiragana-kana").text(kanaList[state.hiraganaIdx].hiragana);
  $("#katakana-kana").text(kanaList[state.katakanaIdx].katakana);
  $("#hint-area").text(
    "Check your writing, then press Next.  |  H = hear hiragana  |  K = hear katakana",
  );
  showSpeakButtons(true);
  bumpStreak();
  // fetch words for the hiragana mora
  fetchJishoWords(kanaList[state.hiraganaIdx].hiragana);
}

function updateProgressBar(): void {
  const total = KANA_NUMBER * 2; // hiragana + katakana exercises
  const done =
    kanaListState.filter((k) => k.isHiraganaDone).length +
    kanaListState.filter((k) => k.isKatakanaDone).length;
  const percent = (done / total) * 100;
  $("#progress-bar").css("width", `${percent}%`);
}

$(function () {
  loadStreak();
  injectSpeakButtons();
  showSpeakButtons(false);

  // initial random pair
  const [hIdx, kIdx] = pickTwoDifferentIndices(KANA_NUMBER);
  state.hiraganaIdx = hIdx;
  state.katakanaIdx = kIdx;
  state.isRevelead = false;

  showRomajiOnly();
  setButtonLabel();

  // button click
  $("#action-btn").on("click", () => {
    if (state.isFinished) {
      // reset everything
      kanaListState.forEach((k) => {
        k.isHiraganaDone = false;
        k.isKatakanaDone = false;
      });
      state.kanaCounter = 0;
      state.isFinished = false;

      const [hIdx, kIdx] = pickTwoDifferentIndices(KANA_NUMBER);
      state.hiraganaIdx = hIdx;
      state.katakanaIdx = kIdx;
      state.isRevelead = false;

      showRomajiOnly();
      updateProgressBar();
      setButtonLabel();
      return;
    }

    if (!state.isRevelead) {
      // was hidden -> reveal
      revealKana();
      state.isRevelead = true;
    } else {
      // was revealed -> next pair, hide
      const [newH, newK] = pickTwoDifferentIndices(KANA_NUMBER);
      if (newH === -1 || newK === -1) {
        state.isFinished = true;
        $("#hint-area").text("All kana practiced! Press Reset to start again.");
        showSpeakButtons(false);
        hideJishoPanel();
      } else {
        kanaListState[newH].isHiraganaDone = true;
        kanaListState[newK].isKatakanaDone = true;
        state.hiraganaIdx = newH;
        state.katakanaIdx = newK;
        state.isRevelead = false;
        state.kanaCounter++;
        showRomajiOnly();
      }
    }
    updateProgressBar();
    setButtonLabel();
  });

  // keyboard shortcuts
  $(document).on("keydown", (e) => {
    const tag = (document.activeElement?.tagName || "").toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    switch (e.code) {
      case "Space":
        e.preventDefault();
        $("#action-btn").trigger("click");
        break;
      case "ArrowRight":
        e.preventDefault();
        if (state.isRevelead) $("#action-btn").trigger("click");
        break;
      case "KeyH":
        if (state.isRevelead) speak(kanaList[state.hiraganaIdx].hiragana);
        break;
      case "KeyK":
        if (state.isRevelead) speak(kanaList[state.katakanaIdx].katakana);
        break;
    }
  });
});
