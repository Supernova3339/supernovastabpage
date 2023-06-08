document.addEventListener("DOMContentLoaded", function() {
  var optionsForm = document.getElementById("options-form");
  var apiKeyInput = document.getElementById("apiKey");
  var temperatureUnitInput = document.getElementById("temperatureUnit");
  var wallpaperColorInput = document.getElementById("wallpaperColor");
  var textColorInput = document.getElementById("textColor");

  loadOptions();

  optionsForm.addEventListener("submit", function(event) {
    event.preventDefault();
    saveOptions();
  });

  function loadOptions() {
    var apiKey = localStorage.getItem("apiKey");
    var temperatureUnit = localStorage.getItem("temperatureUnit");
    var wallpaperColor = localStorage.getItem("wallpaperColor");
    var textColor = localStorage.getItem("textColor");

    apiKeyInput.value = apiKey;
    temperatureUnitInput.value = temperatureUnit;
    wallpaperColorInput.value = wallpaperColor || "#000000";
    textColorInput.value = textColor || "#ffffff";
  }

  function saveOptions() {
    var apiKey = apiKeyInput.value;
    var temperatureUnit = temperatureUnitInput.value;
    var wallpaperColor = wallpaperColorInput.value;
    var textColor = textColorInput.value;

    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("temperatureUnit", temperatureUnit);
    localStorage.setItem("wallpaperColor", wallpaperColor);
    localStorage.setItem("textColor", textColor);

    alert("Options saved successfully!");
  }
});