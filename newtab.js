document.addEventListener("DOMContentLoaded", function() {
  var quoteElement = document.querySelector(".quote");
  var timeElement = document.querySelector(".time");
  var weatherElement = document.querySelector(".weather");
  var topSitesElement = document.querySelector(".top-sites");
  var containerElement = document.querySelector(".container");
  var settingsIcon = document.querySelector(".settings-icon");
  var popup = document.querySelector(".popup");
  const textColorInput = document.getElementById("textColor");
  const toggleTopSitesInput = document.getElementById("toggleTopSites");

  // Display colors
  displayColors();

  // Display the current time
  displayTime();
  setInterval(displayTime, 1000); // Update time every second

  // Get the weather information
  getWeather();

  // Fetch the quote
  fetchQuote();

  // Get the top sites
  var toggleTopSites = localStorage.getItem("toggleTopSites");
  if (toggleTopSites === "true") {
    getTopSites();
  }

  if (settingsIcon && popup) {
    settingsIcon.addEventListener("click", function() {
      popup.classList.toggle("show");
    });
  }

  function displayColors() {
    containerElement.style.setProperty("--text-color", getTextColor());
    containerElement.style.setProperty("--wallpaper-color", getWallpaperColor());
  }

  function fetchQuote() {
    fetch('https://zenquotes-proxy.supernova3339.workers.dev/')
      .then(response => response.json())
      .then(data => {
        var quote = data[0].q;
        var author = data[0].a;

        var quoteText = `"${quote}"`;
        if (author) {
          quoteText += ` - ${author}`;
        }

        quoteElement.textContent = quoteText;
      })
      .catch(error => {
        console.log('Error fetching quote:', error);
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
    }, 1000);

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
        var description = data.weather[0].description;

        if (temperatureUnit === "fahrenheit") {
          temperature = (temperature * 9 / 5) + 32;
        }

        temperature = temperature.toFixed(1);

        var weatherText = `Current temperature: ${temperature}${temperatureSymbol} / ${description}`;
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

  function getWallpaperColor() {
    var wallpaperColor = localStorage.getItem("wallpaperColor");
    return wallpaperColor || "#000000";
  }

  function getTextColor() {
    var textColor = localStorage.getItem("textColor");
    return textColor || "#ffffff";
  }

  function getTopSites() {
    var showTopSites = localStorage.getItem("showTopSites");
  
    // Check if the showTopSites option is enabled (default: true)
    if (showTopSites !== "false") {
      chrome.topSites.get(function (topSites) {
        var topSitesContainer = document.querySelector(".top-sites");
  
        // hardcoded for now - make this customizable in future
        for (var i = 0; i < 9 && i < topSites.length; i++) {
          var site = topSites[i];
  
          var siteContainer = document.createElement("a");
          siteContainer.href = site.url;
          siteContainer.classList.add("site-container");
          siteContainer.setAttribute("target", "_blank");
  
          var siteFavicon = document.createElement("img");
          siteFavicon.classList.add("site-favicon");
          siteFavicon.onerror = function () {
            // Fallback to SVG if favicon is not available
            siteFavicon.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='icon icon-tabler icon-tabler-world' width='24' height='24' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'%3E%3C/path%3E%3Cpath d='M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0'%3E%3C/path%3E%3Cpath d='M3.6 9h16.8'%3E%3C/path%3E%3Cpath d='M3.6 15h16.8'%3E%3C/path%3E%3Cpath d='M11.5 3a17 17 0 0 0 0 18'%3E%3C/path%3E%3Cpath d='M12.5 3a17 17 0 0 1 0 18'%3E%3C/path%3E%3C/svg%3E";
          };
          siteFavicon.src = "https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=" + encodeURIComponent(site.url) + "&size=32";
  
          var siteTitle = document.createElement("span");
          siteTitle.classList.add("site-title");
          siteTitle.textContent = site.title;
  
          siteContainer.appendChild(siteFavicon);
          siteContainer.appendChild(siteTitle);
          topSitesContainer.appendChild(siteContainer);

          containerElement.classList.add("show");

        }
      });
    }
  }  

});