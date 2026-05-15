import React from "react";

export const StayTunedPage: React.FC = () => {
  const handleBackHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#f8fbff,#e2ecff)] text-slate-800">
      <main className="w-full max-w-[650px] bg-white rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.15)] px-4 pt-6 pb-8 text-center">
        <h1 className="mb-3 text-2xl tracking-[0.06em] uppercase text-slate-900">
          More Kana Practice Coming Soon
        </h1>

        <p className="mb-4 text-sm sm:text-base text-slate-600">
          New exercises are on the way. Stay tuned for more ways to practice
          hiragana and katakana!
        </p>

        <ul className="mb-6 list-disc list-inside text-sm sm:text-base text-slate-600 space-y-1 text-left sm:text-center sm:list-none">
          <li>Hiragana-only &amp; Katakana-only modes</li>
          <li>Timed practice and streak tracking</li>
          <li>Yōon and dakuten drills</li>
        </ul>

        <button
          type="button"
          onClick={handleBackHome}
          className="inline-block w-full max-w-xs px-6 py-2.5 text-sm font-semibold rounded-full border-0 text-white bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_10px_20px_rgba(37,99,235,0.35)] transition
                     hover:brightness-105 hover:shadow-[0_12px_24px_rgba(37,99,235,0.4)]
                     active:translate-y-[1px] active:scale-[0.98] active:shadow-[0_6px_14px_rgba(37,99,235,0.3)]"
        >
          Back to Main Menu
        </button>
      </main>
    </div>
  );
};