// Bootstrap + a screen-stack router wired into browser history, so "back" is
// consistent across the browser Back button, desktop Escape, and (later) the
// TV remote's Back key. A "screen" is an object:
//   { el, onEnter?(), onKeyDown?(k)->bool, onBack?()->bool, destroy?() }
// Screens are produced by async factories so they can do setup before mount.

import { Platform } from "./platform.js";
import { Input } from "./input.js";
import { Theme } from "./theme.js";
import { HomeScreen } from "./screens/home.js";

const appEl = document.getElementById("app");
const stack = [];

export const Router = {
  current() { return stack[stack.length - 1] || null; },
  depth() { return stack.length; },

  async push(factory, params = {}, { root = false } = {}) {
    const screen = await factory(params);
    stack.push(screen);
    // Root screen replaces the current entry; deeper screens add one. Each push
    // = one history entry, so one "back" = one screen pop.
    if (root) history.replaceState({ helioDepth: stack.length }, "");
    else history.pushState({ helioDepth: stack.length }, "");
    this._mount(screen);
    return screen;
  },

  // Request back (Escape / remote / programmatic). Routed through history so the
  // browser Back button and the hardware Back key share one code path (popstate).
  back() {
    if (stack.length <= 1) return false;
    history.back();
    return true;
  },

  // Pop one screen WITHOUT touching history — only called in response to popstate.
  _popInternal() {
    if (stack.length <= 1) return false;
    const leaving = stack.pop();
    if (leaving && leaving.destroy) leaving.destroy();
    this._mount(this.current());
    return true;
  },

  _mount(screen) {
    appEl.innerHTML = "";
    if (!screen) return;
    appEl.appendChild(screen.el);
    if (screen.onEnter) screen.onEnter();
    Input.refocus(screen.el);
  },
};

// A single back code path: both the browser Back button and Router.back()
// (Escape/remote) trigger popstate; here we pop one screen, or absorb the back
// at the root so we never accidentally navigate out of the app.
window.addEventListener("popstate", () => {
  if (stack.length > 1) {
    Router._popInternal();
  } else {
    history.pushState({ helioDepth: 1 }, ""); // re-arm: stay in the app at root
  }
});

Platform.init();
Theme.init();
Input.init(Router);
// Seed two entries so the very first Back is catchable (lands on our own state).
history.replaceState({ helioDepth: 0 }, "");
history.pushState({ helioDepth: 1 }, "");
Router.push(HomeScreen, {}, { root: true });
