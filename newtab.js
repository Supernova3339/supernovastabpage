document.addEventListener("DOMContentLoaded", function() {
  var quoteElement = document.querySelector(".quote");
  var timeElement = document.querySelector(".time");
  var weatherElement = document.querySelector(".weather");

  // Fetch the quote
  fetchQuote();

  // Display the current time
  displayTime();

  // Get the weather information
  getWeather();

  function fetchQuote() {
    fetch('https://zenquotes-proxy.supernova3339.workers.dev/')
      .then(response => response.json())
      .then(data => {
        var quote = data[0].q;
        var author = data[0].a;

        var quoteText = `"${quote}" - ${author}`;
        quoteElement.textContent = quoteText;
      })
      .catch(error => {
        console.log("Error fetching quote:", error);
        quoteElement.innerHTML = "Failed to fetch quote.";
      });
  }

  function displayTime() {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    var timeText = hours + ":" + minutes + " " + ampm;
    timeElement.textContent = timeText;
  }

  function getWeather() {
    var apiKey = localStorage.getItem("apiKey");
    var country = localStorage.getItem("country");
    var state = localStorage.getItem("state");
    var city = localStorage.getItem("city");
    var temperatureUnit = localStorage.getItem("temperatureUnit");

    if (!apiKey || !country || !state || !city) {
      weatherElement.innerHTML = "Please provide an API Key, Country, State, and City in the options.";
      return;
    }

    var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${state},${country}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        var temperature = data.main.temp;
        var temperatureSymbol = temperatureUnit === "fahrenheit" ? "°F" : "°C";

        if (temperatureUnit === "fahrenheit") {
          temperature = (temperature * 9 / 5) + 32;
        }

        temperature = temperature.toFixed(1);

        var weatherText = `Current temperature: ${temperature}${temperatureSymbol}`;
        weatherElement.textContent = weatherText;
      })
      .catch(error => {
        console.log("Error fetching weather:", error);
        weatherElement.innerHTML = "Failed to fetch weather data.";
      });
  }
});
