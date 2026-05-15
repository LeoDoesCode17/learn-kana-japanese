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
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#f8fbff,#e2ecff)] text-slate-800">
      <main className="w-full max-w-[900px] bg-white rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.15)] px-4 pt-6 pb-8 text-center">
        <h1 className="mb-5 text-2xl tracking-[0.08em] uppercase text-slate-900">
          LEARNING WRITE KANA
        </h1>
      {/* streak bar */}
      <div className="text-sm text-slate-600 mb-4">
        🔥{" "}
        <span className="font-semibold text-red-600">{streak}</span> day streak
        &nbsp;·&nbsp;
        <span className="font-semibold">{sessionToday}</span> done today
      </div>

      {/* cards */}
      <section className="flex flex-wrap justify-center items-stretch gap-4 mb-5">
        {/* Hiragana card */}
        <div className="relative flex-1 min-w-[260px] max-w-[340px] bg-slate-50 rounded-xl px-4 py-4 shadow-md border border-slate-200 flex flex-col justify-center">
          <div className="text-sm font-semibold text-slate-600 mb-2">
            Mora Hiragana
          </div>
          <div className="text-2xl font-bold tracking-[0.08em] mb-1 text-slate-900">
            {currentHira.romaji}
          </div>
          <div className="text-[34px] font-bold text-blue-600 min-h-[42px]">
            {isRevealed ? currentHira.hiragana : ""}
          </div>

          <button
            className={`absolute top-2 right-2 w-8 h-8 border border-slate-200 rounded-md bg-white text-sm flex items-center justify-center transition
              ${isRevealed ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            onClick={() => isRevealed && speak(currentHira.hiragana)}
            title="Hear hiragana (H)"
          >
            🔊
          </button>
        </div>

        {/* Katakana card */}
        <div className="relative flex-1 min-w-[260px] max-w-[340px] bg-slate-50 rounded-xl px-4 py-4 shadow-md border border-slate-200 flex flex-col justify-center">
          <div className="text-sm font-semibold text-slate-600 mb-2">
            Mora Katakana
          </div>
          <div className="text-2xl font-bold tracking-[0.08em] mb-1 text-slate-900">
            {currentKata.romaji}
          </div>
          <div className="text-[34px] font-bold text-blue-600 min-h-[42px]">
            {isRevealed ? currentKata.katakana : ""}
          </div>

          <button
            className={`absolute top-2 right-2 w-8 h-8 border border-slate-200 rounded-md bg-white text-sm flex items-center justify-center transition
              ${isRevealed ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            onClick={() => isRevealed && speak(currentKata.katakana)}
            title="Hear katakana (K)"
          >
            🔊
          </button>
        </div>
      </section>

      {/* progress */}
      <div className="w-full max-w-[560px] h-[10px] mx-auto mb-4 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-[width] duration-200 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mx-auto mb-5 max-w-[560px] min-h-[24px] px-4 py-2 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs sm:text-sm">
        {isFinished
          ? "All kana practiced! Press Reset to start again."
          : isRevealed
          ? "Check your writing, then press Next. | H = hear hiragana | K = hear katakana"
          : "Try to write the kana!"}
      </div>

      {/* Jisho panel */}
      {isRevealed && (
        <div className="hidden md:block my-4 px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-[11px] uppercase tracking-[0.1em] text-slate-400 mb-2">
            Example words using this kana
          </div>
          <div className="flex flex-wrap gap-2">
            {jishoLoading && (
              <span className="text-sm text-slate-400 italic">
                Loading example words...
              </span>
            )}
            {jishoError && !jishoLoading && (
              <span className="text-sm text-slate-400 italic">{jishoError}</span>
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
                  <button
                    key={idx}
                    type="button"
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-left flex flex-col gap-0.5 hover:border-indigo-500 transition-colors"
                    onClick={() => speak(word)}
                  >
                    <span className="text-xl text-slate-900">{word}</span>
                    <span className="text-[11px] text-slate-500">{reading}</span>
                    <span className="text-[11px] text-indigo-600 font-medium">
                      {meaning}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* main action button */}
      <button
        type="button"
        onClick={handleActionClick}
        className="mt-3 inline-block px-8 py-3 text-sm font-semibold rounded-full border-0 text-white bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_10px_20px_rgba(37,99,235,0.35)] transition
                  hover:brightness-105 hover:shadow-[0_12px_24px_rgba(37,99,235,0.4)]
                  active:translate-y-[1px] active:scale-[0.98] active:shadow-[0_6px_14px_rgba(37,99,235,0.3)]"
      >
        {buttonLabel}
      </button>
      </main>
    </div>
  );
};