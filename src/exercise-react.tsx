import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { KanaExercisePage } from "./ui/KanaExercisePage";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <KanaExercisePage />
  </React.StrictMode>
);