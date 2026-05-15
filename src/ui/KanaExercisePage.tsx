import React, { useEffect, useMemo, useState, useCallback } from "react";
import { kanaList, type KanaItem } from "../kana";
import "../style.css";

interface KanaState {
  kana: KanaItem;
  isHiraganaDone: boolean;
  isKatakanaDone: boolean;
}

interface StreakData {
  streak: number;
  sessionToday: number;
  lastDate?: string;
}

const KANA_NUMBER = kanaList.length;

function loadStreakFromStorage(): StreakData {
  const data = JSON.parse(localStorage.getItem("kana_streak") || "{}");
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();

  if (data.lastDate !== today) {
    // new day: continues only if last session was yesterday
    data.streak = data.lastDate === yesterday ? data.streak || 0 : 0;
    data.sessionToday = 0;
  }

  return {
    streak: data.streak || 0,
    sessionToday: data.sessionToday || 0,
    lastDate: data.lastDate,
  };
}

function bumpStreakInStorage(): StreakData {
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
  return {
    streak: data.streak,
    sessionToday: data.sessionToday,
    lastDate: data.lastDate,
  };
}

// Web Speech helper
function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "ja-JP";
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

type JishoWord = {
  japanese: { word?: string; reading?: string }[];
  senses: { english_definitions?: string[] }[];
};

