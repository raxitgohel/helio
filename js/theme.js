// Color themes (from the "Soft Index" design). Each theme is a set of CSS
// variables defined in css/app.css under html[data-theme="<id>"]; here we only
// hold the metadata for the picker and persist/apply the chosen id.
import { Store } from "./store.js";

const KEY = "theme";
const DEFAULT = "midnight";

export const THEMES = [
  { id: "midnight", name: "Midnight Velvet", note: "Dark plum · peach — premium night-in", swatches: ["#1a1620", "#ff9e7a", "#e86a96", "#b78cff"] },
  { id: "coral", name: "Coral Blush", note: "Warm cream · coral — bright & friendly", swatches: ["#f8f1ea", "#ef8a5d", "#d8607a", "#9a6fbf"] },
  { id: "mulberry", name: "Mulberry Dusk", note: "Lavender paper · magenta — moody evening", swatches: ["#f3eef6", "#c2548a", "#8a5cc4", "#6f5bd0"] },
  { id: "forest", name: "Forest Supper", note: "Sage · terracotta — cosy & earthy", swatches: ["#f1f0e6", "#d9774a", "#c99a3e", "#5f8c6a"] },
  { id: "seafoam", name: "Seafoam Soda", note: "Cool mint · coral pop — fresh & playful", swatches: ["#e9f3ef", "#ff7a66", "#2bb39a", "#3aa0c4"] },
];

export const Theme = {
  list() { return THEMES; },
  active() {
    const id = Store.get(KEY, DEFAULT);
    return THEMES.some((t) => t.id === id) ? id : DEFAULT;
  },
  apply(id) {
    const valid = THEMES.some((t) => t.id === id) ? id : DEFAULT;
    document.documentElement.setAttribute("data-theme", valid);
  },
  set(id) {
    if (!THEMES.some((t) => t.id === id)) return;
    Store.set(KEY, id);
    this.apply(id);
  },
  init() { this.apply(this.active()); },
};
