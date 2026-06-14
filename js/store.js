// Local persistence. Keys are namespaced by profile id from day one
// (`helio:p:<id>:<key>`), so multi-profile is first-class rather than a retrofit.
// Cycle 1 uses a single fixed profile; ProfileManager arrives in a later cycle.

const PROFILE_ID = "1";
const nsKey = (key) => `helio:p:${PROFILE_ID}:${key}`;

export const Store = {
  profileId() { return PROFILE_ID; },

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(nsKey(key));
      return raw == null ? fallback : JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  },

  set(key, value) {
    try { localStorage.setItem(nsKey(key), JSON.stringify(value)); } catch (_) {}
  },

  remove(key) {
    try { localStorage.removeItem(nsKey(key)); } catch (_) {}
  },
};
