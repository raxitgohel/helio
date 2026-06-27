// Per-item watch progress (resume position), profile-namespaced via Store.
// Keyed by `${type}:${id}`. Used to resume playback and (later) a
// Continue-Watching row.
import { Store } from "../store.js";

const KEY = "watchProgress";
const k = (type, id) => `${type}:${id}`;

export const WatchProgress = {
  all() { return Store.get(KEY, {}) || {}; },

  get(type, id) { return this.all()[k(type, id)] || null; },

  // entry: { type, id, t (seconds), d (duration), title, poster? }
  save(entry) {
    if (!entry || !entry.id || !(entry.t > 0)) return;
    const all = this.all();
    all[k(entry.type, entry.id)] = {
      type: entry.type, id: entry.id, title: entry.title || "",
      poster: entry.poster || null, t: Math.round(entry.t), d: Math.round(entry.d || 0),
      ts: Date.now(),
    };
    Store.set(KEY, all);
  },

  remove(type, id) {
    const all = this.all();
    delete all[k(type, id)];
    Store.set(KEY, all);
  },

  // Most-recent in-progress items (excludes finished, >95%).
  list(limit = 20) {
    return Object.values(this.all())
      .filter((e) => e.d > 0 && e.t / e.d < 0.95)
      .sort((a, b) => b.ts - a.ts)
      .slice(0, limit);
  },
};
