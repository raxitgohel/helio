// Bootstrap + a minimal screen-stack router. A "screen" is an object:
//   { el, onEnter?(), onKeyDown?(k)->bool, onBack?()->bool, destroy?() }
// Screens are produced by async factories so they can do setup before mount.

import { Platform } from "./platform.js";
import { Input } from "./input.js";
import { HomeScreen } from "./screens/home.js";

const appEl = document.getElementById("app");
const stack = [];

export const Router = {
  current() { return stack[stack.length - 1] || null; },

  async push(factory, params = {}) {
    const screen = await factory(params);
    stack.push(screen);
    this._render(screen);
    return screen;
  },

  back() {
    if (stack.length <= 1) return false;
    const leaving = stack.pop();
    if (leaving && leaving.destroy) leaving.destroy();
    this._render(this.current());
    return true;
  },

  _render(screen) {
    appEl.innerHTML = "";
    if (!screen) return;
    appEl.appendChild(screen.el);
    if (screen.onEnter) screen.onEnter();
    Input.refocus(screen.el);
  },
};

Platform.init();
Input.init(Router);
Router.push(HomeScreen);
