export const DEFAULTS = {
  wallpaperColor: "#000000",
  textColor: "#ffffff",
  siteColor: "#ffffff",
  location: "",
  locationLat: null,
  locationLon: null,
  tempUnit: "f",
  showTopSites: true,
};

export function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULTS, resolve);
  });
}

export function setSettings(partial) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(partial, resolve);
  });
}

export function resetSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.set(DEFAULTS, resolve);
  });
}
