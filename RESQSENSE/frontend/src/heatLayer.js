import L from "leaflet";

if (typeof window !== "undefined") {
  window.L = L;
}

let heatPromise = null;

export function loadHeatmapPlugin() {
  if (typeof window === "undefined") return Promise.resolve(null);
  window.L = L;
  if (L.heatLayer) return Promise.resolve(L.heatLayer);
  if (!heatPromise) {
    heatPromise = import("leaflet.heat").then(() => {
      return L.heatLayer;
    }).catch(err => {
      console.error("Failed to load leaflet.heat:", err);
      return null;
    });
  }
  return heatPromise;
}
