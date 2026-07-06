// Local persistence. All user data is namespaced by the ACTIVE profile id
// (`helio:p:<id>:<key>`), so each profile keeps its own addons, watchlist,
// progress, and theme. The profile list + active id are global (not namespaced).

const GKEY_PROFILES = "helio:profiles";
const GKEY_ACTIVE = "helio:activeProfile";

function gGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (_) { return fallback; }
}
function gSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
}

export const Profiles = {
  list() {
    const l = gGet(GKEY_PROFILES, null);
    return Array.isArray(l) && l.length ? l : [{ id: "1", name: "Profile 1" }];
  },

  activeId() {
    const id = String(gGet(GKEY_ACTIVE, "1"));
    return this.list().some((p) => String(p.id) === id) ? id : String(this.list()[0].id);
  },

  active() { return this.list().find((p) => String(p.id) === this.activeId()); },

  setActive(id) {
    if (this.list().some((p) => String(p.id) === String(id))) gSet(GKEY_ACTIVE, String(id));
  },

  // Auto-named ("Profile N") so creation needs no text entry on a TV remote.
  add() {
    const l = this.list();
    const id = String(Math.max(0, ...l.map((p) => Number(p.id) || 0)) + 1);
    const profile = { id, name: `Profile ${id}` };
    gSet(GKEY_PROFILES, [...l, profile]);
    return profile;
  },

  // Removes the profile AND purges its namespaced data. The active profile
  // can't be removed (UI enforces it too); the last profile never goes away.
  remove(id) {
    if (String(id) === this.activeId()) return false;
    let l = this.list().filter((p) => String(p.id) !== String(id));
    if (l.length === 0) l = [{ id: "1", name: "Profile 1" }];
    gSet(GKEY_PROFILES, l);
    const prefix = `helio:p:${id}:`;
    try {
      Object.keys(localStorage).filter((k) => k.startsWith(prefix))
        .forEach((k) => localStorage.removeItem(k));
    } catch (_) {}
    return true;
  },
};

const nsKey = (key) => `helio:p:${Profiles.activeId()}:${key}`;

export const Store = {
  profileId() { return Profiles.activeId(); },

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(nsKey(key));
      return raw == null ? fallback : JSON.parse(raw);
    } catch (_) { return fallback; }
  },

  set(key, value) {
    try { localStorage.setItem(nsKey(key), JSON.stringify(value)); } catch (_) {}
  },

  remove(key) {
    try { localStorage.removeItem(nsKey(key)); } catch (_) {}
  },
};
