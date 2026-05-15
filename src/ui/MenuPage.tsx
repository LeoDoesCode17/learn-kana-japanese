import React from "react";

export const MenuPage: React.FC = () => {
  const handleStartExercise1 = () => {
    window.location.href = "/kana_exercise_1.html";
  };

  const handleStartExercise2 = () => {
    window.location.href = "/stay-tuned.html";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#f8fbff,#e2ecff)] text-slate-800">
      <main className="w-full max-w-[600px] bg-white rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.15)] px-4 pt-6 pb-8 text-center">
        <h1 className="mb-4 text-2xl tracking-[0.08em] uppercase text-slate-900">
          Learning Write Kana
        </h1>

        <p className="mb-6 text-sm sm:text-base text-slate-600">
          Select an exercise to start:
        </p>

        <ul className="list-none p-0 m-0 flex flex-col items-center gap-3">
          <li className="w-full max-w-xs">
            <button
              type="button"
              onClick={handleStartExercise1}
              className="w-full px-6 py-2.5 text-sm font-semibold rounded-full border-0 text-white bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_10px_20px_rgba(37,99,235,0.35)] transition
                         hover:brightness-105 hover:shadow-[0_12px_24px_rgba(37,99,235,0.4)]
                         active:translate-y-[1px] active:scale-[0.98] active:shadow-[0_6px_14px_rgba(37,99,235,0.3)]"
            >
              Kana Exercise 1
            </button>
          </li>
          <li className="w-full max-w-xs">
            <button
              type="button"
              onClick={handleStartExercise2}
              className="w-full px-6 py-2.5 text-sm font-semibold rounded-full border-0 text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_10px_20px_rgba(37,99,235,0.35)] transition
                         hover:brightness-105 hover:shadow-[0_12px_24px_rgba(37,99,235,0.4)]
                         active:translate-y-[1px] active:scale-[0.98] active:shadow-[0_6px_14px_rgba(37,99,235,0.3)]"
            >
              Kana Exercise 2
            </button>
          </li>
        </ul>
      </main>
    </div>
  );
};