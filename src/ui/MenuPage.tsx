import React from "react";

export const MenuPage: React.FC = () => {
  const handleStartExercise1 = () => {
    window.location.href = "/kana_exercise_1.html";
  };

  const handleStartExercise2 = () => {
    window.location.href = "/stay-tuned.html";
  };

  return (
    <main id="menu">
      <h1>Learning Write Kana</h1>
      <p>Select an exercise to start:</p>

      <ul className="menu-buttons">
        <li>
          <button id="start-kana-btn" onClick={handleStartExercise1}>
            Kana Exercise 1
          </button>
        </li>
        <li>
          <button id="kana-exercise-btn-2" onClick={handleStartExercise2}>
            Kana Exercise 2
          </button>
        </li>
      </ul>
    </main>
  );
};