import React from "react";

export const StayTunedPage: React.FC = () => {
  const handleBackHome = () => {
    window.location.href = "/";
  };

  return (
    <main id="stay-tuned">
      <h1>More Kana Practice Coming Soon</h1>

      <p className="stay-subtitle">
        New exercises are on the way. Stay tuned for more ways to practice
        hiragana and katakana!
      </p>

      <ul className="stay-list">
        <li>Hiragana-only & Katakana-only modes</li>
        <li>Timed practice and streak tracking</li>
        <li>Yōon and dakuten drills</li>
      </ul>

      <button id="back-home-btn" onClick={handleBackHome}>
        Back to Main Menu
      </button>
    </main>
  );
};