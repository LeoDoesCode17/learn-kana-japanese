import $ from "jquery";
import "./style.css"

$(function () {
  $("#start-kana-btn").on("click", () => {
    // navigate to the exercise page
    window.location.href = "/kana_exercise_1.html";
  });
});