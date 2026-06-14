// Centralized D-pad navigation — the deliberate improvement over Nuvio, where
// each screen owned its own movement logic. Here screens just create `.focusable`
// elements with onclick handlers; this engine handles all arrow movement
// (by on-screen geometry), Enter (activate), and Back (router pop).

import { Platform } from "./platform.js";

export const Input = {
  router: null,

  init(router) {
    this.router = router;
    document.addEventListener("keydown", (e) => this._onKey(e), true);
    // Mouse is handy during browser-first development: clicking focuses + activates.
    document.addEventListener("click", (e) => {
      const el = e.target.closest && e.target.closest(".focusable");
      const screen = this.router.current();
      if (el && screen && screen.el.contains(el)) this.setFocus(screen.el, el);
    }, true);
  },

  _onKey(e) {
    const screen = this.router.current();
    if (!screen) return;

    // Let text fields keep the keyboard; only Escape blurs them.
    const t = e.target;
    const editable = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    if (editable) {
      const k0 = Platform.normalizeKey(e);
      if (k0.code === 27 || k0.key === "Escape") { t.blur(); e.preventDefault(); }
      return;
    }

    const k = Platform.normalizeKey(e);

    if (k.isBack) {
      e.preventDefault();
      if (screen.onBack && screen.onBack()) return; // screen consumed it
      this.router.back();
      return;
    }

    // Optional per-screen override (e.g. player: Enter = play/pause).
    if (screen.onKeyDown && screen.onKeyDown(k)) { e.preventDefault(); return; }

    if (k.isEnter) {
      e.preventDefault();
      const f = this.focused(screen.el);
      if (f) f.click();
      return;
    }

    if (k.isArrow) {
      e.preventDefault();
      this.move(screen.el, k.dir);
    }
  },

  focusables(root) {
    return Array.from(root.querySelectorAll(".focusable"))
      .filter((el) => el.offsetParent !== null); // visible only
  },

  focused(root) { return root.querySelector(".focusable.focused"); },

  setFocus(root, el) {
    this.focusables(root).forEach((n) => n.classList.remove("focused"));
    el.classList.add("focused");
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  },

  // Focus the first focusable if nothing is focused yet (called on screen mount).
  refocus(root) {
    if (this.focused(root)) return;
    const first = this.focusables(root)[0];
    if (first) this.setFocus(root, first);
  },

  move(root, dir) {
    const items = this.focusables(root);
    if (items.length === 0) return;
    const cur = this.focused(root);
    if (!cur) { this.setFocus(root, items[0]); return; }
    const next = this._pick(cur, items, dir);
    if (next) this.setFocus(root, next);
  },

  // Pick the nearest focusable in `dir`: minimize travel along the axis, with a
  // penalty for cross-axis drift so movement stays in a sensible line.
  _pick(cur, items, dir) {
    const a = cur.getBoundingClientRect();
    const ax = a.left + a.width / 2;
    const ay = a.top + a.height / 2;
    let best = null;
    let bestScore = Infinity;
    for (const el of items) {
      if (el === cur) continue;
      const b = el.getBoundingClientRect();
      const dx = (b.left + b.width / 2) - ax;
      const dy = (b.top + b.height / 2) - ay;
      let primary, cross;
      if (dir === "left") { if (dx >= -1) continue; primary = -dx; cross = Math.abs(dy); }
      else if (dir === "right") { if (dx <= 1) continue; primary = dx; cross = Math.abs(dy); }
      else if (dir === "up") { if (dy >= -1) continue; primary = -dy; cross = Math.abs(dx); }
      else { if (dy <= 1) continue; primary = dy; cross = Math.abs(dx); }
      const score = primary + cross * 2;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    return best;
  },
};
