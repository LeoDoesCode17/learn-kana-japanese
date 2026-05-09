// src/stay-tuned.ts
import $ from "jquery";
import "./style.css";

$(function () {
  $("#back-home-btn").on("click", () => {
    window.location.href = "/";
  });
});