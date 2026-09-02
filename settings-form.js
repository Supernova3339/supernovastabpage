import { DEFAULTS, getSettings, setSettings, resetSettings } from "./storage.js";
import { detectLocation, setManualLocation } from "./weather.js";

// Wires up the settings form fields that live inside #settingsPanel (the
// anchored dropdown on the new tab page) or inside the standalone options
// page — both pages ship the same markup for these fields, so this is the
// one place that logic is written.
export async function mountSettingsForm({ onSaved, onReset, onThemeChange, onBannerChange } = {}) {
  const banner = document.getElementById("settingsBanner");
  const bannerText = document.getElementById("settingsBannerText");
  const bannerClose = document.getElementById("settingsBannerClose");

  const confirmBox = document.getElementById("settingsConfirm");
  const form = document.getElementById("settingsForm");
  const resetOpen = document.getElementById("resetOpen");
  const resetCancel = document.getElementById("resetCancel");
  const resetConfirmBtn = document.getElementById("resetConfirm");

  const locationDisplay = document.getElementById("locationDisplay");
  const locationLabelEl = document.getElementById("locationLabel");
  const locationDetecting = document.getElementById("locationDetecting");
  const locationEdit = document.getElementById("locationEdit");
  const locationInput = document.getElementById("locationInput");
  const locationDetectBtn = document.getElementById("locationDetect");
  const locationChangeBtn = document.getElementById("locationChange");
  const locationError = document.getElementById("locationError");

  const unitF = document.getElementById("unitF");
  const unitC = document.getElementById("unitC");
  const wallpaperInput = document.getElementById("wallpaperColor");
  const textInput = document.getElementById("textColor");
  const siteInput = document.getElementById("siteColor");
  const wallpaperHex = document.getElementById("wallpaperHex");
  const textHex = document.getElementById("textHex");
  const siteHex = document.getElementById("siteColorHex");
  const topSitesCheckbox = document.getElementById("showTopSites");
  const topSitesBox = document.getElementById("showTopSitesBox");

  let settings = await getSettings();
  let bannerTimer = null;

  function showBanner(message) {
    clearTimeout(bannerTimer);
    bannerText.textContent = message;
    banner.hidden = false;
    banner.classList.remove("is-closing");
    onBannerChange && onBannerChange(true);
    bannerTimer = setTimeout(hideBanner, 2000);
  }

  function hideBanner(immediate) {
    clearTimeout(bannerTimer);
    if (banner.hidden) return;
    onBannerChange && onBannerChange(false);
    if (immediate) {
      banner.hidden = true;
      return;
    }
    banner.classList.add("is-closing");
    bannerTimer = setTimeout(() => {
      banner.hidden = true;
    }, 160);
  }

  bannerClose.addEventListener("click", () => hideBanner());

  function renderLocationState(mode = settings.location ? "display" : "edit") {
    locationDisplay.hidden = mode !== "display";
    locationDetecting.hidden = mode !== "detecting";
    locationEdit.hidden = mode !== "edit";
    locationError.hidden = true;
    if (mode === "display") locationLabelEl.textContent = settings.location;
    if (mode === "edit") locationInput.value = settings.location || "";
  }

  locationChangeBtn.addEventListener("click", () => renderLocationState("edit"));

  locationDetectBtn.addEventListener("click", async () => {
    renderLocationState("detecting");
    try {
      const resolved = await detectLocation();
      settings = { ...settings, location: resolved.label, locationLat: resolved.lat, locationLon: resolved.lon };
      renderLocationState("display");
    } catch (err) {
      renderLocationState("edit");
      locationError.hidden = false;
      locationError.textContent = "Couldn't detect your location. Try entering a city.";
    }
  });

  async function commitManualLocation() {
    const value = locationInput.value.trim();
    if (!value) return;
    locationError.hidden = true;
    try {
      const resolved = await setManualLocation(value);
      settings = { ...settings, location: resolved.label, locationLat: resolved.lat, locationLon: resolved.lon };
      renderLocationState("display");
    } catch (err) {
      locationError.hidden = false;
      locationError.textContent = "Couldn't find that location.";
    }
  }

  locationInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitManualLocation();
    }
  });
  locationInput.addEventListener("blur", commitManualLocation);

  function renderUnits() {
    unitF.classList.toggle("is-active", settings.tempUnit === "f");
    unitC.classList.toggle("is-active", settings.tempUnit === "c");
  }

  unitF.addEventListener("click", () => {
    settings.tempUnit = "f";
    renderUnits();
  });
  unitC.addEventListener("click", () => {
    settings.tempUnit = "c";
    renderUnits();
  });

  wallpaperInput.addEventListener("input", () => {
    settings.wallpaperColor = wallpaperInput.value;
    wallpaperHex.textContent = wallpaperInput.value;
    onThemeChange && onThemeChange(settings);
  });

  textInput.addEventListener("input", () => {
    settings.textColor = textInput.value;
    textHex.textContent = textInput.value;
    onThemeChange && onThemeChange(settings);
  });

  siteInput.addEventListener("input", () => {
    settings.siteColor = siteInput.value;
    siteHex.textContent = siteInput.value;
    onThemeChange && onThemeChange(settings);
  });

  function renderCheckbox() {
    topSitesCheckbox.checked = settings.showTopSites;
    topSitesBox.classList.toggle("is-checked", settings.showTopSites);
  }

  topSitesCheckbox.addEventListener("change", () => {
    settings.showTopSites = topSitesCheckbox.checked;
    renderCheckbox();
  });

  function populateForm() {
    renderLocationState();
    renderUnits();
    wallpaperInput.value = settings.wallpaperColor;
    textInput.value = settings.textColor;
    siteInput.value = settings.siteColor;
    wallpaperHex.textContent = settings.wallpaperColor;
    textHex.textContent = settings.textColor;
    siteHex.textContent = settings.siteColor;
    renderCheckbox();
  }

  // The panel reads storage once at mount time, but the new-tab page also
  // auto-detects a location in the background on first launch and writes it
  // back afterward — without this, a panel that was already open (or opened
  // while that detection is still in flight) never finds out and is stuck
  // showing the stale/empty location. Skipped while the user has the manual
  // input focused so an incoming write can't clobber what they're typing.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    let locationChanged = false;
    for (const key of ["location", "locationLat", "locationLon"]) {
      if (key in changes) {
        settings[key] = changes[key].newValue;
        locationChanged = true;
      }
    }
    if (locationChanged && document.activeElement !== locationInput) {
      renderLocationState();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await setSettings(settings);
    showBanner("Settings saved");
    onSaved && onSaved(settings);
  });

  resetOpen.addEventListener("click", () => {
    hideBanner(true);
    form.hidden = true;
    confirmBox.hidden = false;
  });

  resetCancel.addEventListener("click", () => {
    confirmBox.hidden = true;
    form.hidden = false;
  });

  resetConfirmBtn.addEventListener("click", async () => {
    await resetSettings();
    settings = { ...DEFAULTS };
    populateForm();
    confirmBox.hidden = true;
    form.hidden = false;
    showBanner("Reset to defaults");
    onThemeChange && onThemeChange(settings);
    onReset && onReset(settings);
  });

  populateForm();

  return {
    getSettings: () => settings,
  };
}