export const KanaExercisePage: React.FC = () => {
  const [kanaStates, setKanaStates] = useState<KanaState[]>(
    () =>
      kanaList.map((kana) => ({
        kana,
        isHiraganaDone: false,
        isKatakanaDone: false,
      })) as KanaState[]
  );

  const [hiraganaIdx, setHiraganaIdx] = useState(0);
  const [katakanaIdx, setKatakanaIdx] = useState(1);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  // const [kanaCounter, setKanaCounter] = useState(0);

  const [streak, setStreak] = useState(0);
  const [sessionToday, setSessionToday] = useState(0);

  const [jishoWords, setJishoWords] = useState<JishoWord[]>([]);
  const [jishoLoading, setJishoLoading] = useState(false);
  const [jishoError, setJishoError] = useState<string | null>(null);

  // ----- helpers -----

  const buttonLabel = useMemo(() => {
    if (isFinished) return "Reset";
    return isRevealed ? "Next" : "Reveal";
  }, [isFinished, isRevealed]);

  const progressPercent = useMemo(() => {
    const total = KANA_NUMBER * 2;
    const done =
      kanaStates.filter((k) => k.isHiraganaDone).length +
      kanaStates.filter((k) => k.isKatakanaDone).length;
    return (done / total) * 100;
  }, [kanaStates]);

  const pickTwoDifferentIndices = useCallback((): [number, number] => {
    const remainingHira: number[] = [];
    const remainingKata: number[] = [];

    kanaStates.forEach((ks, i) => {
      if (!ks.isHiraganaDone) remainingHira.push(i);
      if (!ks.isKatakanaDone) remainingKata.push(i);
    });

    if (!remainingHira.length || !remainingKata.length) {
      return [-1, -1];
    }

    const hIdx =
      remainingHira[Math.floor(Math.random() * remainingHira.length)];
    let kIdx =
      remainingKata[Math.floor(Math.random() * remainingKata.length)];

    if (kIdx === hIdx && remainingKata.length > 1) {
      // try again until different
      do {
        kIdx =
          remainingKata[Math.floor(Math.random() * remainingKata.length)];
      } while (kIdx === hIdx);
    }

    return [hIdx, kIdx];
  }, [kanaStates]);

  const currentHira = kanaList[hiraganaIdx];
  const currentKata = kanaList[katakanaIdx];

  // ----- streak init -----
  useEffect(() => {
    const data = loadStreakFromStorage();
    setStreak(data.streak);
    setSessionToday(data.sessionToday);
  }, []);

  // ----- initial pair -----
  useEffect(() => {
    const [h, k] = pickTwoDifferentIndices();
    if (h >= 0 && k >= 0) {
      setHiraganaIdx(h);
      setKatakanaIdx(k);
    }
  }, [pickTwoDifferentIndices]);

  // ----- Jisho fetch -----
  const fetchJishoWords = useCallback(async (hiragana: string) => {
    setJishoLoading(true);
    setJishoError(null);
    setJishoWords([]);

    try {
      const res = await fetch(
        `/api/jisho?keyword=${encodeURIComponent(hiragana)}`
      );
      const data = await res.json();

      const words = (data.data as JishoWord[])
        .filter((w) => {
          const jp = w.japanese?.[0] || {};
          const reading = jp.reading || "";
          const word = jp.word || "";
          return (
            (reading.startsWith(hiragana) || word.startsWith(hiragana)) &&
            jp.word
          );
        })
        .slice(0, 4);

      setJishoWords(words);
      if (!words.length) {
        setJishoError("No example words found.");
      }
    } catch (e) {
      setJishoError("Failed to load words.");
    } finally {
      setJishoLoading(false);
    }
  }, []);

  // ----- main button handler -----
  const handleActionClick = () => {
    if (isFinished) {
      // reset
      setKanaStates(
        kanaList.map((kana) => ({
          kana,
          isHiraganaDone: false,
          isKatakanaDone: false,
        }))
      );
      // setKanaCounter(0);
      setIsFinished(false);
      setIsRevealed(false);
      setJishoWords([]);
      setJishoError(null);

      const [h, k] = pickTwoDifferentIndices();
      if (h >= 0 && k >= 0) {
        setHiraganaIdx(h);
        setKatakanaIdx(k);
      }
      return;
    }

    if (!isRevealed) {
      // Reveal
      setIsRevealed(true);

      const data = bumpStreakInStorage();
      setStreak(data.streak);
      setSessionToday(data.sessionToday);

      fetchJishoWords(currentHira.hiragana);
    } else {
      // Next pair
      const [newH, newK] = pickTwoDifferentIndices();
      if (newH === -1 || newK === -1) {
        setIsFinished(true);
        setIsRevealed(false);
        setJishoWords([]);
        setJishoError(null);
        return;
      }

      setKanaStates((prev) =>
        prev.map((ks, i) => ({
          ...ks,
          isHiraganaDone:
            ks.isHiraganaDone || i === newH ? true : ks.isHiraganaDone,
          isKatakanaDone:
            ks.isKatakanaDone || i === newK ? true : ks.isKatakanaDone,
        }))
      );

      setHiraganaIdx(newH);
      setKatakanaIdx(newK);
      // setKanaCounter((c) => c + 1);
      setIsRevealed(false);
      setJishoWords([]);
      setJishoError(null);
    }
  };

  // ----- keyboard shortcuts -----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          handleActionClick();
          break;
        case "ArrowRight":
          if (isRevealed) {
            e.preventDefault();
            handleActionClick();
          }
          break;
        case "KeyH":
          if (isRevealed) speak(currentHira.hiragana);
          break;
        case "KeyK":
          if (isRevealed) speak(currentKata.katakana);
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleActionClick, isRevealed, currentHira.hiragana, currentKata.katakana]);

  // ----- render -----
  return (
    <main id="app">
      <h1>LEARNING WRITE KANA</h1>

      {/* streak bar */}
      <div id="streak-bar">
        🔥 <span id="streak-count">{streak}</span> day streak &nbsp;·&nbsp;
        <span id="session-count">{sessionToday}</span> done today
      </div>

      {/* cards */}
      <section className="cards">
        <div className="card" id="hiragana-card">
          <div className="card-title">Mora Hiragana</div>
          <div className="card-romaji">{currentHira.romaji}</div>
          <div className="card-kana">
            {isRevealed ? currentHira.hiragana : ""}
          </div>
          <button
            className="speak-btn"
            onClick={() => isRevealed && speak(currentHira.hiragana)}
            style={{
              opacity: isRevealed ? 1 : 0,
              pointerEvents: isRevealed ? "auto" : "none",
            }}
            title="Hear hiragana (H)"
          >
            🔊
          </button>
        </div>

        <div className="card" id="katakana-card">
          <div className="card-title">Mora Katakana</div>
          <div className="card-romaji">{currentKata.romaji}</div>
          <div className="card-kana">
            {isRevealed ? currentKata.katakana : ""}
          </div>
          <button
            className="speak-btn"
            onClick={() => isRevealed && speak(currentKata.katakana)}
            style={{
              opacity: isRevealed ? 1 : 0,
              pointerEvents: isRevealed ? "auto" : "none",
            }}
            title="Hear katakana (K)"
          >
            🔊
          </button>
        </div>
      </section>

      {/* progress */}
      <div id="progress-wrapper">
        <div
          id="progress-bar"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* hint area */}
      <div id="hint-area">
        {isFinished
          ? "All kana practiced! Press Reset to start again."
          : isRevealed
          ? "Check your writing, then press Next. | H = hear hiragana | K = hear katakana"
          : "Try to write the kana!"}
      </div>

      {/* Jisho panel */}
      {isRevealed && (
        <div id="jisho-panel">
          <div id="jisho-label">Example words using this kana</div>
          <div id="jisho-words">
            {jishoLoading && (
              <span className="jisho-loading">Loading example words...</span>
            )}
            {jishoError && !jishoLoading && (
              <span className="jisho-loading">{jishoError}</span>
            )}
            {!jishoLoading &&
              !jishoError &&
              jishoWords.map((w, idx) => {
                const jp = w.japanese[0] || {};
                const reading = jp.reading || "";
                const word = jp.word || "";
                const meaning = (w.senses[0]?.english_definitions || [])
                  .slice(0, 2)
                  .join(", ");
                return (
                  <div
                    key={idx}
                    className="jisho-word"
                    onClick={() => speak(word)}
                  >
                    <span className="jisho-jp">{word}</span>
                    <span className="jisho-reading">{reading}</span>
                    <span className="jisho-meaning">{meaning}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* main action button */}
      <button id="action-btn" onClick={handleActionClick}>
        {buttonLabel}
      </button>
    </main>
  );
};