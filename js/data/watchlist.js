// Per-profile watchlist ("My list"). Entries carry enough to reopen the detail
// screen later: the addon that served the meta, type/id, name, poster.
import { Store } from "../store.js";

const KEY = "watchlist";
const k = (type, id) => `${type}:${id}`;

export const Watchlist = {
  all() { return Store.get(KEY, {}) || {}; },

  has(type, id) { return !!this.all()[k(type, id)]; },

  add(e) {
    if (!e || !e.id) return;
    const all = this.all();
    all[k(e.type, e.id)] = {
      type: e.type, id: e.id, name: e.name || "",
      poster: e.poster || null, addonBaseUrl: e.addonBaseUrl || null, ts: Date.now(),
    };
    Store.set(KEY, all);
  },

  remove(type, id) {
    const all = this.all();
    delete all[k(type, id)];
    Store.set(KEY, all);
  },

  // Returns the new state: true = now on the list.
  toggle(e) {
    if (this.has(e.type, e.id)) { this.remove(e.type, e.id); return false; }
    this.add(e);
    return true;
  },

  list() { return Object.values(this.all()).sort((a, b) => b.ts - a.ts); },
};
