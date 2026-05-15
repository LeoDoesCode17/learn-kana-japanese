import React, { useMemo, useState } from "react";
import { kanaList, type KanaItem } from "../kana";

interface KanaState {
  kana: KanaItem;
  isHiraganaDone: boolean;
  isKatakanaDone: boolean;
}

const KANA_NUMBER = kanaList.length;

const initKanaListState = (): KanaState[] =>
  kanaList.map((kana) => ({
    kana,
    isHiraganaDone: false,
    isKatakanaDone: false,
  }));

function pickTwoDifferentIndices(listState: KanaState[]): [number, number] {
  const maxExclusive = listState.length;
  const remainingHira: number[] = [];
  const remainingKata: number[] = [];

  for (let i = 0; i < maxExclusive; i++) {
    if (!listState[i].isHiraganaDone) remainingHira.push(i);
    if (!listState[i].isKatakanaDone) remainingKata.push(i);
  }

  if (remainingHira.length === 0 || remainingKata.length === 0) {
    return [-1, -1];
  }

  const hIdx =
    remainingHira[Math.floor(Math.random() * remainingHira.length)];
  let kIdx =
    remainingKata[Math.floor(Math.random() * remainingKata.length)];

  if (kIdx === hIdx && remainingKata.length > 1) {
    do {
      kIdx =
        remainingKata[Math.floor(Math.random() * remainingKata.length)];
    } while (kIdx === hIdx);
  }

  return [hIdx, kIdx];
}

export const KanaExercisePage: React.FC = () => {
  const [kanaState, setKanaState] = useState<KanaState[]>(() =>
    initKanaListState()
  );
  const [[hiraganaIdx, katakanaIdx], setIndices] = useState<[number, number]>(() =>
    pickTwoDifferentIndices(initKanaListState())
  );
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const doneCount = useMemo(() => {
    const hiraDone = kanaState.filter((k) => k.isHiraganaDone).length;
    const kataDone = kanaState.filter((k) => k.isKatakanaDone).length;
    return hiraDone + kataDone;
  }, [kanaState]);

  const totalCount = KANA_NUMBER * 2;
  const progressPercent = (doneCount / totalCount) * 100;

  const currentHira = hiraganaIdx >= 0 ? kanaList[hiraganaIdx] : null;
  const currentKata = katakanaIdx >= 0 ? kanaList[katakanaIdx] : null;

  const handleButtonClick = () => {
    if (isFinished) {
      // reset all
      const resetState = initKanaListState();
      const [h, k] = pickTwoDifferentIndices(resetState);
      setKanaState(resetState);
      setIndices([h, k]);
      setIsRevealed(false);
      setIsFinished(false);
      return;
    }

    if (!isRevealed) {
      setIsRevealed(true);
    } else {
      // Next
      const newState = kanaState.map((item, idx) => ({
        ...item,
        isHiraganaDone:
          idx === hiraganaIdx ? true : item.isHiraganaDone,
        isKatakanaDone:
          idx === katakanaIdx ? true : item.isKatakanaDone,
      }));

      const [newH, newK] = pickTwoDifferentIndices(newState);

      if (newH === -1 || newK === -1) {
        setKanaState(newState);
        setIsFinished(true);
        setIsRevealed(true);
      } else {
        setKanaState(newState);
        setIndices([newH, newK]);
        setIsRevealed(false);
      }
    }
  };

  const buttonLabel = isFinished
    ? "Reset"
    : isRevealed
    ? "Next"
    : "Reveal";

  const hintText = isFinished
    ? "All kana practiced! Press Reset to start again."
    : !isRevealed
    ? "Try to write the kana!"
    : "Check your writing, then press Next.";

  return (
    <main id="app">
      <h1>LEARNING WRITE KANA</h1>

      <section className="cards">
        <div className="card" id="hiragana-card">
          <div className="card-title">Mora Hiragana</div>
          <div className="card-romaji" id="hiragana-romaji">
            {currentHira?.romaji}
          </div>
          <div className="card-kana" id="hiragana-kana">
            {isRevealed ? currentHira?.hiragana : ""}
          </div>
        </div>

        <div className="card" id="katakana-card">
          <div className="card-title">Mora Katakana</div>
          <div className="card-romaji" id="katakana-romaji">
            {currentKata?.romaji}
          </div>
          <div className="card-kana" id="katakana-kana">
            {isRevealed ? currentKata?.katakana : ""}
          </div>
        </div>
      </section>

      <div id="progress-wrapper">
        <div
          id="progress-bar"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div id="hint-area">{hintText}</div>

      <button id="action-btn" onClick={handleButtonClick}>
        {buttonLabel}
      </button>
    </main>
  );
};