import { getSettings } from "./storage.js";
import { detectLocation, fetchWeather, describeWeatherCode } from "./weather.js";
import { mountSettingsForm } from "./settings-form.js";

document.addEventListener("DOMContentLoaded", async () => {
  const quoteEl = document.querySelector(".quote");
  const timeEl = document.querySelector(".time");
  const weatherEl = document.querySelector(".weather");
  const weatherFeelsEl = document.getElementById("weatherFeels");
  const topSitesEl = document.querySelector(".top-sites");
  const containerEl = document.querySelector(".container");

  const trigger = document.getElementById("settingsTrigger");
  const caret = document.getElementById("settingsCaret");
  const popover = document.getElementById("settingsPopover");
  const form = document.getElementById("settingsForm");
  const confirmBox = document.getElementById("settingsConfirm");

  let closeTimer = null;

  const settings = await getSettings();

  applyTheme(settings);
  displayTime();
  setInterval(displayTime, 1000);
  fetchQuote();
  renderTopSites(settings);
  loadWeather(settings);

  trigger.addEventListener("click", () => {
    if (popover.hidden) openPanel();
    else closePanel();
  });

  function openPanel() {
    clearTimeout(closeTimer);
    popover.hidden = false;
    popover.classList.remove("is-closing");
    trigger.classList.add("is-open");
    confirmBox.hidden = true;
    form.hidden = false;
  }

  function closePanel() {
    clearTimeout(closeTimer);
    popover.classList.add("is-closing");
    trigger.classList.remove("is-open");
    closeTimer = setTimeout(() => {
      popover.hidden = true;
    }, 130);
  }

  // Picks black or white text for a given tile background by luminance, so
  // whatever color the user chooses for site tiles stays readable — unlike
  // the page's own wallpaper/text colors, which the user is trusted to pick
  // together, the tile color is a single independent choice with no partner
  // color to check against.
  function contrastColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#000000" : "#ffffff";
  }

  function applyTheme(current) {
    containerEl.style.setProperty("--wallpaper-color", current.wallpaperColor);
    containerEl.style.setProperty("--text-color", current.textColor);
    containerEl.style.setProperty("--site-color", current.siteColor);
    containerEl.style.setProperty("--site-text-color", contrastColor(current.siteColor));
    trigger.style.color = current.textColor;

    // The caret's visible tip sits in the gap between the trigger and the
    // panel, on bare wallpaper — not on the panel itself — so a hardcoded
    // white fill disappears on a white/light wallpaper the same way the
    // site tiles would without their own contrast fix above. .is-banner
    // still overrides this with green while the banner's showing (that
    // rule sets background directly, so it wins over this custom property
    // regardless of what it's set to).
    caret.style.setProperty("--caret-color", contrastColor(current.wallpaperColor));
  }

  function displayTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    timeEl.textContent = `${hours}:${minutes} ${ampm}`;
  }

  function fetchQuote() {
    fetch("https://zenquotes-proxy.supernova3339.workers.dev/")
      .then((res) => res.json())
      .then(([{ q, a }]) => {
        quoteEl.textContent = a ? `"${q}" - ${a}` : `"${q}"`;
      })
      .catch(() => {
        quoteEl.textContent = "";
      });
  }

  // Resolves and caches a location the first time there isn't one saved yet,
  // so later loads (and the settings panel, if opened) read the already-
  // detected value straight from storage instead of re-detecting every time.
  async function loadWeather(current) {
    try {
      let { locationLat, locationLon } = current;
      if (locationLat == null || locationLon == null) {
        weatherEl.textContent = "Detecting your location…";
        const resolved = await detectLocation();
        locationLat = resolved.lat;
        locationLon = resolved.lon;
      }
      const weather = await fetchWeather(locationLat, locationLon, current.tempUnit);
      const temp = Math.round(weather.temperature);
      const feelsLike = Math.round(weather.feelsLike);
      weatherEl.textContent = `${temp}${weather.unitSymbol} · ${describeWeatherCode(weather.weatherCode)}`;

      // Only worth a second line when it actually says something the main
      // line doesn't — a 1-degree difference is just noise.
      if (Math.abs(feelsLike - temp) >= 2) {
        weatherFeelsEl.textContent = `Feels like ${feelsLike}${weather.unitSymbol}`;
        weatherFeelsEl.hidden = false;
      } else {
        weatherFeelsEl.hidden = true;
      }
    } catch (err) {
      weatherEl.textContent = "Unable to load weather";
      weatherFeelsEl.hidden = true;
    }
  }

  function renderTopSites(current) {
    topSitesEl.innerHTML = "";
    if (!current.showTopSites) return;
    chrome.topSites.get((sites) => {
      sites.slice(0, 9).forEach((site) => {
        const link = document.createElement("a");
        link.href = site.url;
        link.target = "_blank";
        link.className = "site-container";

        const favicon = document.createElement("img");
        favicon.className = "site-favicon";
        favicon.alt = "";
        favicon.onerror = () => {
          favicon.src =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' stroke='%23000' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18'/%3E%3C/svg%3E";
        };
        favicon.src = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(site.url)}&size=32`;

        const title = document.createElement("span");
        title.className = "site-title";
        title.textContent = site.title;

        link.append(favicon, title);
        topSitesEl.appendChild(link);
      });
    });
  }

  await mountSettingsForm({
    onThemeChange: (current) => applyTheme(current),
    onSaved: (current) => {
      applyTheme(current);
      renderTopSites(current);
      loadWeather(current);
    },
    onReset: (current) => {
      applyTheme(current);
      renderTopSites(current);
      loadWeather(current);
    },
    onBannerChange: (visible) => caret.classList.toggle("is-banner", visible),
  });
});
