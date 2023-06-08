document.addEventListener("DOMContentLoaded", function() {
  var optionsForm = document.getElementById("options-form");
  var apiKeyInput = document.getElementById("apiKey");
  var temperatureUnitInput = document.getElementById("temperatureUnit");

  loadOptions();

  optionsForm.addEventListener("submit", function(event) {
    event.preventDefault();
    saveOptions();
  });

  function loadOptions() {
    var apiKey = localStorage.getItem("apiKey");
    var temperatureUnit = localStorage.getItem("temperatureUnit");

    apiKeyInput.value = apiKey;
    temperatureUnitInput.value = temperatureUnit;
  }

  function saveOptions() {
    var apiKey = apiKeyInput.value;
    var temperatureUnit = temperatureUnitInput.value;

    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("temperatureUnit", temperatureUnit);

    alert("Options saved successfully!");
  }
});