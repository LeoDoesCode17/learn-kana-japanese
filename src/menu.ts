import $ from "jquery";
import "./style.css"

$(function () {
  $("#start-kana-btn").on("click", () => {
    // navigate to the exercise page
    window.location.href = "/kana_exercise_1.html";
  });

  $("#kana-exercise-btn-2").on("click", () => {
    // navigate to the exercise page
    window.location.href = "/stay-tuned.html";
  });
});