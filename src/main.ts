// src/main.ts
import $ from "jquery";
import { kanaList, type KanaItem } from "./kana";
import "./style.css";

interface AppState {
  hiraganaIdx: number;
  katakanaIdx: number;
  isRevelead: boolean;
  kanaCounter: number;      // how many "Next" we have done
  isFinished: boolean;      // all kana used
}

interface KanaState {
  kana: KanaItem;
  isHiraganaDone: boolean;
  isKatakanaDone: boolean;
}

const KANA_NUMBER = kanaList.length

const kanaListState: KanaState[] = kanaList.map((kana: KanaItem) => {
  return {
    kana: kana,
    isHiraganaDone: false,
    isKatakanaDone: false,
  }
})

const state: AppState = {
  hiraganaIdx: Math.floor(Math.random() * KANA_NUMBER),
  katakanaIdx: Math.floor(Math.random() * KANA_NUMBER),
  isRevelead: false,
  kanaCounter: 0,
  isFinished: false
}

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
}

function revealKana(): void {
  $("#hiragana-kana").text(kanaList[state.hiraganaIdx].hiragana);
  $("#katakana-kana").text(kanaList[state.katakanaIdx].katakana);
  $("#hint-area").text("Check your writing, then press Next.");
}

function updateProgressBar(): void {
  const total = KANA_NUMBER * 2; // hiragana + katakana exercises
  const done = kanaListState.filter(k => k.isHiraganaDone).length
             + kanaListState.filter(k => k.isKatakanaDone).length;
  const percent = (done / total) * 100;
  $("#progress-bar").css("width", `${percent}%`);
}

$(function () {
  // initial random pair
  const [hIdx, kIdx] = pickTwoDifferentIndices(KANA_NUMBER);
  state.hiraganaIdx = hIdx;
  state.katakanaIdx = kIdx;
  state.isRevelead = false;

  showRomajiOnly();
  setButtonLabel();

  $("#action-btn").on("click", () => {
    if (state.isFinished) {
      // reset everything
      kanaListState.forEach(k => {
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
        state.isFinished = true
        $("#hint-area").text("All kana practiced! Press Reset to start again.");
      } else {
        kanaListState[newH].isHiraganaDone = true
        kanaListState[newK].isKatakanaDone = true
        state.hiraganaIdx = newH;
        state.katakanaIdx = newK;
        state.isRevelead = false;
        state.kanaCounter++
        showRomajiOnly();
      }
    }
    updateProgressBar();
    setButtonLabel();
  });
});