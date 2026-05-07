// src/main.ts
import $ from "jquery";
import { kanaList } from "./kana";
import "./style.css";

interface AppState {
  hiraganaIdx: number;
  katakanaIdx: number;
  isRevelead: boolean;
}

const KANA_NUMBER = kanaList.length

const state: AppState = {
  hiraganaIdx: Math.floor(Math.random() * KANA_NUMBER),
  katakanaIdx: Math.floor(Math.random() * KANA_NUMBER),
  isRevelead: false
}

function setButtonLabel(): void {
  $("#action-btn").text(state.isRevelead ? "Next" : "Reveal")
}

function pickTwoDifferentIndices(maxExclusive: number): [number, number] {
  const first = Math.floor(Math.random() * maxExclusive);
  let second = Math.floor(Math.random() * maxExclusive);

  // keep re-rolling until different
  while (second === first) {
    second = Math.floor(Math.random() * maxExclusive);
  }

  return [first, second];
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

$(function () {
  // initial random pair
  const [hIdx, kIdx] = pickTwoDifferentIndices(KANA_NUMBER);
  state.hiraganaIdx = hIdx;
  state.katakanaIdx = kIdx;
  state.isRevelead = false;

  showRomajiOnly();
  setButtonLabel();

  $("#action-btn").on("click", () => {
    if (!state.isRevelead) {
      // was hidden -> reveal
      revealKana();
      state.isRevelead = true;
    } else {
      // was revealed -> next pair, hide
      const [newH, newK] = pickTwoDifferentIndices(KANA_NUMBER);
      state.hiraganaIdx = newH;
      state.katakanaIdx = newK;
      state.isRevelead = false;
      showRomajiOnly();
    }

    setButtonLabel();
  });
});