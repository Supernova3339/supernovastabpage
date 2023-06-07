document.addEventListener("DOMContentLoaded", function() {
  var optionsForm = document.getElementById("options-form");
  var apiKeyInput = document.getElementById("apiKey");
  var countryInput = document.getElementById("country");
  var stateInput = document.getElementById("state");
  var cityInput = document.getElementById("city");
  var temperatureUnitInput = document.getElementById("temperatureUnit");

  loadOptions();

  optionsForm.addEventListener("submit", function(event) {
    event.preventDefault();
    saveOptions();
  });

  function loadOptions() {
    var apiKey = localStorage.getItem("apiKey");
    var country = localStorage.getItem("country");
    var state = localStorage.getItem("state");
    var city = localStorage.getItem("city");
    var temperatureUnit = localStorage.getItem("temperatureUnit");

    apiKeyInput.value = apiKey;
    countryInput.value = country;
    stateInput.value = state;
    cityInput.value = city;
    temperatureUnitInput.value = temperatureUnit;
  }

  function saveOptions() {
    var apiKey = apiKeyInput.value;
    var country = countryInput.value;
    var state = stateInput.value;
    var city = cityInput.value;
    var temperatureUnit = temperatureUnitInput.value;

    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("country", country);
    localStorage.setItem("state", state);
    localStorage.setItem("city", city);
    localStorage.setItem("temperatureUnit", temperatureUnit);

    alert("Options saved successfully!");
  }
});