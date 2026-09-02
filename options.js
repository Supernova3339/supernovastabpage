import { mountSettingsForm } from "./settings-form.js";

// Same luminance check newtab.js uses for the caret and top-sites tile
// text — here it decides whether this standalone options card should flip
// to its dark token set (settings.css) to match the saved wallpaper.
function contrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#ffffff";
}

document.addEventListener("DOMContentLoaded", async () => {
  const card = document.querySelector(".options-card");

  function applyPanelTheme(current) {
    card.classList.toggle("theme-dark", contrastColor(current.wallpaperColor) === "#000000");
  }

  const { getSettings } = await mountSettingsForm({
    onThemeChange: applyPanelTheme,
    onSaved: applyPanelTheme,
    onReset: applyPanelTheme,
  });

  applyPanelTheme(getSettings());
});
