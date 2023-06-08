document.addEventListener("DOMContentLoaded", function() {
  var quoteElement = document.querySelector(".quote");
  var timeElement = document.querySelector(".time");
  var weatherElement = document.querySelector(".weather");
  var containerElement = document.querySelector(".container");
  var settingsIcon = document.querySelector(".settings-icon");
  var popup = document.querySelector(".popup");

  // Fetch the quote
  fetchQuote();

  // Display the current time
  displayTime();
  setInterval(displayTime, 1000); // Update time every second

  // Get the weather information
  getWeather();

  settingsIcon.addEventListener("click", function() {
    popup.classList.toggle("show");
  });

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

    setTimeout(function() {
      fetch('https://api.ip.sb/geoip')
      .then(res => res.json())
      .then(data => {
          localStorage.setItem('city', data.city)
          localStorage.setItem('state', data.region)
          localStorage.setItem('country', data.country)
      })
      }, 5184000000);
    const city = localStorage.getItem('city');
    const state = localStorage.getItem('region');
    const country = localStorage.getItem('country');

    var apiKey = localStorage.getItem("apiKey");

    var temperatureUnit = localStorage.getItem("temperatureUnit");
    if(!temperatureUnit) {
      localStorage.setItem('temperatureUnit', "Fahrenheit")
    }

    if (!apiKey) {
      weatherElement.innerHTML = "Please provide an API Key in the options.";
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

        // Show the container after weather data is loaded
        containerElement.classList.add("show");
      })
      .catch(error => {
        console.log("Error fetching weather:", error);
        weatherElement.innerHTML = "Failed to fetch weather data.";

        // Show the container even if weather data fails to load
        containerElement.classList.add("show");
      });
  }
});